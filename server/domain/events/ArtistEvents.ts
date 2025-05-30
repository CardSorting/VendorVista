// Artist Domain Events
import { DomainEvent } from '../common/Entity.js';

export class ArtistCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'ArtistCreated';

  constructor(
    public readonly artistId: number,
    public readonly userId: number,
    public readonly displayName: string
  ) {
    this.occurredOn = new Date();
  }
}

export class ArtistVerifiedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'ArtistVerified';

  constructor(
    public readonly artistId: number
  ) {
    this.occurredOn = new Date();
  }
}

export class ArtistFollowedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = 'ArtistFollowed';

  constructor(
    public readonly artistId: number,
    public readonly followerId: number
  ) {
    this.occurredOn = new Date();
  }
}