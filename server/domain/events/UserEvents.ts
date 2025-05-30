// Domain Events following the Event Sourcing pattern
import { DomainEvent } from '../common/Entity.js';

export class UserCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'UserCreated';

  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly username: string
  ) {
    this.occurredOn = new Date();
  }
}

export class UserPromotedToArtistEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'UserPromotedToArtist';

  constructor(
    public readonly userId: number,
    public readonly artistId: number
  ) {
    this.occurredOn = new Date();
  }
}

export class UserPasswordChangedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'UserPasswordChanged';

  constructor(
    public readonly userId: number
  ) {
    this.occurredOn = new Date();
  }
}