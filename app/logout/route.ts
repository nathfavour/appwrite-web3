import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  if (!endpoint || !project) {
    return NextResponse.json({ error: 'Appwrite not configured' }, { status: 500 });
  }

  // Delete current session via Appwrite REST API
  const url = `${endpoint}/v1/account/sessions`; // delete current session
  const cookie = req.headers.get('cookie') || '';

  await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-appwrite-project': project,
      'cookie': cookie,
    },
  });

  // Redirect to login
  return NextResponse.redirect('/login');
}
