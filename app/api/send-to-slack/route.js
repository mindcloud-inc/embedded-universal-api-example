// Universal API call #2 (create): post a message with the customer's Slack
// connection, to the channel they picked from the live channel list.
//
// Same rule as the read: the installation comes from the session, so the
// browser can only choose a channel and a message — never whose account to
// post as.
import { runUniversalAction } from '../../../lib/mindcloud.js';
import { getSessionUser } from '../../../lib/session.js';
import { getInstallationId } from '../../../lib/installationStore.js';
import { SLACK_APP_SLUG, SLACK_SEND_ACTION_SLUG } from '../../../lib/slackDemo.js';

export async function POST(request) {
  const { channelId, text } = await request.json().catch(() => ({}));

  if (!channelId || !text) {
    return Response.json({ success: false, message: 'channelId and text are required.' }, { status: 400 });
  }

  const sessionUser = await getSessionUser();
  const installationId = await getInstallationId(sessionUser.appUserId);

  if (!installationId) {
    return Response.json({ success: false, message: 'This account has not connected Slack yet.' }, { status: 409 });
  }

  const result = await runUniversalAction({
    appSlug: SLACK_APP_SLUG,
    actionSlug: SLACK_SEND_ACTION_SLUG,
    installationId,
    actionArguments: { channel: channelId, text }
  });

  if (!result.body?.success) {
    return Response.json({ success: false, message: result.body?.message || result.body?.error?.message || 'Slack rejected the message.' }, { status: result.status });
  }

  return Response.json({ success: true });
}
