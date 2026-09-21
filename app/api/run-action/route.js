// Runs a Universal API action with an end user's connection. Your backend adds
// the API key; the browser only names the installation and the action.
import { runUniversalAction } from '../../../lib/mindcloud.js';

export async function POST(request) {
  const { appSlug, actionSlug, installationId, arguments: actionArguments } = await request.json().catch(() => ({}));

  if (!appSlug || !actionSlug || !installationId) {
    return Response.json({ success: false, message: 'appSlug, actionSlug and installationId are required.' }, { status: 400 });
  }

  // A real app should also check the installation belongs to the signed-in
  // user before running actions with it (store installationIds per user, or
  // verify via GET /v2/connections?where=installationId=="...").
  const result = await runUniversalAction({ appSlug, actionSlug, installationId, actionArguments });

  return Response.json(result.body, { status: result.status });
}
