// Step 1 — Identify the customer (Node.js / Express)
//
// Create the MindCloud end user once, store the id on your own user row, then
// mint a short-lived token whenever that customer opens your integrations page.
// Your API key stays on the server; the browser only ever holds the token.
const API = 'https://connect.mindcloud.co';

const headers = {
  Authorization: `Bearer ${process.env.MINDCLOUD_API_KEY}`,
  'Content-Type': 'application/json'
};

// POST /v1/users does NOT deduplicate — calling it twice creates two end users.
const createEndUser = async (user) => {
  const response = await fetch(`${API}/v1/users`, {
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

  const response = await fetch(`${API}/v1/users/${endUserId}/token`, { headers });
  const { token } = await response.json();

  res.json({ token });
});
