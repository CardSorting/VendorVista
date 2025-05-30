import bcrypt from 'bcryptjs';
import { User } from '../entities/User.js';
import { IUserRepository } from '../repositories/IUserRepository.js';

// Domain service for authentication logic
export class AuthenticationService {
  constructor(private userRepository: IUserRepository) {}

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async validateUserCredentials(username: string, email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }
  }

  validatePasswordStrength(password: string): void {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Apple-style simple but effective validation
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain both uppercase and lowercase letters');
    }
  }
}