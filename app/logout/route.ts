import { NextResponse } from 'next/server';

function renderLogoutHtml(endpoint: string | undefined, project: string | undefined): string {
  const safeEndpoint = JSON.stringify(endpoint ?? '');
  const safeProject = JSON.stringify(project ?? '');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing out…</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;color:#111} .card{max-width:420px;margin:48px auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px;box-shadow:0 6px 18px rgba(0,0,0,.06)} .muted{color:#6b7280}</style>
  </head>
  <body>
    <div class="card">
      <h1>Signing you out…</h1>
      <p class="muted">Please wait while we end your session.</p>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/appwrite@14"></script>
    <script>
    (async function(){
      try {
        var endpoint = ${safeEndpoint};
        var project = ${safeProject};
        if (!endpoint || !project || typeof window.Appwrite === 'undefined') {
          window.location.replace('/login');
          return;
        }
        var client = new window.Appwrite.Client().setEndpoint(endpoint).setProject(project);
        var account = new window.Appwrite.Account(client);
        try { await account.deleteSession('current'); } catch (e) { /* ignore */ }
        window.location.replace('/login');
      } catch (_e) {
        window.location.replace('/login');
      }
    })();
    </script>
  </body>
  </html>`;
}

export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  if (!endpoint || !project) {
    // If misconfigured, just send them to login
    return NextResponse.redirect('/login');
  }

  return new Response(renderLogoutHtml(endpoint, project), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST() {
  return GET();
}
