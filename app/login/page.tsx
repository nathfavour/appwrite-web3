"use client";

import { useState } from "react";
import { account, functions } from "../../lib/appwrite";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const authenticateWithWallet = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Check if wallet is available
      if (!(window as unknown as { ethereum?: unknown }).ethereum) {
        throw new Error("No wallet found. Please install MetaMask or similar.");
      }

      // Request wallet connection
      const accounts = await ((window as unknown as { ethereum: { request: (params: { method: string }) => Promise<string[]> } }).ethereum.request({ 
        method: 'eth_requestAccounts' 
      }));
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet account selected");
      }

      const address = accounts[0];
      
      // Generate authentication message
      const timestamp = Date.now();
      const message = `auth-${timestamp}`;
      const fullMessage = `Sign this message to authenticate: ${message}`;

      // Request signature
      const signature = await ((window as unknown as { ethereum: { request: (params: { method: string, params: [string, string] }) => Promise<string> } }).ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      }));

      // Call Appwrite Function
      const execution = await functions.createExecution(
        process.env.NEXT_PUBLIC_FUNCTION_ID!,
        JSON.stringify({ email, address, signature, message }),
        false
      );

      const response = JSON.parse(execution.responseBody);

      if (execution.responseStatusCode !== 200) {
        throw new Error(response.error || 'Authentication failed');
      }

      // Create session
      await account.createSession({
        userId: response.userId,
        secret: response.secret
      });

      router.push('/');
      router.refresh();

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#4c1d95',
            margin: '0 0 8px 0'
          }}>
            Web3 Authentication
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            fontWeight: '400'
          }}>
            Sign in with your wallet
          </p>
        </div>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fecaca)',
            border: '1px solid #f87171',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{marginBottom: '32px'}}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1
            }}
          />
        </div>

        <button
          onClick={authenticateWithWallet}
          disabled={!email || loading}
          type="button"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '12px',
            background: (!email || loading) ? 
              '#d1d5db' : 
              'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            cursor: (!email || loading) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            marginBottom: '24px'
          }}
        >
          {loading ? '🔐 Authenticating...' : '🔐 Connect & Sign'}
        </button>

        <div style={{
          background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
          border: '1px solid #c4b5fd',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#5b21b6'
        }}>
          <div style={{fontWeight: '600', marginBottom: '4px'}}>
            🔒 Cryptographic Authentication
          </div>
          You&apos;ll be prompted to sign a message with your wallet. This proves ownership without exposing private keys.
        </div>
      </div>
    </div>
  );
}