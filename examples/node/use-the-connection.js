// Step 3 — Use the connection (Node.js / Express)
//
// One helper covers every app and action. Reads and writes are the same call
// with a different action slug.
const API = 'https://connect.mindcloud.co';

const headers = {
  Authorization: `Bearer ${process.env.MINDCLOUD_API_KEY}`,
  'Content-Type': 'application/json'
};

// Action slugs are the docs-style kebab form: listChannels → list-channels.
const runAction = async ({ appSlug, actionSlug, installationId, args }) => {
  const response = await fetch(`${API}/v2/universal/apps/${appSlug}/actions/${actionSlug}/run`, {
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
});
