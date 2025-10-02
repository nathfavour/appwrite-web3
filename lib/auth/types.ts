/**
 * Shared authentication types
 * Used by both Next.js API route and Appwrite Function implementations
 */

export interface Web3AuthRequest {
  email: string;
  address: string;
  signature: string;
  message: string;
}

export interface Web3AuthResponse {
  userId: string;
  secret: string;
}

export interface Web3AuthError {
  error: string;
}

/**
 * Authentication provider interface
 * Both implementations must conform to this interface
 */
export interface IAuthProvider {
  /**
   * Authenticate a user with Web3 wallet signature
   * @param request - Authentication request data
   * @returns Promise with userId and secret for session creation
   */
  authenticate(request: Web3AuthRequest): Promise<Web3AuthResponse>;

  /**
   * Get the name of the authentication provider
   */
  getName(): string;
}

/**
 * Window type extension for MetaMask
 */
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
