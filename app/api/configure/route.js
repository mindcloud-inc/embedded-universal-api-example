// Lets the setup page hand this app its MindCloud API key: the key is checked
// against the API before it is persisted to .env.local, so a typo can't get
// saved. It stays server-side — the browser posts it once and never sees it
// again.
import { getMindCloudStatus } from '../../../lib/getMindCloudStatus.js';
import { saveApiKey } from '../../../lib/apiKey.js';

export async function POST(request) {
  const { apiKey } = await request.json().catch(() => ({}));
  const trimmedApiKey = String(apiKey || '').trim();

  if (!trimmedApiKey) {
    return Response.json({ success: false, message: 'Paste your MindCloud API key.' }, { status: 400 });
  }

  const status = await getMindCloudStatus(trimmedApiKey);

  if (status.error) {
    return Response.json({ success: false, message: status.error }, { status: status.status });
  }

  saveApiKey(trimmedApiKey);

  return Response.json({ success: true, ...status });
}
