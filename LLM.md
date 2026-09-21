# LLM guide — MindCloud Embedded + Universal API example

You are looking at a complete, working reference implementation of MindCloud's embedded integrations flow. Your job is likely to reproduce these patterns inside a different codebase. Everything you need is in this file and the ~15 source files next to it.

## What this app demonstrates

**Beacon** is a mock SaaS app (a customer-messaging tool, Next.js App Router, port 4321) built around one end-to-end story: the Inbox's **"Send to Slack"** button posts a conversation to the customer's own Slack channel. That demonstrates:

1. **An in-app integrations page** — the SaaS vendor's customers ("end users") connect their own accounts (Slack here, any app in the MindCloud catalog generally) through MindCloud's embedded SDK, without leaving the vendor's app. Per-installation options (which Slack channel to post to) are collected by the same dialog via the integration's metadata definitions.
2. **Programmatic use of those connections** — the vendor's backend runs actions against the connected app through the Universal API, one REST shape for every app, addressed by `installationId`. Provider tokens are stored and refreshed by MindCloud and never touch the vendor's code.
3. **A guided setup** — `/setup` renders live-checked steps (API key → create the connect-only Slack integration → add the `slackChannel` metadata definition → connect → send), so the app itself teaches the MindCloud-side configuration.

## Core concepts

| Term | Meaning |
| --- | --- |
| **End user** | The vendor's customer, mirrored in MindCloud (`POST /v1/users`). The vendor stores the returned `userId` against its own user record. |
| **Integration** | A MindCloud-side definition of what customers can connect (one or more apps + optional per-installation option definitions). Created once by the vendor in the MindCloud dashboard. A "Connect-Only" integration has no workflows — it exists purely to collect connections for Universal API use. |
| **Installation** | One end user's instance of an integration. Identified by `installationId` — the handle the vendor's backend uses for every Universal API call. |
| **Connection** | An end user's credential for one app on one installation. Created by the SDK's connect modal (form fields or OAuth popup). |

## The complete flow

```
Browser (vendor's /integrations page)
  │  POST /api/embedded-token                       ← vendor backend
  │       └─ POST  /v1/users            (first time only — create the end user, STORE the id)
  │       └─ GET   /v1/users/:id/token  (mints a short-lived end-user token)
  │  <script src="https://embedded.mindcloud.co/assets/embedded/sdk.1.0.0.min.js">
  │  window.MindCloud({ baseUrl }) → sdk.setToken(token)
  │  sdk.getIntegrations() → render cards
  │  sdk.install({ integrationId }) / sdk.modify({ installationId })   ← MindCloud-hosted modal
  │       (modal handles credential forms, OAuth popups, per-installation options)
  │
Vendor backend (the MindCloud API key lives ONLY here)
  │  POST https://connect.mindcloud.co/v2/universal/apps/{appSlug}/actions/{actionSlug}/run
  │       Authorization: Bearer <MINDCLOUD_API_KEY>
  │       { "installationId": "...", "arguments": { ... } }
  └─ MindCloud resolves the end user's connection for that installation and runs the action
```

## File map

| File | What it shows |
| --- | --- |
| `scripts/setup.mjs` | Interactive `.env.local` writer (zero dependencies, node readline) |
| `lib/mindcloud.js` | Server-side MindCloud API client — the only place the API key is used |
| `lib/demoUserStore.js` | Stand-in for the vendor's database: maps app user id → MindCloud end-user id (create once, reuse forever) |
| `lib/useMindCloud.js` | Client hook: token from our backend → SDK script → `setToken` → integrations; `openConnect`/`openManage` open the MindCloud dialog with `onClose: refresh` |
| `lib/slackDemo.js` | The demo's addressing constants: app `slack`, action `sendChannelMessage`, metadata key `slackChannel` |
| `lib/getSlackContext.js` | Derives the setup state (integration exists? connected? channel set?) from the SDK data |
| `app/api/embedded-token/route.js` | Backend endpoint the browser calls to get an end-user token |
| `app/api/send-to-slack/route.js` | The payoff: list the installation's connections → resolve the channel name via the Universal lookup endpoint → run `sendChannelMessage` with `installationId` |
| `app/api/run-action/route.js` | Generic backend endpoint that runs any Universal API action with an installation's connection |
| `app/InboxClient.jsx` | The product using the connection: "Send to Slack" per conversation, with state-aware prompts and a "see how this worked" panel |
| `app/integrations/IntegrationsClient.jsx` | Customer-facing integrations cards: Connect / Manage / Add another account — no internal ids shown |
| `app/setup/SetupClient.jsx` | Live-checked setup guide teaching the MindCloud-side configuration |
| `app/layout.jsx`, `app/globals.css` | The mock SaaS shell |

Two SDK behaviors this code depends on: `sdk.getIntegrations()` with **no arguments returns the SDK's cached list** — pass `{ includeWorkflows: true }` (any options object) to force a refetch; and `sdk.install/modify` accept an **`onClose` callback** that fires when the dialog closes by any path (Finish, X, backdrop) — the reliable "refetch state now" hook.

