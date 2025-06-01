#!/usr/bin/env node

import { Auth0RoleManager } from './server/auth0-setup.ts';

async function assignUserRole() {
  try {
    console.log('Auth0 User Role Assignment Tool');
    
    const auth0Domain = process.env.AUTH0_DOMAIN || 'dev-57c4wim3kish0u23.us.auth0.com';
    const auth0ClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
    const auth0ClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
    const auth0Audience = process.env.AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`;

    if (!auth0ClientId || !auth0ClientSecret) {
      console.error('Missing Auth0 Management API credentials');
      process.exit(1);
    }

    const roleManager = new Auth0RoleManager({
      domain: auth0Domain,
      clientId: auth0ClientId,
      clientSecret: auth0ClientSecret,
      audience: auth0Audience
    });

    // Add method to assign role to user
    await roleManager.assignRoleToUser('USER_ID_HERE', 'admin');
    
    console.log('✅ Successfully assigned admin role to user');
    
  } catch (error) {
    console.error('❌ Error assigning role:', error.message);
    process.exit(1);
  }
}

console.log('This script requires a user ID from Auth0. Please check your Auth0 dashboard for the user ID or log in to the application first to see your user ID in the admin panel.');
// assignUserRole();