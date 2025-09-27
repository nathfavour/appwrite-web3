import { NextResponse } from 'next/server';
import { Client, Users, ID } from 'node-appwrite';

/*
  POST /api/custom-token
  Body: { email: string, wallet: string }
  -------------------------------------------------
  Simplest possible custom-token issuer for POC.
  - If a user with composite id does not exist, create it.
  - Generate a short-lived custom token via Users.createToken.
  Returns: { userId, secret }

  UserId strategy: `wallet:<lowercased wallet>` keeps it deterministic without storage.
  You could also hash wallet if you want to hide raw address from Appwrite user list.
*/

export async function POST(req: Request) {
  try {
    const { email, wallet } = await req.json();
    if (!email || !wallet) {
      return NextResponse.json({ error: 'email and wallet required' }, { status: 400 });
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT; // re-use public vars
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT; // re-use public vars
    const apiKey = process.env.APPWRITE_API;
    if (!endpoint || !project || !apiKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(apiKey);

    const users = new Users(client);
    const userId = `wallet:${wallet.toLowerCase()}`;

    // Ensure user exists (idempotent create)
    try {
      await users.get(userId);
    } catch {
      await users.create(userId, email);
    }

    // Create short-lived token
    const token = await users.createToken(userId);
    return NextResponse.json({ userId, secret: token.secret });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
