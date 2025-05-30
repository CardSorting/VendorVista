// Cart Domain Events
import { DomainEvent } from '../common/Entity.js';

export class CartItemAddedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'CartItemAdded';

  constructor(
    public readonly cartId: number,
    public readonly productId: number,
    public readonly quantity: number
  ) {
    this.occurredOn = new Date();
  }
}

export class CartItemRemovedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'CartItemRemoved';

  constructor(
    public readonly cartId: number,
    public readonly productId: number
  ) {
    this.occurredOn = new Date();
  }
}

export class CartClearedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'CartCleared';

  constructor(
    public readonly cartId: number
  ) {
    this.occurredOn = new Date();
  }
}