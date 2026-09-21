// Universal API call #2 (create): post a message with the customer's Slack
// connection, to the channel they picked from the live channel list.
import { runUniversalAction } from '../../../lib/mindcloud.js';
import { SLACK_APP_SLUG, SLACK_SEND_ACTION_SLUG } from '../../../lib/slackDemo.js';

export async function POST(request) {
  const { installationId, channelId, text } = await request.json().catch(() => ({}));

  if (!installationId || !channelId || !text) {
    return Response.json({ success: false, message: 'installationId, channelId and text are required.' }, { status: 400 });
  }

  // A real app should check this installation belongs to the signed-in user.
  const runArguments = { channel: channelId, text };
  const result = await runUniversalAction({
    appSlug: SLACK_APP_SLUG,
    actionSlug: SLACK_SEND_ACTION_SLUG,
    installationId,
    actionArguments: runArguments
  });

  if (!result.body?.success) {
    return Response.json({ success: false, message: result.body?.message || result.body?.error?.message || 'Slack rejected the message.' }, { status: result.status });
  }

  // `request` powers the "see how this worked" panel — it is the exact body a
  // partner backend would send.
  return Response.json({
    success: true,
    request: {
      url: `POST /v2/universal/apps/${SLACK_APP_SLUG}/actions/${SLACK_SEND_ACTION_SLUG}/run`,
      body: { installationId, arguments: runArguments }
    },
    response: result.body
  });
}
