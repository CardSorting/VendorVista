import axios from 'axios';

interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
}

export class Auth0RoleManager {
  private config: Auth0Config;
  private accessToken: string | null = null;

  constructor(config: Auth0Config) {
    this.config = config;
  }

  async getManagementToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await axios.post(`https://${this.config.domain}/oauth/token`, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        audience: `https://${this.config.domain}/api/v2/`,
        grant_type: 'client_credentials'
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get Auth0 management token: ${error}`);
    }
  }

  async createRole(name: string, description: string): Promise<any> {
    const token = await this.getManagementToken();
    
    try {
      const response = await axios.post(
        `https://${this.config.domain}/api/v2/roles`,
        {
          name,
          description
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Role already exists, fetch it
        return await this.getRoleByName(name);
      }
      throw new Error(`Failed to create role ${name}: ${error.response?.data?.message || error.message}`);
    }
  }

  async getRoleByName(name: string): Promise<any> {
    const token = await this.getManagementToken();
    
    try {
      const response = await axios.get(
        `https://${this.config.domain}/api/v2/roles?name_filter=${name}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data[0];
    } catch (error) {
      throw new Error(`Failed to get role ${name}: ${error}`);
    }
  }

  async createPermission(resource: string, action: string, description: string): Promise<any> {
    const token = await this.getManagementToken();
    const identifier = `${resource}:${action}`;
    
    try {
      const response = await axios.post(
        `https://${this.config.domain}/api/v2/resource-servers/${this.config.audience}/scopes`,
        {
          value: identifier,
          description
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        return { value: identifier, description };
      }
      throw new Error(`Failed to create permission ${identifier}: ${error.response?.data?.message || error.message}`);
    }
  }

  async assignPermissionsToRole(roleId: string, permissions: string[]): Promise<void> {
    const token = await this.getManagementToken();
    
    try {
      await axios.post(
        `https://${this.config.domain}/api/v2/roles/${roleId}/permissions`,
        {
          permissions: permissions.map(permission => ({
            resource_server_identifier: this.config.audience,
            permission_name: permission
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      throw new Error(`Failed to assign permissions to role: ${error.response?.data?.message || error.message}`);
    }
  }

  async setupDefaultRoles(): Promise<void> {
    console.log('Setting up Auth0 roles and permissions...');

    // Create roles
    const buyerRole = await this.createRole('buyer', 'Regular customer who can browse and purchase items');
    const sellerRole = await this.createRole('seller', 'Artist or vendor who can create and sell artwork');
    const adminRole = await this.createRole('admin', 'Administrator with full system access');

    // Create permissions
    const permissions = [
      { resource: 'artwork', action: 'read', description: 'View artwork' },
      { resource: 'artwork', action: 'create', description: 'Create artwork' },
      { resource: 'artwork', action: 'update', description: 'Update artwork' },
      { resource: 'artwork', action: 'delete', description: 'Delete artwork' },
      { resource: 'product', action: 'read', description: 'View products' },
      { resource: 'product', action: 'create', description: 'Create products' },
      { resource: 'product', action: 'update', description: 'Update products' },
      { resource: 'product', action: 'delete', description: 'Delete products' },
      { resource: 'order', action: 'create', description: 'Create orders' },
      { resource: 'order', action: 'read', description: 'View orders' },
      { resource: 'order', action: 'manage', description: 'Manage all orders' },
      { resource: 'cart', action: 'read', description: 'View cart' },
      { resource: 'cart', action: 'update', description: 'Modify cart' },
      { resource: 'user', action: 'read', description: 'View user profiles' },
      { resource: 'user', action: 'update', description: 'Update user profiles' },
      { resource: 'user', action: 'manage', description: 'Manage all users' },
      { resource: 'admin', action: 'access', description: 'Access admin panel' }
    ];

    for (const perm of permissions) {
      await this.createPermission(perm.resource, perm.action, perm.description);
    }

    // Assign permissions to roles
    const buyerPermissions = [
      'artwork:read', 'product:read', 'order:create', 'order:read',
      'cart:read', 'cart:update', 'user:read', 'user:update'
    ];

    const sellerPermissions = [
      ...buyerPermissions,
      'artwork:create', 'artwork:update', 'artwork:delete',
      'product:create', 'product:update', 'product:delete',
      'order:manage'
    ];

    const adminPermissions = [
      ...sellerPermissions,
      'user:manage', 'admin:access'
    ];

    await this.assignPermissionsToRole(buyerRole.id, buyerPermissions);
    await this.assignPermissionsToRole(sellerRole.id, sellerPermissions);
    await this.assignPermissionsToRole(adminRole.id, adminPermissions);

    console.log('Auth0 roles and permissions setup completed!');
  }
}