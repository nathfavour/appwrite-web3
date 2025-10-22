'use client';

import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { useWalletManager } from '@/hooks/useWalletManager';

interface User {
  prefs?: {
    walletEth?: string;
  };
}

export default function WalletSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    loading: walletLoading,
    error: walletError,
    success: walletSuccess,
    connectWallet,
    disconnectWallet,
    clearMessages
  } = useWalletManager();

  useEffect(() => {
    fetchUser();
  }, [walletSuccess]);

  const fetchUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData as User);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const walletAddress = user?.prefs?.walletEth;
  const hasWallet = !!walletAddress;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
      border: '1px solid #c4b5fd',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#4c1d95',
        margin: '0 0 16px 0'
      }}>
        🔗 Wallet Settings
      </h2>

      {loading ? (
        <div>Loading wallet info...</div>
      ) : (
        <div>
          {hasWallet && (
            <div style={{
              background: 'white',
              border: '1px solid #e9d5ff',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                Connected Wallet:
              </p>
              <p style={{
                margin: '0',
                color: '#4c1d95',
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: '600',
                wordBreak: 'break-all'
              }}>
                {walletAddress}
              </p>
            </div>
          )}

          {walletSuccess && (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '12px',
              color: '#166534',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              ✓ {walletSuccess}
            </div>
          )}

          {walletError && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              color: '#991b1b',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              ✗ {walletError}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {!hasWallet ? (
              <button
                onClick={() => {
                  clearMessages();
                  connectWallet();
                }}
                disabled={walletLoading}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '8px',
                  background: walletLoading ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  cursor: walletLoading ? 'not-allowed' : 'pointer',
                  opacity: walletLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {walletLoading ? '⏳ Connecting...' : '+ Connect Wallet'}
              </button>
            ) : (
              <button
                onClick={() => {
                  clearMessages();
                  disconnectWallet();
                }}
                disabled={walletLoading}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '8px',
                  background: walletLoading ? '#d1d5db' : '#ef4444',
                  color: 'white',
                  cursor: walletLoading ? 'not-allowed' : 'pointer',
                  opacity: walletLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {walletLoading ? '⏳ Disconnecting...' : '✕ Disconnect Wallet'}
              </button>
            )}
          </div>

          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '12px 0 0 0'
          }}>
            {hasWallet
              ? 'You can disconnect this wallet and connect a different one.'
              : 'Connect a MetaMask wallet to link it with your account.'}
          </p>
        </div>
      )}
    </div>
  );
}
