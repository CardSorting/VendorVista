// Dependency Injection Container following SOLID principles
import { InMemoryUserRepository } from './persistence/InMemoryUserRepository.js';
import { UserCommandHandler } from '../application/handlers/UserCommandHandler.js';
import { AuthenticationService } from '../domain/services/AuthenticationService.js';
import { IUserRepository } from '../domain/repositories/IUserRepository.js';
import { IArtistRepository } from '../domain/repositories/IArtistRepository.js';
import { IArtworkRepository } from '../domain/repositories/IArtworkRepository.js';

export class DependencyContainer {
  private static instance: DependencyContainer;
  
  // Repositories
  private _userRepository: IUserRepository;
  private _artistRepository: IArtistRepository;
  private _artworkRepository: IArtworkRepository;
  
  // Services
  private _authenticationService: AuthenticationService;
  
  // Command Handlers
  private _userCommandHandler: UserCommandHandler;

  private constructor() {
    // Initialize repositories
    this._userRepository = new InMemoryUserRepository();
    // Note: We'll create these as we build the complete system
    // this._artistRepository = new InMemoryArtistRepository();
    // this._artworkRepository = new InMemoryArtworkRepository();
    
    // Initialize services
    this._authenticationService = new AuthenticationService(this._userRepository);
    
    // Initialize command handlers
    // this._userCommandHandler = new UserCommandHandler(this._userRepository, this._artistRepository);
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  // Repository getters
  get userRepository(): IUserRepository {
    return this._userRepository;
  }

  get artistRepository(): IArtistRepository {
    return this._artistRepository;
  }

  get artworkRepository(): IArtworkRepository {
    return this._artworkRepository;
  }

  // Service getters
  get authenticationService(): AuthenticationService {
    return this._authenticationService;
  }

  // Command handler getters
  get userCommandHandler(): UserCommandHandler {
    return this._userCommandHandler;
  }
}