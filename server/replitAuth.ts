import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage-replit";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  console.log("OIDC Claims received:", JSON.stringify(claims, null, 2));
  
  const user = await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    username: claims["preferred_username"] || claims["username"],
    firstName: claims["given_name"] || claims["first_name"] || claims["name"]?.split(" ")[0] || "",
    lastName: claims["family_name"] || claims["last_name"] || claims["name"]?.split(" ").slice(1).join(" ") || "",
    avatarUrl: claims["picture"] || claims["profile_image_url"] || claims["avatar_url"],
  });

  // Assign default role based on user type
  await assignDefaultRole(user.id, claims["email"]);
}

async function assignDefaultRole(userId: string, email: string) {
  try {
    // Check if user already has roles
    const existingRoles = await storage.getUserRoles(userId);
    
    if (existingRoles.length === 0) {
      // Determine role based on email or default to seller
      const isAdmin = email?.includes("admin") || email?.includes("support");
      const defaultRole = isAdmin ? "admin" : "seller";
      
      await storage.assignUserRole(userId, defaultRole);
      console.log(`Assigned default role '${defaultRole}' to user ${userId}`);
    }
  } catch (error) {
    console.error("Failed to assign default role:", error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add localhost for development
  if (process.env.NODE_ENV === "development") {
    domains.push("localhost:5000");
  }
  
  for (const domain of domains) {
    const protocol = domain.includes("localhost") ? "http" : "https";
    const strategy = new Strategy(
      {
        name: `replitauth:${domain.split(":")[0]}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `${protocol}://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as any;

    if (!req.isAuthenticated() || !user || !user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (refreshError) {
      console.error('Token refresh error:', refreshError);
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Authentication error" });
    }
    next(error);
  }
};

export const requireRole = (requiredRole: string): RequestHandler => {
  return async (req: any, res, next) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const userRoles = await storage.getUserRoles(userId);
      
      if (!userRoles.includes(requiredRole as any)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};

export const requireAdmin: RequestHandler = requireRole('admin');
export const requireSeller: RequestHandler = requireRole('seller');