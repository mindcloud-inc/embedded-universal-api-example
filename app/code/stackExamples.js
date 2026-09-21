// Per-stack examples for the two backend steps and the frontend step. The
// `next` entries are handled separately — those render this repo's real files.
// Everything here is plain HTTP against the same endpoints, so porting to a
// stack that isn't listed is a mechanical translation.

export const BACKEND_STACKS = [
  { value: 'next', label: 'Next.js (this repo)' },
  { value: 'node', label: 'Node.js / Express' },
  { value: 'python', label: 'Python / FastAPI' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby / Rails' },
  { value: 'php', label: 'PHP / Laravel' },
  { value: 'curl', label: 'curl' }
];

export const FRONTEND_STACKS = [
  { value: 'next', label: 'Next.js (this repo)' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'vanilla', label: 'Plain JavaScript' }
];

const IDENTIFY = {
  node: {
    file: 'routes/embeddedToken.js',
    caption: 'Express: create the end user once, mint a token per session.',
    code: `const API = 'https://connect.mindcloud.co';
const headers = {
  Authorization: \`Bearer \${process.env.MINDCLOUD_API_KEY}\`,
  'Content-Type': 'application/json'
};

// POST /v1/users does NOT deduplicate — create once, then store the id on
// your own user row and reuse it forever.
const createEndUser = async (user) => {
  const response = await fetch(\`\${API}/v1/users\`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ externalId: user.id, name: user.name, email: user.email })
  });
  const body = await response.json();
  return body.data.userId;
};

router.post('/api/embedded-token', async (req, res) => {
  const user = req.session.user;

  let endUserId = user.mindcloudEndUserId;
  if (!endUserId) {
    endUserId = await createEndUser(user);
    await db.users.update(user.id, { mindcloudEndUserId: endUserId });
  }

  const response = await fetch(\`\${API}/v1/users/\${endUserId}/token\`, { headers });
  const { token } = await response.json();

  res.json({ token });
});`
  },
  python: {
    file: 'routes/embedded_token.py',
    caption: 'FastAPI: create the end user once, mint a token per session.',
    code: `import os
import httpx

API = "https://connect.mindcloud.co"
HEADERS = {"Authorization": f"Bearer {os.environ['MINDCLOUD_API_KEY']}"}


# POST /v1/users does NOT deduplicate — create once, then store the id on
# your own user row and reuse it forever.
async def create_end_user(user) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API}/v1/users",
            headers=HEADERS,
            json={"externalId": user.id, "name": user.name, "email": user.email},
        )
    return response.json()["data"]["userId"]


@app.post("/api/embedded-token")
async def embedded_token(user=Depends(current_user)):
    end_user_id = user.mindcloud_end_user_id
    if not end_user_id:
        end_user_id = await create_end_user(user)
        await db.users.update(user.id, mindcloud_end_user_id=end_user_id)

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API}/v1/users/{end_user_id}/token", headers=HEADERS)

    return {"token": response.json()["token"]}`
  },
  go: {
    file: 'handlers/embedded_token.go',
    caption: 'Go: create the end user once, mint a token per session.',
    code: `const api = "https://connect.mindcloud.co"

func authHeader(req *http.Request) {
	req.Header.Set("Authorization", "Bearer "+os.Getenv("MINDCLOUD_API_KEY"))
	req.Header.Set("Content-Type", "application/json")
}

// POST /v1/users does NOT deduplicate — create once, then store the id on
// your own user row and reuse it forever.
func createEndUser(u User) (string, error) {
	payload, _ := json.Marshal(map[string]string{"externalId": u.ID, "name": u.Name, "email": u.Email})
	req, _ := http.NewRequest("POST", api+"/v1/users", bytes.NewReader(payload))
	authHeader(req)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	var body struct {
		Data struct {
			UserID string \`json:"userId"\`
		} \`json:"data"\`
	}
	return body.Data.UserID, json.NewDecoder(res.Body).Decode(&body)
}

func EmbeddedToken(w http.ResponseWriter, r *http.Request) {
	user := SessionUser(r)

	if user.MindCloudEndUserID == "" {
		id, err := createEndUser(user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		user.MindCloudEndUserID = id
		SaveUser(user)
	}

	req, _ := http.NewRequest("GET", api+"/v1/users/"+user.MindCloudEndUserID+"/token", nil)
	authHeader(req)

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	io.Copy(w, res.Body) // { "token": "..." }
}`
  },
  ruby: {
    file: 'app/controllers/embedded_tokens_controller.rb',
    caption: 'Rails: create the end user once, mint a token per session.',
    code: `API = "https://connect.mindcloud.co".freeze

def mindcloud_headers
  { "Authorization" => "Bearer #{ENV.fetch('MINDCLOUD_API_KEY')}", "Content-Type" => "application/json" }
end

# POST /v1/users does NOT deduplicate — create once, then store the id on
# your own user row and reuse it forever.
def create_end_user(user)
  response = HTTP.headers(mindcloud_headers).post(
    "#{API}/v1/users",
    json: { externalId: user.id, name: user.name, email: user.email }
  )
  response.parse.dig("data", "userId")
end

def create
  user = current_user
  user.update!(mindcloud_end_user_id: create_end_user(user)) if user.mindcloud_end_user_id.blank?

  response = HTTP.headers(mindcloud_headers).get("#{API}/v1/users/#{user.mindcloud_end_user_id}/token")

  render json: { token: response.parse["token"] }
end`
  },
  php: {
    file: 'app/Http/Controllers/EmbeddedTokenController.php',
    caption: 'Laravel: create the end user once, mint a token per session.',
    code: `<?php

use Illuminate\\Support\\Facades\\Http;

const API = 'https://connect.mindcloud.co';

class EmbeddedTokenController extends Controller
{
    private function client()
    {
        return Http::withToken(env('MINDCLOUD_API_KEY'))->acceptJson();
    }

    // POST /v1/users does NOT deduplicate — create once, then store the id on
    // your own user row and reuse it forever.
    private function createEndUser($user): string
    {
        $response = $this->client()->post(API . '/v1/users', [
            'externalId' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);

        return $response->json('data.userId');
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->mindcloud_end_user_id) {
            $user->update(['mindcloud_end_user_id' => $this->createEndUser($user)]);
        }

        $response = $this->client()->get(API . "/v1/users/{$user->mindcloud_end_user_id}/token");

        return ['token' => $response->json('token')];
    }
}`
  },
  curl: {
    file: 'identify-the-customer.sh',
    caption: 'The two raw calls your backend makes.',
    code: `# 1. Create the end user ONCE and store data.userId on your own user record.
#    This endpoint does not deduplicate: calling it twice creates two users.
curl -X POST https://connect.mindcloud.co/v1/users \\
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "externalId": "<your user id>", "name": "Ada Lovelace", "email": "ada@acme.com" }'
# → { "success": true, "data": { "userId": "enduser_..." } }

# 2. Mint a short-lived token whenever that customer opens your integrations page.
curl https://connect.mindcloud.co/v1/users/enduser_.../token \\
  -H "Authorization: Bearer $MINDCLOUD_API_KEY"
# → { "token": "<jwt>" }   ← hand this to the browser`
  }
};

const USE_CONNECTION = {
  node: {
    file: 'routes/slack.js',
    caption: 'Express: one read and one write against the customer\'s connection.',
    code: `const API = 'https://connect.mindcloud.co';
const headers = {
  Authorization: \`Bearer \${process.env.MINDCLOUD_API_KEY}\`,
  'Content-Type': 'application/json'
};

// Action slugs are the docs-style kebab form: listChannels → list-channels.
const runAction = async ({ appSlug, actionSlug, installationId, args }) => {
  const response = await fetch(\`\${API}/v2/universal/apps/\${appSlug}/actions/\${actionSlug}/run\`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ installationId, arguments: args })
  });
  return response.json();
};

// Read: the customer's Slack channels.
router.get('/api/slack/channels', async (req, res) => {
  const installationId = await installationForUser(req.session.user);
  const body = await runAction({
    appSlug: 'slack',
    actionSlug: 'list-channels',
    installationId,
    args: { excludeArchived: true }
  });
  res.json(body.data.map(({ id, name }) => ({ id, name })));
});

// Write: post as that customer.
router.post('/api/slack/send', async (req, res) => {
  const installationId = await installationForUser(req.session.user);
  const body = await runAction({
    appSlug: 'slack',
    actionSlug: 'send-channel-message',
    installationId,
    args: { channel: req.body.channelId, text: req.body.text }
  });
  res.json(body);
});`
  },
  python: {
    file: 'routes/slack.py',
    caption: 'FastAPI: one read and one write against the customer\'s connection.',
    code: `import os
import httpx

API = "https://connect.mindcloud.co"
HEADERS = {"Authorization": f"Bearer {os.environ['MINDCLOUD_API_KEY']}"}


# Action slugs are the docs-style kebab form: listChannels → list-channels.
async def run_action(app_slug: str, action_slug: str, installation_id: str, arguments: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API}/v2/universal/apps/{app_slug}/actions/{action_slug}/run",
            headers=HEADERS,
            json={"installationId": installation_id, "arguments": arguments},
        )
    return response.json()


# Read: the customer's Slack channels.
@app.get("/api/slack/channels")
async def slack_channels(user=Depends(current_user)):
    body = await run_action("slack", "list-channels", installation_for(user), {"excludeArchived": True})
    return [{"id": row["id"], "name": row["name"]} for row in body["data"]]


# Write: post as that customer.
@app.post("/api/slack/send")
async def slack_send(payload: SendPayload, user=Depends(current_user)):
    return await run_action(
        "slack",
        "send-channel-message",
        installation_for(user),
        {"channel": payload.channel_id, "text": payload.text},
    )`
  },
  go: {
    file: 'handlers/slack.go',
    caption: 'Go: one helper, any app and action.',
    code: `// Action slugs are the docs-style kebab form: listChannels → list-channels.
func RunAction(appSlug, actionSlug, installationID string, args map[string]any) (map[string]any, error) {
	payload, _ := json.Marshal(map[string]any{
		"installationId": installationID,
		"arguments":      args,
	})

	url := fmt.Sprintf("%s/v2/universal/apps/%s/actions/%s/run", api, appSlug, actionSlug)
	req, _ := http.NewRequest("POST", url, bytes.NewReader(payload))
	authHeader(req)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var body map[string]any
	return body, json.NewDecoder(res.Body).Decode(&body)
}

// Read: the customer's Slack channels.
channels, err := RunAction("slack", "list-channels", installationID, map[string]any{
	"excludeArchived": true,
})

// Write: post as that customer.
sent, err := RunAction("slack", "send-channel-message", installationID, map[string]any{
	"channel": channelID,
	"text":    text,
})`
  },
  ruby: {
    file: 'app/services/mind_cloud.rb',
    caption: 'Rails: one helper, any app and action.',
    code: `API = "https://connect.mindcloud.co".freeze

# Action slugs are the docs-style kebab form: listChannels → list-channels.
def run_action(app_slug:, action_slug:, installation_id:, arguments: {})
  response = HTTP.headers(mindcloud_headers).post(
    "#{API}/v2/universal/apps/#{app_slug}/actions/#{action_slug}/run",
    json: { installationId: installation_id, arguments: arguments }
  )
  response.parse
end

# Read: the customer's Slack channels.
channels = run_action(
  app_slug: "slack",
  action_slug: "list-channels",
  installation_id: installation_id,
  arguments: { excludeArchived: true }
).fetch("data").map { |row| row.slice("id", "name") }

# Write: post as that customer.
run_action(
  app_slug: "slack",
  action_slug: "send-channel-message",
  installation_id: installation_id,
  arguments: { channel: channel_id, text: text }
)`
  },
  php: {
    file: 'app/Services/MindCloud.php',
    caption: 'Laravel: one helper, any app and action.',
    code: `<?php

use Illuminate\\Support\\Facades\\Http;

const API = 'https://connect.mindcloud.co';

// Action slugs are the docs-style kebab form: listChannels → list-channels.
function runAction(string $appSlug, string $actionSlug, string $installationId, array $arguments = []): array
{
    return Http::withToken(env('MINDCLOUD_API_KEY'))
        ->acceptJson()
        ->post(API . "/v2/universal/apps/{$appSlug}/actions/{$actionSlug}/run", [
            'installationId' => $installationId,
            'arguments' => $arguments,
        ])
        ->json();
}

// Read: the customer's Slack channels.
$channels = runAction('slack', 'list-channels', $installationId, ['excludeArchived' => true])['data'];

// Write: post as that customer.
runAction('slack', 'send-channel-message', $installationId, [
    'channel' => $channelId,
    'text' => $text,
]);`
  },
  curl: {
    file: 'use-the-connection.sh',
    caption: 'The same call shape for every app and action.',
    code: `# Read: list the customer's Slack channels.
# Action slugs are the docs-style kebab form: listChannels → list-channels.
curl -X POST https://connect.mindcloud.co/v2/universal/apps/slack/actions/list-channels/run \\
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "installationId": "install_...", "arguments": { "excludeArchived": true } }'

# Write: post a message as that customer.
curl -X POST https://connect.mindcloud.co/v2/universal/apps/slack/actions/send-channel-message/run \\
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "installationId": "install_...", "arguments": { "channel": "C0123", "text": "Hello" } }'

# Browse every app's actions and argument schemas:
#   GET /v2/universal/apps
#   GET /v2/universal/apps/{appSlug}/actions
#   GET /v2/universal/apps/{appSlug}/actions/{actionSlug}`
  }
};

const CONNECT = {
  react: {
    file: 'useMindCloud.js',
    caption: 'React: load the SDK with your backend\'s token, then open the dialog.',
    code: `import { useCallback, useEffect, useRef, useState } from 'react';

const EMBEDDED = 'https://embedded.mindcloud.co';

const loadSdk = () =>
  new Promise((resolve, reject) => {
    if (window.MindCloud) return resolve();
    const script = document.createElement('script');
    script.src = \`\${EMBEDDED}/assets/embedded/sdk.1.0.0.min.js\`;
    script.onload = () => (window.MindCloud ? resolve() : reject(new Error('SDK failed to load')));
    script.onerror = () => reject(new Error('SDK failed to load'));
    document.head.appendChild(script);
  });

export const useMindCloud = () => {
  const sdk = useRef(null);
  const [integrations, setIntegrations] = useState(null);

  // Pass any options object to force a refetch — a bare call returns the cache.
  const refresh = useCallback(async () => {
    setIntegrations((await sdk.current?.getIntegrations({ includeWorkflows: true })) || []);
  }, []);

  useEffect(() => {
    (async () => {
      const { token } = await fetch('/api/embedded-token', { method: 'POST' }).then((r) => r.json());
      await loadSdk();
      sdk.current = window.MindCloud({ baseUrl: EMBEDDED });
      sdk.current.setToken(token);
      await refresh();
    })();
  }, [refresh]);

  return {
    integrations,
    // onClose fires however the dialog is dismissed — the reliable refetch hook.
    connect: (integrationId) => sdk.current?.install({ integrationId, onClose: refresh }),
    manage: (installationId) => sdk.current?.modify({ installationId, onClose: refresh })
  };
};`
  },
  vue: {
    file: 'useMindCloud.js',
    caption: 'Vue: same flow with the composition API.',
    code: `import { onMounted, ref } from 'vue';

const EMBEDDED = 'https://embedded.mindcloud.co';

const loadSdk = () =>
  new Promise((resolve, reject) => {
    if (window.MindCloud) return resolve();
    const script = document.createElement('script');
    script.src = \`\${EMBEDDED}/assets/embedded/sdk.1.0.0.min.js\`;
    script.onload = () => (window.MindCloud ? resolve() : reject(new Error('SDK failed to load')));
    script.onerror = () => reject(new Error('SDK failed to load'));
    document.head.appendChild(script);
  });

export const useMindCloud = () => {
  const sdk = ref(null);
  const integrations = ref(null);

  // Pass any options object to force a refetch — a bare call returns the cache.
  const refresh = async () => {
    integrations.value = (await sdk.value?.getIntegrations({ includeWorkflows: true })) || [];
  };

  onMounted(async () => {
    const { token } = await fetch('/api/embedded-token', { method: 'POST' }).then((r) => r.json());
    await loadSdk();
    sdk.value = window.MindCloud({ baseUrl: EMBEDDED });
    sdk.value.setToken(token);
    await refresh();
  });

  return {
    integrations,
    // onClose fires however the dialog is dismissed — the reliable refetch hook.
    connect: (integrationId) => sdk.value?.install({ integrationId, onClose: refresh }),
    manage: (installationId) => sdk.value?.modify({ installationId, onClose: refresh })
  };
};`
  },
  vanilla: {
    file: 'integrations.html',
    caption: 'No framework: a script tag and a few lines.',
    code: `<script src="https://embedded.mindcloud.co/assets/embedded/sdk.1.0.0.min.js"></script>
<div id="integrations"></div>

<script>
  const sdk = window.MindCloud({ baseUrl: 'https://embedded.mindcloud.co' });

  const render = (integrations) => {
    document.getElementById('integrations').innerHTML = integrations
      .map((integration) => \`<button data-id="\${integration.id}">Connect \${integration.name}</button>\`)
      .join('');
  };

  // Pass any options object to force a refetch — a bare call returns the cache.
  const refresh = async () => render(await sdk.getIntegrations({ includeWorkflows: true }));

  (async () => {
    const { token } = await fetch('/api/embedded-token', { method: 'POST' }).then((r) => r.json());
    sdk.setToken(token);
    await refresh();
  })();

  document.getElementById('integrations').addEventListener('click', (event) => {
    const integrationId = event.target.dataset.id;
    // onClose fires however the dialog is dismissed — the reliable refetch hook.
    if (integrationId) sdk.install({ integrationId, onClose: refresh });
  });
</script>`
  }
};

export const STACK_EXAMPLES = {
  1: IDENTIFY,
  2: CONNECT,
  3: USE_CONNECTION
};
