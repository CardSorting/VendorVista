import { ResourceType, ActionType } from "../../../shared/schema.js";

export class Permission {
  private readonly _resource: ResourceType;
  private readonly _action: ActionType;
  private readonly _name: string;

  constructor(resource: ResourceType, action: ActionType, name?: string) {
    this._resource = resource;
    this._action = action;
    this._name = name || `${resource}:${action}`;
  }

  get resource(): ResourceType {
    return this._resource;
  }

  get action(): ActionType {
    return this._action;
  }

  get name(): string {
    return this._name;
  }

  equals(other: Permission): boolean {
    return this._resource === other._resource && this._action === other._action;
  }

  toString(): string {
    return this._name;
  }

  // Static factory methods for common permissions
  static createUser(): Permission {
    return new Permission('user', 'create');
  }

  static readUser(): Permission {
    return new Permission('user', 'read');
  }

  static updateUser(): Permission {
    return new Permission('user', 'update');
  }

  static deleteUser(): Permission {
    return new Permission('user', 'delete');
  }

  static manageArtwork(): Permission {
    return new Permission('artwork', 'manage');
  }

  static createArtwork(): Permission {
    return new Permission('artwork', 'create');
  }

  static readArtwork(): Permission {
    return new Permission('artwork', 'read');
  }

  static updateArtwork(): Permission {
    return new Permission('artwork', 'update');
  }

  static deleteArtwork(): Permission {
    return new Permission('artwork', 'delete');
  }

  static manageProduct(): Permission {
    return new Permission('product', 'manage');
  }

  static createProduct(): Permission {
    return new Permission('product', 'create');
  }

  static readProduct(): Permission {
    return new Permission('product', 'read');
  }

  static updateProduct(): Permission {
    return new Permission('product', 'update');
  }

  static deleteProduct(): Permission {
    return new Permission('product', 'delete');
  }

  static manageOrder(): Permission {
    return new Permission('order', 'manage');
  }

  static createOrder(): Permission {
    return new Permission('order', 'create');
  }

  static readOrder(): Permission {
    return new Permission('order', 'read');
  }

  static updateOrder(): Permission {
    return new Permission('order', 'update');
  }

  static readCart(): Permission {
    return new Permission('cart', 'read');
  }

  static updateCart(): Permission {
    return new Permission('cart', 'update');
  }

  static manageAdmin(): Permission {
    return new Permission('admin', 'manage');
  }
}