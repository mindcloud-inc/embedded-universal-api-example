// Server-side MindCloud API client. The API key lives only here (and in env) —
// the browser never sees it. End users authenticate with short-lived tokens
// minted by your backend instead.
import { getApiKey } from './apiKey.js';

const API_BASE_URL = process.env.MINDCLOUD_API_BASE_URL || 'https://connect.mindcloud.co';

const request = async ({ method, path, body, apiKey = getApiKey() }) => {
  if (!apiKey) {
    return { status: 401, body: { success: false, message: 'NO_API_KEY' } };
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const responseBody = await response.json().catch(() => ({}));
  return { status: response.status, body: responseBody };
};

// Reads the organization the API key belongs to. `settings` tells you how the
// org is configured — including whether Embedded is enabled for it.
// Who this key is and what its organization has enabled. Never infer the
// company from GET /v2/companies: an admin key can list every organization.
export const getMe = async (apiKey) => {
  return request({ method: 'GET', path: '/v2/me', apiKey });
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
