import { User } from "../entities/User.js";
import { Permission } from "../value-objects/Permission.js";
import { ResourceType, ActionType, RoleType } from "../../../shared/schema.js";

export interface IAuthorizationService {
  hasPermission(user: User, permission: Permission): boolean;
  hasResourceAccess(user: User, resource: ResourceType, action: ActionType): boolean;
  canAccessResource(user: User, resourceId: number, resource: ResourceType): Promise<boolean>;
  getRolePermissions(role: RoleType): Permission[];
}

export class AuthorizationService implements IAuthorizationService {
  private rolePermissions: Map<RoleType, Permission[]>;

  constructor() {
    this.rolePermissions = new Map();
    this.initializeRolePermissions();
  }

  private initializeRolePermissions(): void {
    // Buyer permissions
    this.rolePermissions.set('buyer', [
      Permission.readUser(),
      Permission.updateUser(),
      Permission.readArtwork(),
      Permission.readProduct(),
      Permission.createOrder(),
      Permission.readOrder(),
      Permission.readCart(),
      Permission.updateCart(),
      new Permission('review', 'create'),
      new Permission('review', 'read'),
      new Permission('review', 'update'),
    ]);

    // Seller permissions (includes buyer permissions)
    this.rolePermissions.set('seller', [
      ...this.getRolePermissions('buyer'),
      Permission.createArtwork(),
      Permission.updateArtwork(),
      Permission.deleteArtwork(),
      Permission.createProduct(),
      Permission.updateProduct(),
      Permission.deleteProduct(),
      Permission.manageOrder(),
      new Permission('artist', 'create'),
      new Permission('artist', 'read'),
      new Permission('artist', 'update'),
    ]);

    // Admin permissions (full access)
    this.rolePermissions.set('admin', [
      ...this.getRolePermissions('seller'),
      Permission.deleteUser(),
      Permission.manageAdmin(),
      new Permission('user', 'manage'),
      new Permission('artist', 'manage'),
      new Permission('order', 'delete'),
      new Permission('review', 'delete'),
      new Permission('review', 'manage'),
    ]);
  }

  hasPermission(user: User, permission: Permission): boolean {
    if (!user.isActive) {
      return false;
    }

    return user.roles.some(role => {
      const rolePermissions = this.getRolePermissions(role);
      return rolePermissions.some(p => p.equals(permission));
    });
  }

  hasResourceAccess(user: User, resource: ResourceType, action: ActionType): boolean {
    const permission = new Permission(resource, action);
    return this.hasPermission(user, permission);
  }

  async canAccessResource(user: User, resourceId: number, resource: ResourceType): Promise<boolean> {
    // Basic ownership and permission checks
    switch (resource) {
      case 'user':
        return user.id === resourceId || user.isAdmin();
      
      case 'artwork':
      case 'product':
        // Sellers can access their own resources, admins can access all
        if (user.isAdmin()) return true;
        if (!user.isSeller()) return false;
        // TODO: Add ownership check by querying the database
        return true;
      
      case 'order':
        // Users can access their own orders, sellers can access orders for their products
        if (user.isAdmin()) return true;
        // TODO: Add ownership/involvement check
        return true;
      
      case 'cart':
        // Users can only access their own cart
        return user.id === resourceId || user.isAdmin();
      
      default:
        return user.isAdmin();
    }
  }

  getRolePermissions(role: RoleType): Permission[] {
    return this.rolePermissions.get(role) || [];
  }

  // Role hierarchy validation
  canAssignRole(assigningUser: User, targetRole: RoleType): boolean {
    if (!assigningUser.isAdmin()) {
      return false;
    }

    // Admins can assign any role
    return true;
  }

  // Business rules
  canUpgradeToSeller(user: User): boolean {
    return user.isBuyer() && user.isActive;
  }

  canDowngradeFromSeller(user: User): boolean {
    // TODO: Check if user has active products or pending orders
    return user.isSeller();
  }

  validateRoleTransition(fromRole: RoleType, toRole: RoleType): boolean {
    // Define valid role transitions
    const validTransitions: Record<RoleType, RoleType[]> = {
      'buyer': ['seller'],
      'seller': ['buyer'],
      'admin': ['buyer', 'seller']
    };

    return validTransitions[fromRole]?.includes(toRole) || false;
  }
}