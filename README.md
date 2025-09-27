# Project

Minimal Next.js application cleaned of template code.

Setup:

- Install dependencies: `npm install`
- Add environment variables in `.env.local`:
  - `NEXT_PUBLIC_APPWRITE_ENDPOINT` — your Appwrite endpoint (e.g. `https://[HOSTNAME]/v1` without trailing slash)
  - `NEXT_PUBLIC_APPWRITE_PROJECT` — your Appwrite project ID

This project uses the `appwrite` JavaScript SDK. Run `npm install appwrite` if you haven't already.

Pages:

- `/login` — login page (email/password)
- `/` — protected dashboard; redirects to `/login` if not authenticated

