// CQRS Query Handlers following SOLID principles
import { IQueryHandler } from '../../common/ICommandHandler.js';
import { User } from '../../../domain/entities/User.js';
import { Artist } from '../../../domain/entities/Artist.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { IArtistRepository } from '../../../domain/repositories/IArtistRepository.js';
import { IArtworkRepository } from '../../../domain/repositories/IArtworkRepository.js';
import {
  GetUserByIdQuery,
  GetUserByEmailQuery,
  GetUserByUsernameQuery,
  GetArtistByIdQuery,
  GetArtistByUserIdQuery,
  GetFeaturedArtistsQuery,
  GetArtistsQuery
} from '../UserQueries.js';

// Single Responsibility: Each handler handles one specific query
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, User | null> {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<User | null> {
    return await this.userRepository.findById(query.userId);
  }
}

export class GetUserByEmailQueryHandler implements IQueryHandler<GetUserByEmailQuery, User | null> {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserByEmailQuery): Promise<User | null> {
    return await this.userRepository.findByEmail(query.email);
  }
}

export class GetUserByUsernameQueryHandler implements IQueryHandler<GetUserByUsernameQuery, User | null> {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserByUsernameQuery): Promise<User | null> {
    return await this.userRepository.findByUsername(query.username);
  }
}

export class GetArtistByIdQueryHandler implements IQueryHandler<GetArtistByIdQuery, Artist | null> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(query: GetArtistByIdQuery): Promise<Artist | null> {
    return await this.artistRepository.findById(query.artistId);
  }
}

export class GetArtistByUserIdQueryHandler implements IQueryHandler<GetArtistByUserIdQuery, Artist | null> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(query: GetArtistByUserIdQuery): Promise<Artist | null> {
    return await this.artistRepository.findByUserId(query.userId);
  }
}

export class GetFeaturedArtistsQueryHandler implements IQueryHandler<GetFeaturedArtistsQuery, Artist[]> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(query: GetFeaturedArtistsQuery): Promise<Artist[]> {
    return await this.artistRepository.getFeatured(query.limit);
  }
}

export class GetArtistsQueryHandler implements IQueryHandler<GetArtistsQuery, Artist[]> {
  constructor(private artistRepository: IArtistRepository) {}

  async handle(query: GetArtistsQuery): Promise<Artist[]> {
    return await this.artistRepository.findAll(query.limit, query.offset);
  }
}