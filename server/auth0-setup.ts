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

  async getUserRoles(userId: string): Promise<any[]> {
    const token = await this.getManagementToken();
    
    try {
      const response = await axios.get(
        `https://${this.config.domain}/api/v2/users/${userId}/roles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get user roles: ${error.response?.data?.message || error.message}`);
    }
  }

  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    const token = await this.getManagementToken();
    
    try {
      // First, get the role ID by name
      const role = await this.getRoleByName(roleName);
      if (!role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      // Assign the role to the user
      await axios.post(
        `https://${this.config.domain}/api/v2/users/${userId}/roles`,
        {
          roles: [role.id]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      throw new Error(`Failed to assign role to user: ${error.response?.data?.message || error.message}`);
    }
  }

  async setupDefaultRoles(): Promise<void> {
    console.log('Setting up Auth0 roles...');

    // Create basic roles without custom permissions
    try {
      const buyerRole = await this.createRole('buyer', 'Regular customer who can browse and purchase items');
      console.log('Created buyer role:', buyerRole?.name);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('Buyer role already exists');
      } else {
        console.warn('Failed to create buyer role:', error.message);
      }
    }

    try {
      const sellerRole = await this.createRole('seller', 'Artist or vendor who can create and sell artwork');
      console.log('Created seller role:', sellerRole?.name);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('Seller role already exists');
      } else {
        console.warn('Failed to create seller role:', error.message);
      }
    }

    try {
      const adminRole = await this.createRole('admin', 'Administrator with full system access');
      console.log('Created admin role:', adminRole?.name);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('Admin role already exists');
      } else {
        console.warn('Failed to create admin role:', error.message);
      }
    }

    console.log('Auth0 roles setup completed successfully!');
    console.log('Note: Authorization will be handled by your application based on role names.');
  }
}