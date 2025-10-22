'use client';

import { useState } from 'react';
import { functions } from '@/lib/appwrite';

interface WalletManagerState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export function useWalletManager() {
  const [state, setState] = useState<WalletManagerState>({
    loading: false,
    error: null,
    success: null
  });

  const connectWallet = async (): Promise<boolean> => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return false;
    }

    if (!process.env.NEXT_PUBLIC_FUNCTION_ID) {
      setState(prev => ({ ...prev, error: 'Function ID not configured' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];
      const address = accounts[0];

      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      }) as string;

      const execution = await functions.createExecution(
        process.env.NEXT_PUBLIC_FUNCTION_ID,
        JSON.stringify({ address, signature, message }),
        false,
        '/connect-wallet'
      );

      const response = JSON.parse(execution.responseBody);

      if (execution.responseStatusCode !== 200) {
        throw new Error(response.error || 'Failed to connect wallet');
      }

      setState(prev => ({
        ...prev,
        success: `Wallet connected: ${address.substring(0, 6)}...${address.substring(38)}`
      }));
      return true;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error connecting wallet';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const disconnectWallet = async (): Promise<boolean> => {
    if (!process.env.NEXT_PUBLIC_FUNCTION_ID) {
      setState(prev => ({ ...prev, error: 'Function ID not configured' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const execution = await functions.createExecution(
        process.env.NEXT_PUBLIC_FUNCTION_ID,
        JSON.stringify({}),
        false,
        '/disconnect-wallet'
      );

      const response = JSON.parse(execution.responseBody);

      if (execution.responseStatusCode !== 200) {
        throw new Error(response.error || 'Failed to disconnect wallet');
      }

      setState(prev => ({
        ...prev,
        success: 'Wallet disconnected successfully'
      }));
      return true;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error disconnecting wallet';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const clearMessages = () => {
    setState(prev => ({
      ...prev,
      error: null,
      success: null
    }));
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    clearMessages
  };
}
