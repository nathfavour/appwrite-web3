/**
 * Appwrite Function Authentication Provider
 * Uses the deployed Appwrite Function for authentication
 */

// @ts-expect-error - Appwrite types issue with Next.js 15
import { Client, Functions } from 'appwrite';
import type { IAuthProvider, Web3AuthRequest, Web3AuthResponse } from '../types';

export class AppwriteFunctionProvider implements IAuthProvider {
  private client: Client;
  private functions: Functions;
  private functionId: string;

  constructor() {
    // Initialize Appwrite client
    this.client = new Client();

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const functionId = process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID;

    console.log('🔧 AppwriteFunctionProvider constructor:', {
      endpoint,
      project,
      functionId
    });

    if (!endpoint || !project) {
      throw new Error('Appwrite endpoint and project ID are required');
    }

    if (!functionId) {
      throw new Error('NEXT_PUBLIC_APPWRITE_FUNCTION_ID environment variable is required when using function auth method');
    }

    console.log('✅ AppwriteFunctionProvider initialized with function ID:', functionId);

    this.client
      .setEndpoint(endpoint)
      .setProject(project);

    this.functions = new Functions(this.client);
    this.functionId = functionId;
  }

  getName(): string {
    return 'appwrite-function';
  }

  async authenticate(request: Web3AuthRequest): Promise<Web3AuthResponse> {
    try {
      console.log('🚀 Calling Appwrite Function:', this.functionId);
      console.log('📤 Request:', request);
      
      // Call the Appwrite Function using SDK
      const execution = await this.functions.createExecution(
        this.functionId,
        JSON.stringify(request),
        false // Get immediate response
      );

      console.log('📥 Function response:', execution);
      console.log('Status code:', execution.responseStatusCode);

      // Parse the response
      const response = JSON.parse(execution.responseBody);

      // Check for errors
      if (execution.responseStatusCode !== 200) {
        throw new Error(response.error || 'Authentication failed');
      }

      return {
        userId: response.userId,
        secret: response.secret
      };
    } catch (error) {
      console.error('❌ Function call failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed');
    }
  }
}
