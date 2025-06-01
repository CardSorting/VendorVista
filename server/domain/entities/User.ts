import { RoleType } from "../../../shared/schema.js";

export interface UserProps {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles: RoleType[];
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = { ...props };
  }

  get id(): number {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get fullName(): string {
    const firstName = this.props.firstName || '';
    const lastName = this.props.lastName || '';
    return `${firstName} ${lastName}`.trim() || this.props.username;
  }

  get roles(): RoleType[] {
    return [...this.props.roles];
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  hasRole(role: RoleType): boolean {
    return this.props.roles.includes(role);
  }

  isBuyer(): boolean {
    return this.hasRole('buyer');
  }

  isSeller(): boolean {
    return this.hasRole('seller');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  canCreateArtwork(): boolean {
    return this.isSeller() || this.isAdmin();
  }

  canManageProducts(): boolean {
    return this.isSeller() || this.isAdmin();
  }

  canPurchase(): boolean {
    return this.isBuyer() || this.isSeller() || this.isAdmin();
  }

  addRole(role: RoleType): void {
    if (!this.hasRole(role)) {
      this.props.roles.push(role);
    }
  }

  removeRole(role: RoleType): void {
    this.props.roles = this.props.roles.filter(r => r !== role);
  }

  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): UserProps {
    return { ...this.props };
  }
}