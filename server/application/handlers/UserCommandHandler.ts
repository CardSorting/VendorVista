// CQRS Command Handlers following SOLID principles and Single Responsibility
import bcrypt from 'bcryptjs';
import { 
  CreateUserCommand, 
  CreateArtistCommand, 
  UpdateUserProfileCommand,
  PromoteUserToArtistCommand,
  VerifyArtistCommand,
  FollowArtistCommand,
  UnfollowArtistCommand 
} from '../commands/CreateUserCommand.js';
import { User } from '../../domain/entities/User.js';
import { Artist } from '../../domain/entities/Artist.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IArtistRepository } from '../../domain/repositories/IArtistRepository.js';
import { ICommandHandler } from '../common/ICommandHandler.js';

// Single Responsibility: Each handler handles one specific command
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(private userRepository: IUserRepository) {}

  async handle(command: CreateUserCommand): Promise<User> {
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

    // Create domain entity using factory method
    const user = User.create(
      0, // ID will be assigned by repository
      command.email,
      command.username,
      hashedPassword,
      command.firstName,
      command.lastName,
      command.avatarUrl,
      command.bio
    );

    return await this.userRepository.save(user);
  }
}

export class CreateArtistCommandHandler implements ICommandHandler<CreateArtistCommand, Artist> {
  constructor(
    private userRepository: IUserRepository,
    private artistRepository: IArtistRepository
  ) {}

  async handle(command: CreateArtistCommand): Promise<Artist> {
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

    // Create domain entity using factory method
    const artist = Artist.create(
      0, // ID will be assigned by repository
      command.userId,
      command.displayName,
      command.bio,
      command.specialties || [],
      command.portfolioUrl
    );

    // Promote user to artist
    const updatedUser = user.promoteToArtist();
    await this.userRepository.save(updatedUser);

    return await this.artistRepository.save(artist);
  }
}

export class UpdateUserProfileCommandHandler implements ICommandHandler<UpdateUserProfileCommand, User> {
  constructor(private userRepository: IUserRepository) {}

  async handle(command: UpdateUserProfileCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateProfile(
      command.firstName,
      command.lastName,
      command.bio,
      command.avatarUrl
    );

    return await this.userRepository.save(user);
  }
}

export class VerifyArtistCommandHandler implements ICommandHandler<VerifyArtistCommand, void> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(command: VerifyArtistCommand): Promise<void> {
    const artist = await this.artistRepository.findById(command.artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    artist.verify();
    await this.artistRepository.save(artist);
  }
}

export class FollowArtistCommandHandler implements ICommandHandler<FollowArtistCommand, void> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(command: FollowArtistCommand): Promise<void> {
    const artist = await this.artistRepository.findById(command.artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    artist.incrementFollowers(command.followerId);
    await this.artistRepository.save(artist);
  }
}

export class UnfollowArtistCommandHandler implements ICommandHandler<UnfollowArtistCommand, void> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(command: UnfollowArtistCommand): Promise<void> {
    const artist = await this.artistRepository.findById(command.artistId);
    if (!artist) {
      throw new Error('Artist not found');
    }

    artist.decrementFollowers();
    await this.artistRepository.save(artist);
  }
}

// Legacy wrapper for backward compatibility
export class UserCommandHandler {
  constructor(
    private createUserHandler: CreateUserCommandHandler,
    private createArtistHandler: CreateArtistCommandHandler,
    private updateUserProfileHandler: UpdateUserProfileCommandHandler
  ) {}

  async createUser(command: CreateUserCommand): Promise<User> {
    return this.createUserHandler.handle(command);
  }

  async createArtist(command: CreateArtistCommand): Promise<Artist> {
    return this.createArtistHandler.handle(command);
  }

  async updateUserProfile(command: UpdateUserProfileCommand): Promise<User> {
    return this.updateUserProfileHandler.handle(command);
  }
}