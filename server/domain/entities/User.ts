// Domain Entity - Core business logic
export class User {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly email: string,
    private _password: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly isArtist: boolean = false,
    public readonly avatarUrl?: string,
    public readonly bio?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  get password(): string {
    return this._password;
  }

  updatePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    this._password = newPassword;
  }

  getFullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  promoteToArtist(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this._password,
      this.firstName,
      this.lastName,
      true,
      this.avatarUrl,
      this.bio,
      this.createdAt
    );
  }
}