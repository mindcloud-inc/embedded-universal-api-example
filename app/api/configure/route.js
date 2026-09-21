// Lets the setup page hand this app its MindCloud API key: the key is checked
// against the API before it is persisted to .env.local, so a typo can't get
// saved. It stays server-side — the browser posts it once and never sees it
// again.
import { getCompany } from '../../../lib/mindcloud.js';
import { saveApiKey } from '../../../lib/apiKey.js';

export async function POST(request) {
  const { apiKey } = await request.json().catch(() => ({}));
  const trimmedApiKey = String(apiKey || '').trim();

  if (!trimmedApiKey) {
    return Response.json({ success: false, message: 'Paste your MindCloud API key.' }, { status: 400 });
  }

  const result = await getCompany(trimmedApiKey);
  const company = result.body?.data?.[0];

  if (!company) {
    const message = result.status === 401 ? 'That key was rejected. Check that you copied a Full Access key.' : result.body?.message || 'Could not reach MindCloud with that key.';
    return Response.json({ success: false, message }, { status: result.status >= 400 ? result.status : 502 });
  }

  saveApiKey(trimmedApiKey);

  return Response.json({ success: true, company: { id: company.id, name: company.name } });
}
