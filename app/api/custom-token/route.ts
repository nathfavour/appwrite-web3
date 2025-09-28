import { NextResponse } from 'next/server';
import { Client, Users, ID, Query } from 'node-appwrite';
import { ethers } from 'ethers';

export async function POST(req: Request) {
  try {
    const { email, address, signature, message } = await req.json();
    
    if (!email || !address || !signature || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature matches expected message and address
    const expectedMessage = `Sign this message to authenticate: ${message}`;
    
    // Basic signature verification (in production, use proper crypto library)
    // This is a simplified version - you'd want to use ethers.js or similar
    const isValidSignature = await verifySignature(expectedMessage, signature, address);
    
    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const apiKey = process.env.APPWRITE_API;
    
    if (!endpoint || !project || !apiKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(apiKey);

    const users = new Users(client);
    const normalizedEthAddress = normalizeEthAddress(address);
    
    // Create deterministic but compliant userId from address hash
    const userId = ID.unique(); // For now, use unique ID
    
    // Check if user exists by email (bind wallet to user prefs without extra DB)
    let existingUserId = userId;
    try {
      const existingUsers = await users.list([Query.equal('email', email)]);
      if ((existingUsers as any).total > 0 && (existingUsers as any).users?.length > 0) {
        const existing = (existingUsers as any).users[0];
        existingUserId = existing.$id;
        const existingWallet = (existing.prefs?.walletEth as string | undefined)?.toLowerCase();
        const hasPasskey = Boolean((existing.prefs as any)?.passkey_credentials);

        // If account has passkey but no wallet linked, require passkey sign-in first
        if (hasPasskey && !existingWallet) {
          return NextResponse.json(
            { error: 'Account already connected with passkey. Sign in with passkey to link wallet.' },
            { status: 403 }
          );
        }
        if (existingWallet && existingWallet !== normalizedEthAddress) {
          return NextResponse.json({ error: 'Email already bound to a different wallet' }, { status: 403 });
        }
        if (!existingWallet) {
          // First-time bind: attach wallet to this user via prefs
          await users.updatePrefs(existingUserId, { ...(existing.prefs || {}), walletEth: normalizedEthAddress });
        }
      } else {
        // Create new user then bind wallet in prefs
        const created = await users.create({ userId, email });
        existingUserId = (created as any).$id || userId;
        await users.updatePrefs(existingUserId, { walletEth: normalizedEthAddress });
      }
    } catch (_error: unknown) {
      // Fallback: create new user and bind wallet
      const created = await users.create({ userId, email });
      existingUserId = (created as any).$id || userId;
      try { await users.updatePrefs(existingUserId, { walletEth: normalizedEthAddress }); } catch { /* ignore */ }
    }

    // Create custom token
    const token = await users.createToken({ userId: existingUserId });
    
    return NextResponse.json({ 
      userId: existingUserId, 
      secret: token.secret 
    });

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Authentication failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function verifySignature(message: string, signature: string, address: string): Promise<boolean> {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Compare with expected address (case insensitive)
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (_error: unknown) {
    return false;
  }
}

function normalizeEthAddress(address: string): string {
  try {
    // ethers v6 canonicalizes and checksums the address
    // Store and compare using lower-case to avoid checksum mismatches
    // This keeps prefs stable and comparisons simple
    // If invalid, this will throw and we fall back to a trimmed lower-case string
    return (ethers.getAddress(address)).toLowerCase();
  } catch (_e) {
    return (address || '').trim().toLowerCase();
  }
}
