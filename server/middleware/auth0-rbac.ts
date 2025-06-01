import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

export class Auth0RBACMiddleware {
  
  // Simple authentication check
  requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.oidc.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Extract Auth0 user info and roles
    const auth0User = req.oidc.user;
    req.user = {
      id: auth0User.sub, // Auth0 user ID
      email: auth0User.email,
      username: auth0User.nickname || auth0User.email,
      roles: auth0User['https://artistmarket.com/roles'] || ['buyer'], // Custom claim for roles
      permissions: auth0User['https://artistmarket.com/permissions'] || []
    };
    
    next();
  };

  // Role-based access control
  requireRole = (requiredRole: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!req.user.roles.includes(requiredRole)) {
        return res.status(403).json({ 
          error: `Access denied. Required role: ${requiredRole}`,
          userRoles: req.user.roles 
        });
      }

      next();
    };
  };

  // Permission-based access control
  requirePermission = (permission: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!req.user.permissions.includes(permission)) {
        return res.status(403).json({ 
          error: `Access denied. Required permission: ${permission}`,
          userPermissions: req.user.permissions 
        });
      }

      next();
    };
  };

  // Convenience methods for common roles
  requireBuyer = this.requireRole('buyer');
  requireSeller = this.requireRole('seller');
  requireAdmin = this.requireRole('admin');

  // Check if user can perform actions based on role hierarchy
  canCreateArtwork = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const allowedRoles = ['seller', 'admin'];
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: "Only sellers and admins can create artwork",
        userRoles: req.user.roles 
      });
    }

    next();
  };

  canManageProducts = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const allowedRoles = ['seller', 'admin'];
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: "Only sellers and admins can manage products",
        userRoles: req.user.roles 
      });
    }

    next();
  };

  // Admin-only access
  adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ 
        error: "Admin access required",
        userRoles: req.user.roles 
      });
    }

    next();
  };
}

export const auth0RBAC = new Auth0RBACMiddleware();