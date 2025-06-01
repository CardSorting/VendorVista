import { Request, Response, NextFunction } from "express";
import { User } from "../domain/entities/User.js";
import { AuthorizationService } from "../domain/services/AuthorizationService.js";
import { Permission } from "../domain/value-objects/Permission.js";
import { UserRepository, RoleRepository } from "../infrastructure/repositories/UserRepository.js";
import { ResourceType, ActionType } from "../../shared/schema.js";

export interface AuthorizedRequest extends Request {
  user?: User;
  hasPermission?: (resource: ResourceType, action: ActionType) => boolean;
  canAccessResource?: (resourceId: number, resource: ResourceType) => Promise<boolean>;
}

export class AuthorizationMiddleware {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;
  private authorizationService: AuthorizationService;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.authorizationService = new AuthorizationService();
  }

  authenticate = async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const auth0User = req.oidc.user;
      const userData = await this.userRepository.findByEmail(auth0User.email);
      
      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      const userRoles = await this.roleRepository.getUserRoles(userData.id);
      const user = new User({
        ...userData,
        roles: userRoles,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt)
      });

      req.user = user;
      
      // Add helper methods to request
      req.hasPermission = (resource: ResourceType, action: ActionType) => {
        return this.authorizationService.hasResourceAccess(user, resource, action);
      };

      req.canAccessResource = async (resourceId: number, resource: ResourceType) => {
        return this.authorizationService.canAccessResource(user, resourceId, resource);
      };

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  requireRole = (requiredRole: string) => {
    return (req: AuthorizedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!req.user.hasRole(requiredRole as any)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    };
  };

  requirePermission = (resource: ResourceType, action: ActionType) => {
    return (req: AuthorizedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const permission = new Permission(resource, action);
      if (!this.authorizationService.hasPermission(req.user, permission)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    };
  };

  requireAdmin = (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!req.user.isAdmin()) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  };

  requireSeller = (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!req.user.isSeller() && !req.user.isAdmin()) {
      return res.status(403).json({ error: "Seller access required" });
    }

    next();
  };

  requireOwnershipOrAdmin = (resourceIdParam: string, resource: ResourceType) => {
    return async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const resourceId = parseInt(req.params[resourceIdParam]);
      if (isNaN(resourceId)) {
        return res.status(400).json({ error: "Invalid resource ID" });
      }

      const canAccess = await req.canAccessResource!(resourceId, resource);
      if (!canAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    };
  };
}