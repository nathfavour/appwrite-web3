'use client';

import { useEffect } from 'react';
import { account } from '@/lib/appwrite';

export function useWalletListener() {
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accountsList = accounts as string[];
      if (accountsList.length === 0) {
        console.log('Wallet disconnected');
        try {
          await account.deleteSession('current');
          window.location.href = '/login';
        } catch (error) {
          console.error('Failed to logout:', error);
        }
      } else {
        console.log('Account switched to:', accountsList[0]);
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      console.log('Chain changed to:', chainId);
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, []);
}
