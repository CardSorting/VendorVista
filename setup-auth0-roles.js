#!/usr/bin/env node

import { Auth0RoleManager } from './server/auth0-setup.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupRoles() {
  try {
    console.log('Setting up Auth0 roles...');
    
    const auth0Domain = process.env.AUTH0_DOMAIN || 'dev-57c4wim3kish0u23.us.auth0.com';
    const auth0ClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
    const auth0ClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
    const auth0Audience = process.env.AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`;

    if (!auth0ClientId || !auth0ClientSecret) {
      console.error('Missing Auth0 Management API credentials:');
      console.error('- AUTH0_MANAGEMENT_CLIENT_ID:', auth0ClientId ? 'Present' : 'Missing');
      console.error('- AUTH0_MANAGEMENT_CLIENT_SECRET:', auth0ClientSecret ? 'Present' : 'Missing');
      process.exit(1);
    }

    const roleManager = new Auth0RoleManager({
      domain: auth0Domain,
      clientId: auth0ClientId,
      clientSecret: auth0ClientSecret,
      audience: auth0Audience
    });

    console.log('Creating roles and permissions...');
    await roleManager.setupDefaultRoles();
    
    console.log('✅ Auth0 roles and permissions have been successfully created!');
    console.log('\nCreated roles:');
    console.log('- buyer: Basic marketplace access');
    console.log('- seller: Can manage products and view orders');
    console.log('- admin: Full system access');
    
    console.log('\nYou can now assign these roles to users in your Auth0 dashboard.');
    
  } catch (error) {
    console.error('❌ Error setting up Auth0 roles:', error.message);
    process.exit(1);
  }
}

setupRoles();