"use client";

import { useState } from "react";
import { account } from "../../lib/appwrite";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await account.createEmailSession(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  return (
    <main style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
      <form onSubmit={handleSubmit} style={{width: 320, padding: 16, border: '1px solid #ddd', borderRadius: 8}}>
        <h2 style={{marginBottom: 12}}>Sign in</h2>
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        <div style={{marginBottom: 8}}>
          <label style={{display: 'block', marginBottom: 4}}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{width: '100%'}} />
        </div>
        <div style={{marginBottom: 12}}>
          <label style={{display: 'block', marginBottom: 4}}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%'}} />
        </div>
        <button type="submit" style={{width: '100%'}}>Sign in</button>
      </form>
    </main>
  );
}
