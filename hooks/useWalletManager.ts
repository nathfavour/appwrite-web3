'use client';

import { useState } from 'react';
import { functions, account } from '@/lib/appwrite';

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
    if (!(window as unknown as { ethereum?: unknown }).ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not installed' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const eth = window as unknown as { ethereum: { request: (args: { method: string; params?: string[] }) => Promise<string[] | string> } };
      const accounts = await eth.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];
      const address = accounts[0];

      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      const signature = await eth.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      }) as string;

      const execution = await functions.createExecution(
        process.env.NEXT_PUBLIC_FUNCTION_ID!,
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
        success: `Wallet connected: ${address}`
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
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const user = await account.get();

      await account.updatePrefs({
        ...user.prefs,
        walletEth: undefined
      });

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
