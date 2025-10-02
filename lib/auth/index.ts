/**
 * Auth Module - Modular Authentication System
 * 
 * This module provides a flexible authentication system that can switch between
 * different authentication methods:
 * - 'default': Next.js API route (/api/custom-token)
 * - 'function': Appwrite Function (serverless)
 * 
 * Configuration is done via the NEXT_PUBLIC_APPWRITE_AUTH_METHOD environment variable.
 * If not set or invalid, defaults to 'default' (Next.js API route).
 * 
 * Usage:
 * ```typescript
 * import { authenticateWithWeb3 } from '@/lib/auth';
 * 
 * const result = await authenticateWithWeb3('user@example.com');
 * await account.createSession(result);
 * ```
 */

export * from './types';
export * from './factory';
export * from './web3';

// Re-export for convenience
export { NextJsApiProvider } from './providers/nextjs-api';
export { AppwriteFunctionProvider } from './providers/appwrite-function';

import { account } from '../appwrite';
import { getAuthProvider } from './factory';
import { connectWallet, generateAuthMessage, signMessage, isWalletAvailable } from './web3';
import type { Web3AuthResponse } from './types';

/**
 * Complete Web3 authentication flow
 * Handles wallet connection, signing, and authentication via the configured provider
 * 
 * @param email - User's email address
 * @returns Authentication response with userId and secret
 * @throws Error if wallet not available, user rejects, or authentication fails
 */
export async function authenticateWithWeb3(email: string): Promise<Web3AuthResponse> {
  // Step 1: Check wallet availability
  if (!(await isWalletAvailable())) {
    throw new Error('No wallet found. Please install MetaMask or similar.');
  }

  // Step 2: Connect wallet and get address
  const address = await connectWallet();

  // Step 3: Generate authentication message
  const { message, fullMessage } = generateAuthMessage();

  // Step 4: Request signature from wallet
  const signature = await signMessage(fullMessage, address);

  // Step 5: Authenticate via configured provider
  const provider = getAuthProvider();
  const result = await provider.authenticate({
    email,
    address,
    signature,
    message
  });

  return result;
}

/**
 * Complete authentication and session creation
 * Combines authenticateWithWeb3 with session creation
 * 
 * @param email - User's email address
 * @returns The authenticated user object
 * @throws Error if authentication or session creation fails
 */
export async function authenticateAndCreateSession(email: string) {
  // Authenticate with Web3
  const { userId, secret } = await authenticateWithWeb3(email);

  // Create Appwrite session
  await account.createSession({ userId, secret });

  // Get and return user info
  return await account.get();
}
