// Presentation Layer Controller following Apple's design philosophy
// Clean, focused, and intuitive API design
import { Request, Response } from 'express';
import { 
  CreateUserCommandHandler,
  CreateArtistCommandHandler,
  UpdateUserProfileCommandHandler,
  VerifyArtistCommandHandler,
  FollowArtistCommandHandler,
  UnfollowArtistCommandHandler
} from '../../application/handlers/UserCommandHandler.js';
import {
  GetUserByIdQueryHandler,
  GetUserByEmailQueryHandler,
  GetArtistByIdQueryHandler,
  GetFeaturedArtistsQueryHandler
} from '../../application/queries/handlers/UserQueryHandler.js';
import { insertUserSchema, insertArtistSchema } from '../../../shared/schema.js';
import { z } from 'zod';

export class UserController {
  constructor(
    private createUserHandler: CreateUserCommandHandler,
    private createArtistHandler: CreateArtistCommandHandler,
    private updateUserProfileHandler: UpdateUserProfileCommandHandler,
    private verifyArtistHandler: VerifyArtistCommandHandler,
    private followArtistHandler: FollowArtistCommandHandler,
    private unfollowArtistHandler: UnfollowArtistCommandHandler,
    private getUserByIdHandler: GetUserByIdQueryHandler,
    private getUserByEmailHandler: GetUserByEmailQueryHandler,
    private getArtistByIdHandler: GetArtistByIdQueryHandler,
    private getFeaturedArtistsHandler: GetFeaturedArtistsQueryHandler
  ) {}

  // Command endpoints (write operations)
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const command = insertUserSchema.parse(req.body);
      const user = await this.createUserHandler.handle(command);
      res.status(201).json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async createArtist(req: Request, res: Response): Promise<void> {
    try {
      const command = insertArtistSchema.parse(req.body);
      const artist = await this.createArtistHandler.handle(command);
      res.status(201).json(artist);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const command = { userId, ...req.body };
      const user = await this.updateUserProfileHandler.handle(command);
      res.json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async verifyArtist(req: Request, res: Response): Promise<void> {
    try {
      const artistId = parseInt(req.params.id);
      await this.verifyArtistHandler.handle({ artistId });
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async followArtist(req: Request, res: Response): Promise<void> {
    try {
      const { followerId, artistId } = req.body;
      await this.followArtistHandler.handle({ followerId, artistId });
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async unfollowArtist(req: Request, res: Response): Promise<void> {
    try {
      const { followerId, artistId } = req.body;
      await this.unfollowArtistHandler.handle({ followerId, artistId });
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Query endpoints (read operations)
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.getUserByIdHandler.handle({ userId });
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const email = req.params.email;
      const user = await this.getUserByEmailHandler.handle({ email });
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getArtistById(req: Request, res: Response): Promise<void> {
    try {
      const artistId = parseInt(req.params.id);
      const artist = await this.getArtistByIdHandler.handle({ artistId });
      
      if (!artist) {
        res.status(404).json({ message: 'Artist not found' });
        return;
      }
      
      res.json(artist);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getFeaturedArtists(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const artists = await this.getFeaturedArtistsHandler.handle({ limit });
      res.json(artists);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // Error handling following Apple's approach - Clear, actionable error messages
  private handleError(res: Response, error: any): void {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
      return;
    }

    if (error.message) {
      const statusCode = this.getStatusCodeFromMessage(error.message);
      res.status(statusCode).json({ message: error.message });
      return;
    }

    res.status(500).json({ 
      message: 'An unexpected error occurred. Please try again.' 
    });
  }

  private getStatusCodeFromMessage(message: string): number {
    if (message.includes('already exists') || message.includes('already taken')) {
      return 409; // Conflict
    }
    if (message.includes('not found')) {
      return 404; // Not Found
    }
    if (message.includes('Invalid') || message.includes('must be')) {
      return 400; // Bad Request
    }
    return 500; // Internal Server Error
  }
}