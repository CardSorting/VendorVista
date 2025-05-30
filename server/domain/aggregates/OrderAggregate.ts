// Order Aggregate Root - Following DDD and Apple's design philosophy
import { Entity } from '../common/Entity.js';
import { Money } from '../common/ValueObjects.js';
import { OrderCreatedEvent, OrderStatusChangedEvent, OrderShippedEvent } from '../events/OrderEvents.js';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export class OrderItem {
  constructor(
    public readonly productId: number,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly productName: string,
    public readonly artworkTitle: string,
    public readonly artistName: string
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
  }

  get totalPrice(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}

export class ShippingAddress {
  constructor(
    public readonly fullName: string,
    public readonly addressLine1: string,
    public readonly addressLine2: string | null,
    public readonly city: string,
    public readonly state: string,
    public readonly postalCode: string,
    public readonly country: string
  ) {
    if (!fullName?.trim()) throw new Error('Full name is required');
    if (!addressLine1?.trim()) throw new Error('Address line 1 is required');
    if (!city?.trim()) throw new Error('City is required');
    if (!state?.trim()) throw new Error('State is required');
    if (!postalCode?.trim()) throw new Error('Postal code is required');
    if (!country?.trim()) throw new Error('Country is required');
  }

  toString(): string {
    return [
      this.fullName,
      this.addressLine1,
      this.addressLine2,
      `${this.city}, ${this.state} ${this.postalCode}`,
      this.country
    ].filter(Boolean).join('\n');
  }
}

export class Order extends Entity<number> {
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _totalAmount: Money;
  private _shippingAddress: ShippingAddress | null;
  private _trackingNumber: string | null;
  private _paymentIntentId: string | null;
  private readonly _userId: number;
  private readonly _createdAt: Date;

  private constructor(
    id: number,
    userId: number,
    items: OrderItem[],
    status: OrderStatus = OrderStatus.PENDING,
    shippingAddress: ShippingAddress | null = null,
    trackingNumber: string | null = null,
    paymentIntentId: string | null = null,
    createdAt: Date = new Date()
  ) {
    super(id);
    this._userId = userId;
    this._items = items;
    this._status = status;
    this._shippingAddress = shippingAddress;
    this._trackingNumber = trackingNumber;
    this._paymentIntentId = paymentIntentId;
    this._createdAt = createdAt;
    this._totalAmount = this.calculateTotal();
  }

  // Factory method for creating new orders
  static create(
    id: number,
    userId: number,
    items: OrderItem[],
    shippingAddress: ShippingAddress
  ): Order {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const order = new Order(id, userId, items, OrderStatus.PENDING, shippingAddress);
    order.addDomainEvent(new OrderCreatedEvent(id, userId, order.totalAmount.amount));
    
    return order;
  }

  // Factory method for reconstructing orders from persistence
  static fromPersistence(
    id: number,
    userId: number,
    items: OrderItem[],
    status: string,
    shippingAddress: ShippingAddress | null,
    trackingNumber: string | null,
    paymentIntentId: string | null,
    createdAt: Date
  ): Order {
    const orderStatus = Object.values(OrderStatus).includes(status as OrderStatus) 
      ? status as OrderStatus 
      : OrderStatus.PENDING;
    
    return new Order(id, userId, items, orderStatus, shippingAddress, trackingNumber, paymentIntentId, createdAt);
  }

  // Getters
  get userId(): number {
    return this._userId;
  }

  get items(): readonly OrderItem[] {
    return [...this._items];
  }

  get status(): OrderStatus {
    return this._status;
  }

  get totalAmount(): Money {
    return this._totalAmount;
  }

  get shippingAddress(): ShippingAddress | null {
    return this._shippingAddress;
  }

  get trackingNumber(): string | null {
    return this._trackingNumber;
  }

  get paymentIntentId(): string | null {
    return this._paymentIntentId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business methods
  confirm(paymentIntentId: string): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }

    this._status = OrderStatus.CONFIRMED;
    this._paymentIntentId = paymentIntentId;
    this.addDomainEvent(new OrderStatusChangedEvent(this.id, OrderStatus.CONFIRMED));
  }

  startProcessing(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error('Only confirmed orders can be processed');
    }

    this._status = OrderStatus.PROCESSING;
    this.addDomainEvent(new OrderStatusChangedEvent(this.id, OrderStatus.PROCESSING));
  }

  ship(trackingNumber: string): void {
    if (this._status !== OrderStatus.PROCESSING) {
      throw new Error('Only processing orders can be shipped');
    }

    if (!trackingNumber?.trim()) {
      throw new Error('Tracking number is required');
    }

    this._status = OrderStatus.SHIPPED;
    this._trackingNumber = trackingNumber.trim();
    this.addDomainEvent(new OrderShippedEvent(this.id, trackingNumber));
  }

  deliver(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new Error('Only shipped orders can be delivered');
    }

    this._status = OrderStatus.DELIVERED;
    this.addDomainEvent(new OrderStatusChangedEvent(this.id, OrderStatus.DELIVERED));
  }

  cancel(): void {
    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(this._status)) {
      throw new Error('Cannot cancel shipped, delivered, or already cancelled orders');
    }

    this._status = OrderStatus.CANCELLED;
    this.addDomainEvent(new OrderStatusChangedEvent(this.id, OrderStatus.CANCELLED));
  }

  refund(): void {
    if (this._status !== OrderStatus.DELIVERED) {
      throw new Error('Only delivered orders can be refunded');
    }

    this._status = OrderStatus.REFUNDED;
    this.addDomainEvent(new OrderStatusChangedEvent(this.id, OrderStatus.REFUNDED));
  }

  updateShippingAddress(shippingAddress: ShippingAddress): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Can only update shipping address for pending orders');
    }

    this._shippingAddress = shippingAddress;
  }

  canBeCancelled(): boolean {
    return ![OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(this._status);
  }

  canBeRefunded(): boolean {
    return this._status === OrderStatus.DELIVERED;
  }

  private calculateTotal(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.totalPrice),
      new Money(0)
    );
  }
}