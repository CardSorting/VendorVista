import { User } from '../../domain/entities/User.js';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';

// Infrastructure implementation of User repository
export class InMemoryUserRepository implements IUserRepository {
  private users: Map<number, User> = new Map();
  private currentId = 1;

  async findById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async save(user: User): Promise<User> {
    const newUser = new User(
      this.currentId++,
      user.username,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.isArtist,
      user.avatarUrl,
      user.bio,
      user.createdAt
    );
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return null;
    }

    const updatedUser = new User(
      existingUser.id,
      updates.username ?? existingUser.username,
      updates.email ?? existingUser.email,
      updates.password ?? existingUser.password,
      updates.firstName ?? existingUser.firstName,
      updates.lastName ?? existingUser.lastName,
      updates.isArtist ?? existingUser.isArtist,
      updates.avatarUrl ?? existingUser.avatarUrl,
      updates.bio ?? existingUser.bio,
      existingUser.createdAt
    );

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async delete(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
}