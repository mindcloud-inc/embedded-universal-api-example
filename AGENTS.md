# Embedded Universal API Example

A standalone, client-facing Next.js example app: mock SaaS ("Beacon") with a MindCloud embedded integrations page plus Universal API calls scoped by `installationId`. See `README.md` for the full walkthrough — it is the canonical doc and is written for external readers.

Rules for this project:

- **It must stay standalone.** No imports from `projects/shared` or any other monorepo project, no repo-internal tooling. A client should be able to copy this one folder, `npm install`, `npm run setup`, `npm run dev`.
- **It must stay small.** The point is a readable reference (~10 files) a client can hand to an LLM. Prefer deleting over abstracting; do not add features that are not demonstrating a MindCloud contract.
- Keep it aligned with the real public surface: `POST /v1/users`, `GET /v1/users/:id/token`, the hosted SDK script (`/assets/embedded/sdk.1.0.0.min.js`, `window.MindCloud`), and `POST /v2/universal/apps/:appSlug/actions/:actionSlug/run` with `installationId`. If those contracts change, update this example in the same PR (see `docs/gravity/embedded/index.md` §Connect-only integrations).
