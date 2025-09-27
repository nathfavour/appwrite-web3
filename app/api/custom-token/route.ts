import { NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

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
      // In production, you'd maintain a mapping or use email as identifier
      const existingUser = await users.list([`email=${email}`]);
      if (existingUser.users.length > 0) {
        existingUserId = existingUser.users[0].$id;
      } else {
        // Create new user
        await users.create(userId, email);
        existingUserId = userId;
      }
    } catch (error) {
      // Create new user if not found
      await users.create(userId, email);
      existingUserId = userId;
    }

    // Create custom token
    const token = await users.createToken(existingUserId);
    
    return NextResponse.json({ 
      userId: existingUserId, 
      secret: token.secret 
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Authentication failed' }, { status: 500 });
  }
}

async function verifySignature(message: string, signature: string, address: string): Promise<boolean> {
  // Placeholder - implement proper signature verification
  // In production, use ethers.js or similar library
  return true; // For POC, always return true
}
