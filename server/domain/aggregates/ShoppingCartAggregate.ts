// Shopping Cart Aggregate Root - Following DDD and Apple's design philosophy
import { Entity } from '../common/Entity.js';
import { Money } from '../common/ValueObjects.js';
import { CartItemAddedEvent, CartItemRemovedEvent, CartClearedEvent } from '../events/CartEvents.js';

export class CartItem {
  constructor(
    public readonly productId: number,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly productName: string,
    public readonly artworkTitle: string,
    public readonly artistName: string,
    public readonly imageUrl: string
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    if (quantity > 10) {
      throw new Error('Maximum quantity per item is 10');
    }
  }

  get totalPrice(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  updateQuantity(newQuantity: number): CartItem {
    return new CartItem(
      this.productId,
      newQuantity,
      this.unitPrice,
      this.productName,
      this.artworkTitle,
      this.artistName,
      this.imageUrl
    );
  }
}

export class ShoppingCart extends Entity<number> {
  private _items: Map<number, CartItem>;
  private readonly _userId: number;
  private _updatedAt: Date;

  private constructor(
    id: number,
    userId: number,
    items: CartItem[] = [],
    updatedAt: Date = new Date()
  ) {
    super(id);
    this._userId = userId;
    this._items = new Map(items.map(item => [item.productId, item]));
    this._updatedAt = updatedAt;
  }

  // Factory method for creating new shopping carts
  static create(id: number, userId: number): ShoppingCart {
    return new ShoppingCart(id, userId);
  }

  // Factory method for reconstructing carts from persistence
  static fromPersistence(
    id: number,
    userId: number,
    items: CartItem[],
    updatedAt: Date = new Date()
  ): ShoppingCart {
    return new ShoppingCart(id, userId, items, updatedAt);
  }

  // Getters
  get userId(): number {
    return this._userId;
  }

  get items(): readonly CartItem[] {
    return Array.from(this._items.values());
  }

  get itemCount(): number {
    return Array.from(this._items.values()).reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalAmount(): Money {
    return Array.from(this._items.values()).reduce(
      (total, item) => total.add(item.totalPrice),
      new Money(0)
    );
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isEmpty(): boolean {
    return this._items.size === 0;
  }

  // Business methods
  addItem(
    productId: number,
    quantity: number,
    unitPrice: Money,
    productName: string,
    artworkTitle: string,
    artistName: string,
    imageUrl: string
  ): void {
    const existingItem = this._items.get(productId);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > 10) {
        throw new Error('Maximum quantity per item is 10');
      }
      
      const updatedItem = existingItem.updateQuantity(newQuantity);
      this._items.set(productId, updatedItem);
    } else {
      const newItem = new CartItem(
        productId,
        quantity,
        unitPrice,
        productName,
        artworkTitle,
        artistName,
        imageUrl
      );
      this._items.set(productId, newItem);
    }

    this._updatedAt = new Date();
    this.addDomainEvent(new CartItemAddedEvent(this.id, productId, quantity));
  }

  updateItemQuantity(productId: number, quantity: number): void {
    const existingItem = this._items.get(productId);
    if (!existingItem) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    if (quantity > 10) {
      throw new Error('Maximum quantity per item is 10');
    }

    const updatedItem = existingItem.updateQuantity(quantity);
    this._items.set(productId, updatedItem);
    this._updatedAt = new Date();
  }

  removeItem(productId: number): void {
    const existingItem = this._items.get(productId);
    if (!existingItem) {
      throw new Error('Item not found in cart');
    }

    this._items.delete(productId);
    this._updatedAt = new Date();
    this.addDomainEvent(new CartItemRemovedEvent(this.id, productId));
  }

  clear(): void {
    if (this._items.size === 0) {
      return;
    }

    this._items.clear();
    this._updatedAt = new Date();
    this.addDomainEvent(new CartClearedEvent(this.id));
  }

  hasItem(productId: number): boolean {
    return this._items.has(productId);
  }

  getItem(productId: number): CartItem | undefined {
    return this._items.get(productId);
  }

  validateForCheckout(): void {
    if (this.isEmpty) {
      throw new Error('Cart is empty');
    }

    if (this.totalAmount.amount < 1) {
      throw new Error('Minimum order amount is $1.00');
    }

    // Check for maximum cart value
    if (this.totalAmount.amount > 10000) {
      throw new Error('Maximum order amount is $10,000.00');
    }
  }
}