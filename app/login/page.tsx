"use client";

import { useState } from "react";
import { account } from "../../lib/appwrite";
import { useRouter } from "next/navigation";

/*
  Simplest possible flow using Appwrite Custom Token:
  1. User enters email & connects wallet (client only; we don't store anything)
  2. Client calls our server route /api/custom-token with email + wallet
  3. Server route ensures (creates if needed) deterministic user and returns { userId, secret }
  4. Client exchanges userId + secret for a session via account.createSession
*/

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const connectWallet = async () => {
    setError(null);
    if (!(window as any).ethereum) {
      setError("No injected wallet found (MetaMask?)");
      return;
    }
    try {
      setConnecting(true);
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts?.[0];
      if (!address) throw new Error("No account returned");
      setWalletAddress(address);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setConnecting(false);
    }
  };

  const proceed = async () => {
    if (!email) { setError("Email required"); return; }
    if (!walletAddress) { setError("Connect wallet first"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/custom-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wallet: walletAddress })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await account.createSession({ userId: data.userId, secret: data.secret });
      router.push('/');
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <div style={{width: 360, padding: 20, border: '1px solid #ddd', borderRadius: 8}}>
        <h2 style={{marginBottom: 4}}>Wallet Login (POC)</h2>
        <p style={{fontSize: 12, color: '#555', marginBottom: 12}}>Custom Token + Email + Wallet (no password).</p>
        {error && <div style={{color: 'red', marginBottom: 12}}>{error}</div>}
        <div style={{marginBottom: 12}}>
          <label style={{display: 'block', marginBottom: 4}}>Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{width: '100%'}}
              placeholder="you@example.com"
            />
        </div>
        <div style={{marginBottom: 16}}>
          <button
            onClick={connectWallet}
            style={{width: '100%', padding: '8px 12px'}}
            disabled={connecting}
            type="button"
          >
            {walletAddress ? `Wallet: ${walletAddress.slice(0,6)}…${walletAddress.slice(-4)}` : (connecting ? 'Connecting…' : 'Connect Wallet')}
          </button>
        </div>
        <button
          onClick={proceed}
          style={{width: '100%', padding: '10px 12px', fontWeight: 600}}
          type="button"
          disabled={!walletAddress || !email || loading}
        >
          {loading ? 'Authenticating…' : 'Continue'}
        </button>
      </div>
    </main>
  );
}
