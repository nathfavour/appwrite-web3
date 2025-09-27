"use client";

import { useState } from "react";
import { account } from "../../lib/appwrite";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";

/*
  Proof of Concept: Email + Wallet authentication
  ------------------------------------------------
  This POC removes the traditional password field. A deterministic password is
  derived from the connected wallet address, and used to create or reuse the
  Appwrite account. This is NOT secure for production because anyone knowing
  the formula (visible in client code) plus a user's email & wallet address
  could recreate the password. A production version should:
    - Use a server route to issue a nonce
    - Have the wallet sign the nonce (EIP-191 / EIP-4361 style message)
    - Verify the signature server-side
    - Derive a secret password with a server-side pepper
    - Create or authenticate the Appwrite session server-side and set cookies
*/

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const derivePassword = (address: string) => `wallet_${address.toLowerCase()}`; // POC only

  const connectWallet = async () => {
    setError(null);
    if (!(window as any).ethereum) {
      setError("No injected wallet found (e.g. MetaMask)");
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

  const signInWithWallet = async () => {
    if (!email) { setError("Email required"); return; }
    if (!walletAddress) { setError("Connect wallet first"); return; }
    setError(null);
    const password = derivePassword(walletAddress);

    try {
      // Try to create a session (existing user path)
      await account.createEmailSession(email, password);
    } catch (errAny: any) {
      const msg = errAny?.message || String(errAny);
      // Attempt to create the account then sign in
      try {
        await account.create(ID.unique(), email, password);
        await account.createEmailSession(email, password);
        // Optionally store wallet address in user preferences
        try { await account.updatePrefs({ walletAddress }); } catch {}
      } catch (inner: any) {
        setError(inner?.message || msg);
        return;
      }
    }
    router.push("/");
  };

  return (
    <main style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <div style={{width: 360, padding: 20, border: '1px solid #ddd', borderRadius: 8}}>
        <h2 style={{marginBottom: 4}}>Sign in / Sign up</h2>
        <p style={{fontSize: 12, color: '#555', marginBottom: 12}}>POC: Email + Wallet (no password field)</p>
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
          onClick={signInWithWallet}
          style={{width: '100%', padding: '10px 12px', fontWeight: 600}}
          type="button"
          disabled={!walletAddress || !email}
        >
          {`Continue${walletAddress ? '' : ' (connect wallet first)'}`}
        </button>
        <div style={{marginTop: 16, fontSize: 11, lineHeight: 1.4, color: '#666'}}>
          <strong>Security Note:</strong> This demo derives a predictable password
          from the wallet address on the client. Do NOT use this approach in production.
        </div>
      </div>
    </main>
  );
}
