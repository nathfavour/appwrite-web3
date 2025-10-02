/**
 * Next.js API Route Authentication Provider
 * Uses the existing /api/custom-token route
 */

import type { IAuthProvider, Web3AuthRequest, Web3AuthResponse } from '../types';

export class NextJsApiProvider implements IAuthProvider {
  getName(): string {
    return 'nextjs-api';
  }

  async authenticate(request: Web3AuthRequest): Promise<Web3AuthResponse> {
    const response = await fetch('/api/custom-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    return {
      userId: data.userId,
      secret: data.secret
    };
  }
}
