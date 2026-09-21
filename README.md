# MindCloud Embedded Example

A tiny fake SaaS app with a working **Integrations page**: your customers connect their own Slack / Gmail / whatever inside your app, and your backend calls those apps through one API.

## Run it

```bash
npm install
npm run setup    # paste your MindCloud API key
npm run dev
```

Open **http://localhost:4321/integrations**. Connect something. Click **"Try the API with this connection"**.

- Need an API key? [app.mindcloud.co](https://app.mindcloud.co) → Settings → API Keys → **Full Access**.
- Page empty? Create an integration at [app.mindcloud.co/embedded](https://app.mindcloud.co/embedded) (Connect-Only → pick Slack), then refresh.

## Build this into your own app

Point your AI coding tool at **[LLM.md](./LLM.md)** — it explains every file, every API call, and how to adapt the patterns to your stack.
