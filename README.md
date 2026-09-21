# MindCloud Embedded + Universal API — example app

**Beacon** is a deliberately tiny mock SaaS app (a customer-messaging tool) showing the complete MindCloud embedded flow:

1. Your customers open an **Integrations page inside your app** and connect their own accounts (Slack, email, anything in the MindCloud catalog) through the MindCloud embedded SDK.
2. Your backend then **uses those connections programmatically** through the Universal API — one REST shape for every app, addressed by `installationId`. Provider tokens never touch your code.

It is intentionally minimal (~10 small files) so you can read every line, copy the patterns into your own stack, or hand the whole folder to an LLM as a working reference.

## Quickstart

Prerequisites: Node 18.18+, a MindCloud account with Embedded enabled, and a **Full Access** API key (create at `app.mindcloud.co` → Settings → API Keys — full access is required to mint end-user tokens).

```bash
npm install
npm run setup   # prompts you through .env.local (paste your API key, accept the defaults)
npm run dev
```

Open http://localhost:4321 and go to **Integrations**.

### One-time MindCloud setup

In `app.mindcloud.co` → **Embedded**, create an integration your customers will connect. For this demo, a **Connect-Only** integration works great — for example:

1. Create Integration → choose **Connect-Only** → pick **Slack** (or Gmail, or any app your customers use).
2. Optionally add more apps to it (Settings → Add App), and metadata definitions if you want the connect dialog to ask for options.

Refresh the demo's Integrations page — your integration appears as a card. Click **Connect**, authenticate as an end user would, then open **"Try the API with this connection"** on the installation to run a real Universal API action with the credentials the end user just supplied.

## What talks to what

```
Browser (this app's /integrations page)
  │  POST /api/embedded-token                       ← your backend
  │       └─ POST  /v1/users            (once, creates the end user; store the id)
  │       └─ GET   /v1/users/:id/token  (mints a short-lived end-user token)
  │  <script src=".../sdk.1.0.0.min.js">            ← MindCloud embedded SDK
  │  sdk.setToken() → sdk.getIntegrations() → cards
  │  sdk.install() / sdk.modify()                   ← MindCloud-hosted connect modal
  │
Your backend (API key lives ONLY here)
  │  POST /v2/universal/apps/{appSlug}/actions/{actionSlug}/run
  │       { "installationId": "...", "arguments": { ... } }
  └─ MindCloud resolves the end user's connection for that installation and runs the action
```

## Files

| File | What it shows |
| --- | --- |
| `scripts/setup.mjs` | Interactive `.env.local` writer |
| `lib/mindcloud.js` | Server-side MindCloud API client (the only place the API key is used) |
| `lib/demoUserStore.js` | "Your database": stores the MindCloud end-user id per app user (create once, reuse forever) |
| `app/api/embedded-token/route.js` | Backend endpoint the browser calls to get an end-user token |
| `app/api/run-action/route.js` | Backend endpoint that runs a Universal API action with an installation's connection |
| `app/integrations/IntegrationsClient.jsx` | Loads the SDK, renders integration cards, opens the connect modal |
| `app/integrations/ApiPlayground.jsx` | In-page tester: run any action against a connected installation, with the equivalent curl |
| `app/page.jsx`, `app/layout.jsx`, `app/globals.css` | The mock SaaS shell (static, no MindCloud code) |

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `MINDCLOUD_API_KEY` | yes | Full Access key. Server-side only. |
| `DEMO_USER_EMAIL` / `DEMO_USER_NAME` | no | Identity of the demo end user this app creates. |
| `MINDCLOUD_API_BASE_URL` | no | Defaults to `https://connect.mindcloud.co`. |
| `NEXT_PUBLIC_MINDCLOUD_EMBEDDED_BASE_URL` | no | Defaults to `https://embedded.mindcloud.co`. |

## Adapting this to your app

- Replace `demo-user-1` in `app/api/embedded-token/route.js` with your session's user id, and `lib/demoUserStore.js` with a column on your users table.
- Gate `/api/run-action` on your own authorization: check the installation belongs to the signed-in customer before running actions with it.
- Action slugs and per-action argument schemas are documented per app at [mindcloud.co/docs/universal](https://mindcloud.co/docs/universal), or discoverable via `GET /v2/universal/apps/{appSlug}/actions`.
- List a customer's connections server-side with `GET /v2/connections?where=installationId=="..."`.
