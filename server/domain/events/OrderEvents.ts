// Order Domain Events
import { DomainEvent } from '../common/Entity.js';
import { OrderStatus } from '../aggregates/OrderAggregate.js';

export class OrderCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'OrderCreated';

  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly totalAmount: number
  ) {
    this.occurredOn = new Date();
  }
}

export class OrderStatusChangedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'OrderStatusChanged';

  constructor(
    public readonly orderId: number,
    public readonly newStatus: OrderStatus
  ) {
    this.occurredOn = new Date();
  }
}

export class OrderShippedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'OrderShipped';

  constructor(
    public readonly orderId: number,
    public readonly trackingNumber: string
  ) {
    this.occurredOn = new Date();
  }
}

export class OrderCancelledEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'OrderCancelled';

  constructor(
    public readonly orderId: number,
    public readonly reason?: string
  ) {
    this.occurredOn = new Date();
  }
}

export class OrderRefundedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'OrderRefunded';

  constructor(
    public readonly orderId: number,
    public readonly refundAmount: number
  ) {
    this.occurredOn = new Date();
  }
}