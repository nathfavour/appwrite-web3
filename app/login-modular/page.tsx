"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticateAndCreateSession, getAuthMethod } from "../../lib/auth";

export default function ModularLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get the configured auth method for display
  const authMethod = getAuthMethod();

  // Debug: Log environment variables on mount
  useEffect(() => {
    console.log('🔍 Environment Debug:');
    console.log('NEXT_PUBLIC_APPWRITE_AUTH_METHOD:', process.env.NEXT_PUBLIC_APPWRITE_AUTH_METHOD);
    console.log('NEXT_PUBLIC_APPWRITE_FUNCTION_ID:', process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID);
    console.log('Detected auth method:', authMethod);
  }, [authMethod]);

  const handleLogin = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log('🔐 Starting authentication with method:', authMethod);
      
      // Use the modular authentication system
      // It automatically picks the correct provider based on environment
      await authenticateAndCreateSession(email);
      
      // Redirect to dashboard on success
      router.push('/');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Authentication error:', e);
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
          
          {/* Auth Method Indicator */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: authMethod === 'function' ? '#dbeafe' : '#fef3c7',
            border: `1px solid ${authMethod === 'function' ? '#3b82f6' : '#f59e0b'}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: authMethod === 'function' ? '#1e40af' : '#92400e',
            fontWeight: '600'
          }}>
            🔧 Mode: {authMethod === 'function' ? 'Appwrite Function' : 'Next.js API'}
          </div>
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
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
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
          onClick={handleLogin}
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
          <div style={{marginTop: '8px', fontSize: '11px', opacity: 0.8}}>
            {authMethod === 'function' 
              ? '✨ Using serverless Appwrite Function' 
              : '🚀 Using Next.js API Route'}
          </div>
        </div>
      </div>
    </div>
  );
}