## API contracts used by this app

All server-side calls go to `https://connect.mindcloud.co` with `Authorization: Bearer <API key>`. The API key must be **Full Access** (token minting requires it) and must never reach the browser.

### Create an end user (once per customer)

```
POST /v1/users
{ "externalId": "<your user id>", "name": "...", "email": "..." }
→ 201 { "success": true, "data": { "userId": "enduser_..." } }
```

**Important:** this endpoint does NOT deduplicate on `externalId` — calling it twice creates two end users. Store the returned `userId` in your database (this repo uses `data/users.json` as the stand-in) and reuse it.

### Mint an end-user token (per page load / session)

```
GET /v1/users/{userId}/token
→ 200 { "token": "<jwt>" }
```

Tokens are short-lived-ish (about two weeks); minting a fresh one per integrations-page load is the simple correct pattern. Hand the token to the browser; the SDK sends it as its own Authorization header.

### The embedded SDK (browser)

Load `{EMBEDDED_BASE}/assets/embedded/sdk.1.0.0.min.js` (default base `https://embedded.mindcloud.co`), which defines `window.MindCloud`.

```js
const sdk = window.MindCloud({ baseUrl: EMBEDDED_BASE });
sdk.setToken(token);
const integrations = await sdk.getIntegrations();
// each: { id, name, description, app: { iconUrl, slug }, apps: [...], installations: [{ id, isInstalled, metadata, apps: [...] }] }
sdk.install({ integrationId, onAuthenticationComplete: refresh });   // new installation
sdk.modify({ installationId, onAuthenticationComplete: refresh });   // manage existing
```

Do not pass `appBaseUrl` — the OAuth popup must open on MindCloud's own origin. The modal owns the whole connect UX: credential forms, OAuth popups, and (for integrations that declare metadata definitions) a per-installation Options form.

Other SDK methods, if needed: `uninstall`, `reinstall`, `activate`, `deactivate`, `updateMetadata({ installationId, metadata })`, `getTokenExpiration()`.

### Run a Universal API action with an end user's connection

```
POST /v2/universal/apps/{appSlug}/actions/{actionSlug}/run
{ "installationId": "install_...", "arguments": { ... } }
→ 200 { "success": true, "data": [...], "meta": { ... } }
```

- `installationId` and `connectionId` are mutually exclusive (`CONNECTION_SELECTOR_CONFLICT`).
- Optional `endUserId` alongside `installationId` acts as a consistency check (mismatch → 404 `INSTALLATION_NOT_FOUND`).
- Error codes: `INSTALLATION_NOT_FOUND` (404), `APP_NOT_IN_INSTALLATION` (404, the app isn't part of that installation's integration), `NO_END_USER_CONNECTION` (400, the end user hasn't connected that app yet), `CONNECTION_REQUIRED` (400, multiple connections for the same app on one installation — list them and call with `connectionId` alone).
- Optional response controls: `fields`, `limit`, `offset`, `sort`, `where` (honored where the action supports them).
- Requires API key access level `run_workflows` or higher.

### Discovery and connection listing (server-side)

```
GET /v2/universal/apps                                  — app catalog
GET /v2/universal/apps/{appSlug}/actions                — action list for an app
GET /v2/universal/apps/{appSlug}/actions/{actionSlug}   — full argument schema for one action
GET /v2/connections?where=installationId=="install_..." — an installation's connections
```

Per-app human docs with the same slugs and schemas: https://mindcloud.co/docs/universal

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `MINDCLOUD_API_KEY` | yes | Full Access key. Server-side only. |
| `DEMO_USER_EMAIL` / `DEMO_USER_NAME` | no | Identity of the demo end user this app creates. |
| `MINDCLOUD_API_BASE_URL` | no | Defaults to `https://connect.mindcloud.co`. |
| `NEXT_PUBLIC_MINDCLOUD_EMBEDDED_BASE_URL` | no | Defaults to `https://embedded.mindcloud.co`. |

## Adapting these patterns to another codebase

1. **Identity:** replace `demo-user-1` in `app/api/embedded-token/route.js` with the signed-in user's id from your session, and replace `lib/demoUserStore.js` with a `mindcloud_end_user_id` column on your users table.
2. **Authorization:** gate your equivalent of `/api/run-action` — verify the `installationId` belongs to the signed-in customer before running actions with it (store installationIds per user when the SDK's `onAuthenticationComplete` fires, or verify via `GET /v2/connections`).
3. **Secrets:** the API key stays server-side, in env/secret storage. The browser only ever holds the per-end-user token.
4. **Framework:** nothing here is Next.js-specific. You need: one backend endpoint that mints end-user tokens, one page that loads the SDK script and renders `sdk.getIntegrations()`, and backend calls to the Universal API run endpoint. Ports to any stack.
5. **MindCloud-side setup** (done once by the vendor in the dashboard, not via API): enable Embedded, create an integration (Connect-Only for pure API use), attach the apps customers should connect, optionally define metadata (options) the connect dialog collects per installation.
