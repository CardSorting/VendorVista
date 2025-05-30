// Domain Entity - Following DDD and SOLID principles
import { Entity } from '../common/Entity.js';
import { Email, Username } from '../common/ValueObjects.js';
import { UserCreatedEvent, UserPromotedToArtistEvent, UserPasswordChangedEvent } from '../events/UserEvents.js';

export class User extends Entity<number> {
  private _email: Email;
  private _username: Username;
  private _password: string;
  private _firstName?: string;
  private _lastName?: string;
  private _isArtist: boolean;
  private _avatarUrl?: string;
  private _bio?: string;
  private readonly _createdAt: Date;

  private constructor(
    id: number,
    email: Email,
    username: Username,
    password: string,
    firstName?: string,
    lastName?: string,
    isArtist: boolean = false,
    avatarUrl?: string,
    bio?: string,
    createdAt: Date = new Date()
  ) {
    super(id);
    this._email = email;
    this._username = username;
    this._password = password;
    this._firstName = firstName;
    this._lastName = lastName;
    this._isArtist = isArtist;
    this._avatarUrl = avatarUrl;
    this._bio = bio;
    this._createdAt = createdAt;
  }

  // Factory method for creating new users
  static create(
    id: number,
    emailValue: string,
    usernameValue: string,
    password: string,
    firstName?: string,
    lastName?: string,
    avatarUrl?: string,
    bio?: string
  ): User {
    const email = new Email(emailValue);
    const username = new Username(usernameValue);
    
    const user = new User(id, email, username, password, firstName, lastName, false, avatarUrl, bio);
    user.addDomainEvent(new UserCreatedEvent(id, emailValue, usernameValue));
    
    return user;
  }

  // Factory method for reconstructing users from persistence
  static fromPersistence(
    id: number,
    emailValue: string,
    usernameValue: string,
    password: string,
    firstName?: string,
    lastName?: string,
    isArtist: boolean = false,
    avatarUrl?: string,
    bio?: string,
    createdAt: Date = new Date()
  ): User {
    const email = new Email(emailValue);
    const username = new Username(usernameValue);
    
    return new User(id, email, username, password, firstName, lastName, isArtist, avatarUrl, bio, createdAt);
  }

  // Getters
  get email(): string {
    return this._email.value;
  }

  get username(): string {
    return this._username.value;
  }

  get password(): string {
    return this._password;
  }

  get firstName(): string | undefined {
    return this._firstName;
  }

  get lastName(): string | undefined {
    return this._lastName;
  }

  get isArtist(): boolean {
    return this._isArtist;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business methods
  updatePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    this._password = newPassword;
    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }

  getFullName(): string {
    return [this._firstName, this._lastName].filter(Boolean).join(' ');
  }

  promoteToArtist(): User {
    if (this._isArtist) {
      throw new Error('User is already an artist');
    }
    
    const promotedUser = new User(
      this.id,
      this._email,
      this._username,
      this._password,
      this._firstName,
      this._lastName,
      true,
      this._avatarUrl,
      this._bio,
      this._createdAt
    );
    
    promotedUser.addDomainEvent(new UserPromotedToArtistEvent(this.id, this.id));
    return promotedUser;
  }

  updateProfile(firstName?: string, lastName?: string, bio?: string, avatarUrl?: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._bio = bio;
    this._avatarUrl = avatarUrl;
  }

  changeEmail(newEmailValue: string): void {
    const newEmail = new Email(newEmailValue);
    this._email = newEmail;
  }
}