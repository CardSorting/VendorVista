/**
 * User ID Value Object - Immutable identifier for users
 * Ensures type safety and validation following Apple's precision philosophy
 */

export class UserId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    if (value.length > 255) {
      throw new Error('UserId cannot exceed 255 characters');
    }
  }

  static from(value: string): UserId {
    return new UserId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}