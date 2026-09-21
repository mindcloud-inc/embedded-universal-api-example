// Universal API call #1 (read): list the channels in the customer's Slack.
// Your backend supplies the API key; the connection is addressed by the
// installationId from the customer's integrations page.
import { runUniversalAction } from '../../../lib/mindcloud.js';
import { SLACK_APP_SLUG, SLACK_LIST_CHANNELS_ACTION_SLUG } from '../../../lib/slackDemo.js';

export async function POST(request) {
  const { installationId } = await request.json().catch(() => ({}));

  if (!installationId) {
    return Response.json({ success: false, message: 'installationId is required.' }, { status: 400 });
  }

  // A real app should check this installation belongs to the signed-in user.
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
