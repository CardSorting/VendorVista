import { storage } from "./storage-replit";

export async function seedRBAC() {
  try {
    console.log("Setting up RBAC system...");
    
    // Create default roles
    const rolesToCreate = [
      { name: "admin", description: "Full system access" },
      { name: "seller", description: "Can manage products and view analytics" },
      { name: "buyer", description: "Can browse and purchase products" }
    ];

    for (const role of rolesToCreate) {
      try {
        await storage.createRole(role);
        console.log(`Created role: ${role.name}`);
      } catch (error) {
        console.log(`Role ${role.name} already exists`);
      }
    }

    // Create permissions
    const permissionsToCreate = [
      { name: "manage_users", resource: "user", action: "manage", description: "Full user management" },
      { name: "create_products", resource: "product", action: "create", description: "Create new products" },
      { name: "manage_products", resource: "product", action: "manage", description: "Full product management" },
      { name: "view_analytics", resource: "admin", action: "read", description: "View system analytics" },
      { name: "manage_orders", resource: "order", action: "manage", description: "Manage all orders" }
    ];

    for (const permission of permissionsToCreate) {
      try {
        await storage.createPermission(permission);
        console.log(`Created permission: ${permission.name}`);
      } catch (error) {
        console.log(`Permission ${permission.name} already exists`);
      }
    }

    console.log("RBAC system initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RBAC system:", error);
  }
  console.log("Starting RBAC seed...");

  try {
    // Create roles
    const buyerRole = await db.insert(roles).values({
      name: 'buyer',
      description: 'Regular customer who can browse and purchase items',
      isActive: true
    }).onConflictDoNothing().returning();

    const sellerRole = await db.insert(roles).values({
      name: 'seller',
      description: 'Artist or vendor who can create and sell artwork',
      isActive: true
    }).onConflictDoNothing().returning();

    const adminRole = await db.insert(roles).values({
      name: 'admin',
      description: 'Administrator with full system access',
      isActive: true
    }).onConflictDoNothing().returning();

    // Get role IDs
    const allRoles = await db.select().from(roles);
    const buyerRoleId = allRoles.find(r => r.name === 'buyer')?.id;
    const sellerRoleId = allRoles.find(r => r.name === 'seller')?.id;
    const adminRoleId = allRoles.find(r => r.name === 'admin')?.id;

    if (!buyerRoleId || !sellerRoleId || !adminRoleId) {
      throw new Error("Failed to create or find roles");
    }

    // Create permissions
    const permissionsData = [
      // User permissions
      { name: 'user:read', resource: 'user', action: 'read', description: 'Read user information' },
      { name: 'user:update', resource: 'user', action: 'update', description: 'Update user information' },
      { name: 'user:create', resource: 'user', action: 'create', description: 'Create new users' },
      { name: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },
      { name: 'user:manage', resource: 'user', action: 'manage', description: 'Full user management' },

      // Artist permissions
      { name: 'artist:create', resource: 'artist', action: 'create', description: 'Create artist profile' },
      { name: 'artist:read', resource: 'artist', action: 'read', description: 'Read artist information' },
      { name: 'artist:update', resource: 'artist', action: 'update', description: 'Update artist profile' },
      { name: 'artist:manage', resource: 'artist', action: 'manage', description: 'Full artist management' },

      // Artwork permissions
      { name: 'artwork:create', resource: 'artwork', action: 'create', description: 'Create artwork' },
      { name: 'artwork:read', resource: 'artwork', action: 'read', description: 'View artwork' },
      { name: 'artwork:update', resource: 'artwork', action: 'update', description: 'Update artwork' },
      { name: 'artwork:delete', resource: 'artwork', action: 'delete', description: 'Delete artwork' },

      // Product permissions
      { name: 'product:create', resource: 'product', action: 'create', description: 'Create products' },
      { name: 'product:read', resource: 'product', action: 'read', description: 'View products' },
      { name: 'product:update', resource: 'product', action: 'update', description: 'Update products' },
      { name: 'product:delete', resource: 'product', action: 'delete', description: 'Delete products' },
      { name: 'product:manage', resource: 'product', action: 'manage', description: 'Full product management' },

      // Order permissions
      { name: 'order:create', resource: 'order', action: 'create', description: 'Create orders' },
      { name: 'order:read', resource: 'order', action: 'read', description: 'View orders' },
      { name: 'order:update', resource: 'order', action: 'update', description: 'Update orders' },
      { name: 'order:manage', resource: 'order', action: 'manage', description: 'Full order management' },

      // Cart permissions
      { name: 'cart:read', resource: 'cart', action: 'read', description: 'View cart' },
      { name: 'cart:update', resource: 'cart', action: 'update', description: 'Modify cart' },

      // Review permissions
      { name: 'review:create', resource: 'review', action: 'create', description: 'Create reviews' },
      { name: 'review:read', resource: 'review', action: 'read', description: 'View reviews' },
      { name: 'review:update', resource: 'review', action: 'update', description: 'Update reviews' },
      { name: 'review:delete', resource: 'review', action: 'delete', description: 'Delete reviews' },
      { name: 'review:manage', resource: 'review', action: 'manage', description: 'Full review management' },

      // Admin permissions
      { name: 'admin:manage', resource: 'admin', action: 'manage', description: 'Full system administration' }
    ];

    for (const permData of permissionsData) {
      await db.insert(permissions).values(permData).onConflictDoNothing();
    }

    // Get all permissions
    const allPermissions = await db.select().from(permissions);

    // Assign permissions to buyer role
    const buyerPermissionNames = [
      'user:read', 'user:update',
      'artwork:read', 'product:read',
      'order:create', 'order:read',
      'cart:read', 'cart:update',
      'review:create', 'review:read', 'review:update'
    ];

    for (const permName of buyerPermissionNames) {
      const permission = allPermissions.find(p => p.name === permName);
      if (permission) {
        await db.insert(rolePermissions).values({
          roleId: buyerRoleId,
          permissionId: permission.id
        }).onConflictDoNothing();
      }
    }

    // Assign permissions to seller role (includes buyer permissions)
    const sellerPermissionNames = [
      ...buyerPermissionNames,
      'artist:create', 'artist:read', 'artist:update',
      'artwork:create', 'artwork:update', 'artwork:delete',
      'product:create', 'product:update', 'product:delete',
      'order:manage'
    ];

    for (const permName of sellerPermissionNames) {
      const permission = allPermissions.find(p => p.name === permName);
      if (permission) {
        await db.insert(rolePermissions).values({
          roleId: sellerRoleId,
          permissionId: permission.id
        }).onConflictDoNothing();
      }
    }

    // Assign all permissions to admin role
    for (const permission of allPermissions) {
      await db.insert(rolePermissions).values({
        roleId: adminRoleId,
        permissionId: permission.id
      }).onConflictDoNothing();
    }

    console.log("RBAC seed completed successfully!");
    
    // Log summary
    const roleCount = await db.select().from(roles);
    const permissionCount = await db.select().from(permissions);
    const rolePermissionCount = await db.select().from(rolePermissions);
    
    console.log(`Created ${roleCount.length} roles, ${permissionCount.length} permissions, and ${rolePermissionCount.length} role-permission assignments`);
    
  } catch (error) {
    console.error("Error seeding RBAC:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRBAC().then(() => {
    console.log("RBAC seeding complete");
    process.exit(0);
  }).catch((error) => {
    console.error("RBAC seeding failed:", error);
    process.exit(1);
  });
}