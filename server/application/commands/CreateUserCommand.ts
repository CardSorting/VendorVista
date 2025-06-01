import { RoleType } from "../../../shared/schema.js";

export interface CreateUserCommand {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: RoleType;
}

export interface CreateUserResult {
  success: boolean;
  userId?: number;
  error?: string;
}