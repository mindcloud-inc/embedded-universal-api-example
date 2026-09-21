// Server-side MindCloud API client. The API key lives only here (and in env) —
// the browser never sees it. End users authenticate with short-lived tokens
// minted by your backend instead.
const API_BASE_URL = process.env.MINDCLOUD_API_BASE_URL || 'https://connect.mindcloud.co';

const request = async ({ method, path, body }) => {
  if (!process.env.MINDCLOUD_API_KEY) {
    return { status: 500, body: { success: false, message: 'MINDCLOUD_API_KEY is not set. Run `npm run setup` first.' } };
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.MINDCLOUD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const responseBody = await response.json().catch(() => ({}));
  return { status: response.status, body: responseBody };
};

// Creates an embedded end user in your MindCloud account. Store the returned
// userId against your own user record — it is the identity every later call uses.
export const createEndUser = async ({ externalId, name, email }) => {
  return request({ method: 'POST', path: '/v1/users', body: { externalId, name, email } });
};

// Mints a short-lived token for one end user. Hand this to the browser; the
// embedded SDK sends it as its Authorization header.
export const getEndUserToken = async (userId) => {
  return request({ method: 'GET', path: `/v1/users/${userId}/token` });
};

// Runs one Universal API action using the end user's connection, addressed by
// the installationId from their integrations page — no provider tokens touch
// your code.
export const runUniversalAction = async ({ appSlug, actionSlug, installationId, actionArguments }) => {
  return request({
    method: 'POST',
    path: `/v2/universal/apps/${encodeURIComponent(appSlug)}/actions/${encodeURIComponent(actionSlug)}/run`,
    body: { installationId, arguments: actionArguments || {} }
  });
};
