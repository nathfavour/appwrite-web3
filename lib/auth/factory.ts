/**
 * Authentication Provider Factory
 * Creates the appropriate auth provider based on environment configuration
 */

import type { IAuthProvider } from './types';
import { NextJsApiProvider } from './providers/nextjs-api';
import { AppwriteFunctionProvider } from './providers/appwrite-function';

export type AuthMethod = 'default' | 'function';

/**
 * Get the configured authentication method from environment
 * Works in both client and server contexts
 */
export function getAuthMethod(): AuthMethod {
  const method = process.env.NEXT_PUBLIC_APPWRITE_AUTH_METHOD?.toLowerCase();
  
  console.log('🔧 getAuthMethod called:', {
    raw: process.env.NEXT_PUBLIC_APPWRITE_AUTH_METHOD,
    lowercase: method,
    willReturn: method === 'function' ? 'function' : 'default'
  });
  
  if (method === 'function') {
    return 'function';
  }
  
  // Default to Next.js API route if not specified or invalid
  return 'default';
}

/**
 * Create an authentication provider based on the configured method
 */
export function createAuthProvider(): IAuthProvider {
  const method = getAuthMethod();

  switch (method) {
    case 'function':
      return new AppwriteFunctionProvider();
    
    case 'default':
    default:
      return new NextJsApiProvider();
  }
}

/**
 * Singleton instance of the auth provider
 * Created once and reused throughout the application
 */
let authProviderInstance: IAuthProvider | null = null;

/**
 * Get the singleton auth provider instance
 */
export function getAuthProvider(): IAuthProvider {
  if (!authProviderInstance) {
    authProviderInstance = createAuthProvider();
    
    // Log which provider is being used (helpful for debugging)
    if (typeof window !== 'undefined') {
      console.log(`🔐 Auth Provider: ${authProviderInstance.getName()}`);
    }
  }
  
  return authProviderInstance;
}
