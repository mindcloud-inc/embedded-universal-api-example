# MindCloud Embedded Example

A tiny fake SaaS app ("Beacon") that shows the full MindCloud embedded story with one concrete feature: **your customers connect their own Slack on your integrations page, and your app posts to their channel** — no Slack tokens ever touch your code.

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:4321** (port busy? run `npx next dev -p 5000` instead). The built-in **Demo Setup Guide** checks off each step below as you complete it.

> **Start step 2 now if you haven't.** Embedded is switched on per organization by MindCloud, and nothing else works until it is — every call just returns empty. It is the only step with a human in the loop.

---

## Setup guide

1. **Create a MindCloud account and organization** — sign up at [MindCloud Gravity](https://app.mindcloud.co/signup). Your organization is the account your customers' connections live under.
2. **Ask your MindCloud representative to enable Embedded** — it is enabled per organization by MindCloud.
3. **Create an API key and paste it here** — a **Full Access** key from [Settings → API Keys](https://app.mindcloud.co/user/api-keys), pasted into the setup page. It is stored server-side in `.env.local` and never sent to the browser.
4. **Show the API pages in the dashboard** — in [Embedded](https://app.mindcloud.co/embedded), switch on *"Connecting through your codebase?"*. This only reveals the Embedded API pages for **your dashboard user** (each teammate flips it for themselves); it is not an access gate, and nothing about the Universal API depends on it.
5. **Create a Slack integration** — on [Embedded → API → Integrations](https://app.mindcloud.co/embedded/api), click **Create Integration** and pick **Slack**. This defines what your customers can connect.
6. **Connect Slack as an end user** — open this app's Integrations page and connect Slack the way your customers would.
7. **Send something** — on the Inbox, pick a channel and hit **Send to Slack**. Two live Universal API calls: one to list the channels, one to post the message.

---

## Build this into your own app

The app's **See Code Implementation** page shows the three pieces (customer handshake, frontend SDK, Universal API calls) with a diagram, syntax-highlighted source, and a stack picker.

Prefer to browse? The same examples live in **[examples/](./examples)** — Node.js, Python, Go, Ruby, PHP and curl for the backend steps; React, Vue and plain JavaScript for the frontend step. The code page reads those exact files, so they never drift.

For the complete reference — API contracts, error codes, and how to adapt the patterns to your stack — point your AI coding tool at **[LLM.md](./LLM.md)**.
