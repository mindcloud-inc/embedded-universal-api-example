# MindCloud Embedded Example

A tiny fake SaaS app ("Beacon") that shows the full MindCloud embedded story with one concrete feature: **your customers connect their own Slack on your integrations page, and your app posts to their channel** — no Slack tokens ever touch your code.

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:4321**. The built-in **Demo Setup Guide** takes it from there: paste a MindCloud API key right in the page, then follow the live-checked steps until the Inbox unlocks.

Need a key? [app.mindcloud.co](https://app.mindcloud.co) → Settings → API Keys → **Full Access**. It's stored server-side in `.env.local` and never sent to the browser.

## Build this into your own app

Point your AI coding tool at **[LLM.md](./LLM.md)** — it explains every file, every API call, and how to adapt the patterns to your stack.
