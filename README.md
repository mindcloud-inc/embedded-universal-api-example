# MindCloud Embedded Example

A tiny fake SaaS app ("Beacon") that shows the full MindCloud embedded story with one concrete feature: **your customers connect their own Slack on your integrations page, and your app posts to their channel** — no Slack tokens ever touch your code.

## Run it

```bash
npm install
npm run setup    # paste your MindCloud API key
npm run dev
```

Open **http://localhost:4321** — the app's built-in **Setup guide** walks you through the rest (create the Slack integration in MindCloud, connect it, hit "Send to Slack" in the Inbox). Five minutes, live checkmarks.

Need an API key? [app.mindcloud.co](https://app.mindcloud.co) → Settings → API Keys → **Full Access**.

## Build this into your own app

Point your AI coding tool at **[LLM.md](./LLM.md)** — it explains every file, every API call, and how to adapt the patterns to your stack.
