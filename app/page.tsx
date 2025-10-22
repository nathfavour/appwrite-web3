"use client";

import { useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { useRouter } from "next/navigation";
import WalletSettings from "./components/WalletSettings";

interface User {
  email?: string;
  name?: string;
  $id?: string;
  prefs?: {
    walletEth?: string;
  };
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const sessionUser = await account.get();
        if (!mounted) return;
        setUser(sessionUser as User);
        setLoading(false);
      } catch {
        if (!mounted) return;
        // not authenticated
        router.replace('/login');
      }
    }
    check();
    return () => { mounted = false };
  }, [router]);

  if (loading) return <div style={{padding: 20}}>Loading...</div>;

  return (
    <main style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 8px 0'
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: '16px',
          margin: '0',
          opacity: 0.9
        }}>
          Welcome, {user?.email || user?.name || 'user'}
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#111',
          margin: '0 0 16px 0'
        }}>
          Account Info
        </h2>

        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '4px'
            }}>
              Email
            </label>
            <p style={{
              margin: '0',
              fontSize: '16px',
              color: '#111'
            }}>
              {user?.email}
            </p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '4px'
            }}>
              User ID
            </label>
            <p style={{
              margin: '0',
              fontSize: '14px',
              fontFamily: 'monospace',
              color: '#374151',
              wordBreak: 'break-all'
            }}>
              {user?.$id}
            </p>
          </div>

          {user?.prefs?.walletEth && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Connected Wallet
              </label>
              <p style={{
                margin: '0',
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#374151',
                wordBreak: 'break-all'
              }}>
                {user.prefs.walletEth}
              </p>
            </div>
          )}
        </div>
      </div>

      <WalletSettings />

      <div style={{
        marginTop: '32px'
      }}>
        <form action="/logout" method="post">
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
