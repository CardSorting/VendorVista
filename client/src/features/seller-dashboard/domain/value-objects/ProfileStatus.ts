/**
 * Profile Status Value Object - Represents the operational status of a seller profile
 * Follows Apple's clear and meaningful state management philosophy
 */

export class ProfileStatus {
  private constructor(
    private readonly status: 'active' | 'inactive' | 'suspended' | 'pending',
    private readonly reason?: string
  ) {}

  static active(): ProfileStatus {
    return new ProfileStatus('active');
  }

  static inactive(reason?: string): ProfileStatus {
    return new ProfileStatus('inactive', reason);
  }

  static suspended(reason: string): ProfileStatus {
    return new ProfileStatus('suspended', reason);
  }

  static pending(reason?: string): ProfileStatus {
    return new ProfileStatus('pending', reason);
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isInactive(): boolean {
    return this.status === 'inactive';
  }

  get isSuspended(): boolean {
    return this.status === 'suspended';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get value(): string {
    return this.status;
  }

  get statusReason(): string | undefined {
    return this.reason;
  }

  canPerformActions(): boolean {
    return this.isActive;
  }

  toString(): string {
    return this.reason ? `${this.status}: ${this.reason}` : this.status;
  }

  equals(other: ProfileStatus): boolean {
    return this.status === other.status && this.reason === other.reason;
  }
}