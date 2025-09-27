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
    
    // Create deterministic but compliant userId from address hash
    const userId = ID.unique(); // For now, use unique ID
    
    // Check if user exists by email (since we can't use wallet address as direct ID)
    let existingUserId = userId;
    try {
      // Prefer querying by email if supported
      const existingUsers = await users.list([Query.equal('email', email)]);
      if ((existingUsers as any).total > 0 && (existingUsers as any).users?.length > 0) {
        existingUserId = (existingUsers as any).users[0].$id;
      } else {
        const created = await users.create({ userId, email });
        existingUserId = (created as any).$id || userId;
      }
    } catch (_error: unknown) {
      // Fallback to create user with minimal fields if list/query not supported
      const created = await users.create({ userId, email });
      existingUserId = (created as any).$id || userId;
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
