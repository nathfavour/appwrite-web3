"use client";

import { useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const sessionUser = await account.get();
        if (!mounted) return;
        setUser(sessionUser);
        setLoading(false);
      } catch (_err: unknown) {
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
    <main style={{padding: 20}}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email || user?.name || 'user'}.</p>
      <form action="/logout" method="post">
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
