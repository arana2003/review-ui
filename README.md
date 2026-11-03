# Review Queue UI

A sample review interface built with Next.js 16, React, and Tailwind CSS. It shows extracted claims next to their source text, masks PII with a toggle, lists verification checks, and records sign-off actions.

All data is synthetic. The app has no backend and makes no API calls.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3001 (the app uses port 3001 so it doesn't clash with the gateway on 3000).

## Connect to the gateway

Sign-offs are sent to the gateway's `/api/ingest` route through a server-side route at `app/api/submit`. Set these in `.env.local` (see `.env.example`):

```bash
GATEWAY_URL=http://localhost:3000
GATEWAY_API_KEY=<an API key for a user in the gateway database>
```

Start the gateway first. Each sign-off is recorded in its `AuditLog`. If the gateway is down, returns 401, or rate-limits you (429), the page shows the error and the request isn't recorded.
