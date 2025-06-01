import { eq, and } from "drizzle-orm";
import { db } from "../../db.js";
import { users, userRoles, roles, User, RoleType } from "../../../shared/schema.js";
import { IUserRepository, IRoleRepository } from "./IUserRepository.js";

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await db.insert(users).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    return await db.select().from(users).limit(limit).offset(offset);
  }

  async deactivate(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async activate(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id));
    return result.rowCount > 0;
  }
}

export class RoleRepository implements IRoleRepository {
  async getUserRoles(userId: number): Promise<RoleType[]> {
    const result = await db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)));
    
    return result.map(r => r.name as RoleType);
  }

  async assignUserRole(userId: number, roleName: string): Promise<void> {
    // First, get the role ID
    const roleResult = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (!roleResult[0]) {
      throw new Error(`Role ${roleName} not found`);
    }

    // Check if assignment already exists
    const existing = await db.select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleResult[0].id)))
      .limit(1);

    if (existing[0]) {
      // Update to active if exists
      await db.update(userRoles)
        .set({ isActive: true, assignedAt: new Date() })
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleResult[0].id)));
    } else {
      // Create new assignment
      await db.insert(userRoles).values({
        userId,
        roleId: roleResult[0].id,
        isActive: true,
        assignedAt: new Date()
      });
    }
  }

  async removeUserRole(userId: number, roleName: string): Promise<void> {
    const roleResult = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (!roleResult[0]) {
      throw new Error(`Role ${roleName} not found`);
    }

    await db.update(userRoles)
      .set({ isActive: false })
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleResult[0].id)));
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(userRoles.userId, userId),
        eq(roles.name, roleName),
        eq(userRoles.isActive, true)
      ))
      .limit(1);

    return result.length > 0;
  }
}