// Your backend's job in the embedded flow: know which of YOUR users is asking,
// resolve their MindCloud end user (create on first sight), and mint them a
// short-lived embedded token. The browser never sees your API key.
import { getEndUserToken } from '../../../lib/mindcloud.js';
import { getOrCreateEndUserId } from '../../../lib/demoUserStore.js';

export async function POST() {
  // A real app takes this from its session. The demo has exactly one user.
  const appUser = {
    appUserId: 'demo-user-1',
    name: process.env.DEMO_USER_NAME || 'Demo User',
    email: process.env.DEMO_USER_EMAIL || 'demo@example.com'
  };

  const resolved = await getOrCreateEndUserId(appUser);
  if (resolved.error) {
    return Response.json({ success: false, message: resolved.error }, { status: resolved.status || 500 });
  }

  const tokenResponse = await getEndUserToken(resolved.endUserId);
  const token = tokenResponse.body?.token;

  if (!token) {
    return Response.json(
      { success: false, message: tokenResponse.body?.message || tokenResponse.body?.error || 'Failed to mint the end-user token.' },
      { status: tokenResponse.status || 500 }
    );
  }

  return Response.json({ success: true, token });
}
