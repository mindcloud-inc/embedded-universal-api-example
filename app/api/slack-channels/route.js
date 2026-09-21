// Universal API call #1 (read): list the channels in the customer's Slack.
//
// The installation is resolved from the session, never from the request body:
// an installationId is a handle to somebody's connected account, so accepting
// one from the browser would let any caller act as any customer.
import { runUniversalAction } from '../../../lib/mindcloud.js';
import { getSessionUser } from '../../../lib/session.js';
import { getInstallationId } from '../../../lib/installationStore.js';
import { SLACK_APP_SLUG, SLACK_LIST_CHANNELS_ACTION_SLUG } from '../../../lib/slackDemo.js';

export async function POST() {
  const sessionUser = await getSessionUser();
  const installationId = await getInstallationId(sessionUser.appUserId);

  if (!installationId) {
    return Response.json({ success: false, message: 'This account has not connected Slack yet.' }, { status: 409 });
  }

  const result = await runUniversalAction({
    appSlug: SLACK_APP_SLUG,
    actionSlug: SLACK_LIST_CHANNELS_ACTION_SLUG,
    installationId,
    actionArguments: { excludeArchived: true }
  });

  if (!result.body?.success) {
    return Response.json({ success: false, message: result.body?.message || result.body?.error?.message || 'Could not load Slack channels.' }, { status: result.status });
  }

  const channels = (result.body.data || []).map((channel) => ({ id: channel.id, name: channel.name })).filter((channel) => channel.id && channel.name);

  return Response.json({ success: true, channels });
}
