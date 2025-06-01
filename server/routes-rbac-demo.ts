import { Express } from "express";
import { requireAuth, requireSeller, requireAdmin, requireSellerOrAdmin } from "./middleware/simple-auth";
import { Auth0RoleManager } from "./auth0-setup";

export function registerRBACDemoRoutes(app: Express) {
  // Demo route to show different access levels
  app.get("/api/rbac/demo", requireAuth, async (req, res) => {
    try {
      const auth0User = req.oidc.user;
      
      // Initialize Auth0 Role Manager to fetch actual user roles
      const auth0Domain = process.env.AUTH0_DOMAIN || 'dev-57c4wim3kish0u23.us.auth0.com';
      const auth0ClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
      const auth0ClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
      const auth0Audience = process.env.AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`;

      let userRoles = ['buyer']; // Default role
      let roleDetails = [];

      if (auth0ClientId && auth0ClientSecret && auth0User?.sub) {
        try {
          const roleManager = new Auth0RoleManager({
            domain: auth0Domain,
            clientId: auth0ClientId,
            clientSecret: auth0ClientSecret,
            audience: auth0Audience
          });

          // Fetch user roles from Auth0 Management API
          const userRolesResponse = await roleManager.getUserRoles(auth0User.sub);
          if (userRolesResponse && userRolesResponse.length > 0) {
            userRoles = userRolesResponse.map((role: any) => role.name);
            roleDetails = userRolesResponse;
          }
        } catch (error) {
          console.warn('Failed to fetch user roles from Auth0:', error);
        }
      }
      
      res.json({
        message: "RBAC Demo - Your current access level",
        userId: auth0User?.sub,
        user: {
          email: auth0User?.email,
          roles: userRoles
        },
        roleDetails: roleDetails,
        permissions: {
          canViewProducts: true,
          canCreateArtwork: userRoles.includes('seller') || userRoles.includes('admin'),
          canManageUsers: userRoles.includes('admin'),
          canAccessAdminPanel: userRoles.includes('admin')
        }
      });
    } catch (error) {
      console.error('Error in RBAC demo endpoint:', error);
      res.status(500).json({ error: 'Failed to retrieve user permissions' });
    }
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