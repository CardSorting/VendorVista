import { User, RoleType } from "../../../shared/schema.js";

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, updates: Partial<User>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
  deactivate(id: number): Promise<boolean>;
  activate(id: number): Promise<boolean>;
}

export interface IRoleRepository {
  getUserRoles(userId: number): Promise<RoleType[]>;
  assignUserRole(userId: number, role: string): Promise<void>;
  removeUserRole(userId: number, role: string): Promise<void>;
  hasRole(userId: number, role: string): Promise<boolean>;
}