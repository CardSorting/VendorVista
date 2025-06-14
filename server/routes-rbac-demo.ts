import { Express } from "express";
import { requireAuth, requireSeller, requireAdmin, requireSellerOrAdmin } from "./middleware/simple-auth";

export function registerRBACDemoRoutes(app: Express) {
  // Demo route to show different access levels
  app.get("/api/rbac/demo", requireAuth, (req, res) => {
    const auth0User = req.oidc.user;
    const userRoles = auth0User?.['https://artistmarket.com/roles'] || ['buyer'];
    
    res.json({
      message: "RBAC Demo - Your current access level",
      user: {
        email: auth0User?.email,
        roles: userRoles
      },
      permissions: {
        canViewProducts: true, // All authenticated users
        canCreateArtwork: userRoles.includes('seller') || userRoles.includes('admin'),
        canManageUsers: userRoles.includes('admin'),
        canAccessAdminPanel: userRoles.includes('admin')
      }
    });
  });

  // Buyer-accessible endpoint (all authenticated users)
  app.get("/api/rbac/buyer-area", requireAuth, (req, res) => {
    res.json({
      message: "Welcome to the buyer area!",
      features: ["Browse products", "Add to cart", "Place orders", "Write reviews"]
    });
  });

  // Seller-only endpoint
  app.get("/api/rbac/seller-area", requireSeller, (req, res) => {
    res.json({
      message: "Welcome to the seller dashboard!",
      features: ["Create artwork", "Manage products", "View sales analytics", "Process orders"]
    });
  });

  // Admin-only endpoint
  app.get("/api/rbac/admin-area", requireAdmin, (req, res) => {
    res.json({
      message: "Welcome to the admin panel!",
      features: ["Manage all users", "System settings", "Analytics", "Content moderation"]
    });
  });

  // Seller or Admin endpoint
  app.get("/api/rbac/content-management", requireSellerOrAdmin, (req, res) => {
    res.json({
      message: "Content Management Area",
      features: ["Create/edit content", "Manage inventory", "Customer support"]
    });
  });

  // Role assignment helper (for testing - in production this would be done through Auth0 dashboard)
  app.post("/api/rbac/simulate-role", requireAuth, (req, res) => {
    const { role } = req.body;
    const validRoles = ['buyer', 'seller', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
        validRoles
      });
    }

    res.json({
      message: `Role simulation: In a real application, you would assign the '${role}' role through Auth0 dashboard`,
      instructions: {
        step1: "Go to Auth0 Dashboard > User Management > Roles",
        step2: "Create roles: buyer, seller, admin",
        step3: "Assign roles to users",
        step4: "Add custom claims to include roles in JWT tokens"
      },
      currentSimulation: {
        email: req.oidc.user?.email,
        simulatedRole: role
      }
    });
  });
}