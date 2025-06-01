import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userRoles?: string[];
}

// Simple role checking middleware using Auth0's user object
export const requireRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.oidc.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const auth0User = req.oidc.user;
    if (!auth0User) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    // Extract roles from Auth0 custom claims (namespace required by Auth0)
    const userRoles = auth0User['https://artistmarket.com/roles'] || ['buyer'];
    req.userRoles = userRoles;

    if (!userRoles.includes(requiredRole)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${requiredRole}`,
        currentRoles: userRoles 
      });
    }

    next();
  };
};

// Convenience functions for common access patterns
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export const requireSeller = requireRole('seller');
export const requireAdmin = requireRole('admin');

export const requireSellerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const auth0User = req.oidc.user;
  if (!auth0User) {
    return res.status(401).json({ error: "Invalid authentication" });
  }

  const userRoles = auth0User['https://artistmarket.com/roles'] || ['buyer'];
  req.userRoles = userRoles;

  if (!userRoles.includes('seller') && !userRoles.includes('admin')) {
    return res.status(403).json({ 
      error: "Access denied. Seller or admin role required",
      currentRoles: userRoles 
    });
  }

  next();
};