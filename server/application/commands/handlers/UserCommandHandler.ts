import bcrypt from "bcryptjs";
import { CreateUserCommand, CreateUserResult } from "../CreateUserCommand.js";
import { User } from "../../domain/entities/User.js";
import { IAuthorizationService } from "../../domain/services/AuthorizationService.js";
import { IUserRepository } from "../../infrastructure/repositories/IUserRepository.js";
import { IRoleRepository } from "../../infrastructure/repositories/IRoleRepository.js";

export class UserCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository,
    private authorizationService: IAuthorizationService
  ) {}

  async createUser(command: CreateUserCommand): Promise<CreateUserResult> {
    try {
      // Validate email uniqueness
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        return { success: false, error: "Email already exists" };
      }

      // Validate username uniqueness
      const existingUsername = await this.userRepository.findByUsername(command.username);
      if (existingUsername) {
        return { success: false, error: "Username already exists" };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(command.password, 12);

      // Create user entity
      const userData = {
        id: 0, // Will be set by repository
        username: command.username,
        email: command.email,
        firstName: command.firstName,
        lastName: command.lastName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [command.role]
      };

      const user = new User(userData);

      // Save user
      const savedUser = await this.userRepository.create({
        username: command.username,
        email: command.email,
        password: hashedPassword,
        firstName: command.firstName,
        lastName: command.lastName,
        isActive: true
      });

      // Assign role
      await this.roleRepository.assignUserRole(savedUser.id, command.role);

      return { success: true, userId: savedUser.id };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: "Internal server error" };
    }
  }

  async assignRole(userId: number, role: string, assignedBy: number): Promise<CreateUserResult> {
    try {
      const assigningUser = await this.userRepository.findById(assignedBy);
      if (!assigningUser) {
        return { success: false, error: "Assigning user not found" };
      }

      const userEntity = new User({
        ...assigningUser,
        roles: await this.roleRepository.getUserRoles(assignedBy)
      });

      if (!this.authorizationService.canAssignRole(userEntity, role as any)) {
        return { success: false, error: "Insufficient permissions to assign role" };
      }

      await this.roleRepository.assignUserRole(userId, role);
      return { success: true, userId };
    } catch (error) {
      console.error("Error assigning role:", error);
      return { success: false, error: "Internal server error" };
    }
  }

  async upgradeToSeller(userId: number): Promise<CreateUserResult> {
    try {
      const userData = await this.userRepository.findById(userId);
      if (!userData) {
        return { success: false, error: "User not found" };
      }

      const userRoles = await this.roleRepository.getUserRoles(userId);
      const user = new User({ ...userData, roles: userRoles });

      if (!this.authorizationService.canUpgradeToSeller(user)) {
        return { success: false, error: "User cannot be upgraded to seller" };
      }

      await this.roleRepository.assignUserRole(userId, 'seller');
      return { success: true, userId };
    } catch (error) {
      console.error("Error upgrading user to seller:", error);
      return { success: false, error: "Internal server error" };
    }
  }
}