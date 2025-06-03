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
}