import bcrypt from 'bcryptjs';
import { CreateUserCommand, CreateArtistCommand } from '../commands/CreateUserCommand.js';
import { User } from '../../domain/entities/User.js';
import { Artist } from '../../domain/entities/Artist.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IArtistRepository } from '../../domain/repositories/IArtistRepository.js';

// Command Handler following CQRS pattern
export class UserCommandHandler {
  constructor(
    private userRepository: IUserRepository,
    private artistRepository: IArtistRepository
  ) {}

  async createUser(command: CreateUserCommand): Promise<User> {
    // Business logic validation
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(command.username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(command.password, 10);

    // Create domain entity
    const user = new User(
      0, // ID will be assigned by repository
      command.username,
      command.email,
      hashedPassword,
      command.firstName,
      command.lastName,
      false,
      command.avatarUrl,
      command.bio
    );

    return await this.userRepository.save(user);
  }

  async createArtist(command: CreateArtistCommand): Promise<Artist> {
    // Verify user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already an artist
    const existingArtist = await this.artistRepository.findByUserId(command.userId);
    if (existingArtist) {
      throw new Error('User is already an artist');
    }

    // Create domain entity
    const artist = new Artist(
      0, // ID will be assigned by repository
      command.userId,
      command.displayName,
      command.bio,
      command.specialties || [],
      command.portfolioUrl
    );

    // Promote user to artist
    const updatedUser = user.promoteToArtist();
    await this.userRepository.update(user.id, updatedUser);

    return await this.artistRepository.save(artist);
  }
}