# Examples by stack

The same three steps as the running app, in the language you actually use.
Every file here is what the **See Code Implementation** page renders when you
pick a stack — the page reads these files, so they never drift.

| Step | What it does | Where it runs |
| --- | --- | --- |
| 1. Identify the customer | Create the MindCloud end user once, mint a short-lived token per session | Backend |
| 2. Let the customer connect | Load the SDK with that token and open the MindCloud-hosted dialog | Frontend |
| 3. Use the connection | Call any of the 3,400+ apps by `installationId` | Backend |

## Backend

| Stack | Step 1 | Step 3 |
| --- | --- | --- |
| Node.js / Express | [node/identify-the-customer.js](node/identify-the-customer.js) | [node/use-the-connection.js](node/use-the-connection.js) |
| Python / FastAPI | [python/identify_the_customer.py](python/identify_the_customer.py) | [python/use_the_connection.py](python/use_the_connection.py) |
| Go | [go/identify_the_customer.go](go/identify_the_customer.go) | [go/use_the_connection.go](go/use_the_connection.go) |
| Ruby / Rails | [ruby/identify_the_customer.rb](ruby/identify_the_customer.rb) | [ruby/use_the_connection.rb](ruby/use_the_connection.rb) |
| PHP / Laravel | [php/IdentifyTheCustomer.php](php/IdentifyTheCustomer.php) | [php/UseTheConnection.php](php/UseTheConnection.php) |
| curl | [curl/identify-the-customer.sh](curl/identify-the-customer.sh) | [curl/use-the-connection.sh](curl/use-the-connection.sh) |

## Frontend

| Stack | Step 2 |
| --- | --- |
| React | [react/useMindCloud.js](react/useMindCloud.js) |
| Vue | [vue/useMindCloud.js](vue/useMindCloud.js) |
| Plain JavaScript | [vanilla/integrations.html](vanilla/integrations.html) |

Next.js is not listed here because this repo **is** the Next.js example — the
running app's own files (`app/api/*`, `lib/*`) are what the code page shows for
that stack.

## Three things that trip people up

1. `POST /v1/users` does **not** deduplicate. Create the end user once and store
   `data.userId` on your own user row.
2. Action slugs are the docs-style kebab form: the catalog's `listChannels` is
   addressed as `list-channels`, `sendChannelMessage` as `send-channel-message`.
3. `sdk.getIntegrations()` with no arguments returns the SDK's cached list. Pass
   any options object (e.g. `{ includeWorkflows: true }`) to force a refetch.

Full contracts and error codes: [../LLM.md](../LLM.md).
