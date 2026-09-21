// The payoff of the whole demo: the app USES the customer's Slack connection.
// Three Universal API calls, all with the server-side API key:
//   1. find the installation's Slack connection      (GET  /v2/connections)
//   2. resolve the channel NAME to its Slack id      (GET  .../lookups/channel)
//   3. send the message with the user's connection   (POST .../run)
import { listInstallationConnections, resolveUniversalLookup, runUniversalAction } from '../../../lib/mindcloud.js';
import { SLACK_APP_SLUG, SLACK_SEND_ACTION_SLUG } from '../../../lib/slackDemo.js';

export async function POST(request) {
  const { installationId, appId, channelName, text } = await request.json().catch(() => ({}));

  if (!installationId || !channelName || !text) {
    return Response.json({ success: false, message: 'installationId, channelName and text are required.' }, { status: 400 });
  }

  // A real app should also check the installation belongs to the signed-in
  // user before running actions with it.
  const connections = await listInstallationConnections({ installationId });
  const connection = (connections.body?.data || []).find((row) => !appId || row.appId === appId);

  if (!connection) {
    return Response.json({ success: false, message: 'No Slack connection found on this installation yet.' }, { status: 404 });
  }

  const lookup = await resolveUniversalLookup({
    appSlug: SLACK_APP_SLUG,
    actionSlug: SLACK_SEND_ACTION_SLUG,
    argumentKey: 'channel',
    connectionId: connection.id,
    q: channelName.replace(/^#/, '')
  });

  const resolution = lookup.body?.data;

  if (resolution?.status !== 'resolved') {
    const candidates = (resolution?.candidates || []).map((candidate) => candidate.label).slice(0, 5);
    const suffix = candidates.length > 0 ? ` Did you mean: ${candidates.join(', ')}?` : '';
    return Response.json({ success: false, message: `Could not find a Slack channel named "${channelName}".${suffix}` }, { status: 404 });
  }

  const runArguments = { channel: resolution.selected.value, text };
  const run = await runUniversalAction({
    appSlug: SLACK_APP_SLUG,
    actionSlug: SLACK_SEND_ACTION_SLUG,
    installationId,
    actionArguments: runArguments
  });

  if (!run.body?.success) {
    return Response.json({ success: false, message: run.body?.message || run.body?.error?.message || 'Slack rejected the message.' }, { status: run.status });
  }

  // `request` powers the "see how this worked" panel in the UI — it is the
  // exact body a partner backend would send.
  return Response.json({
    success: true,
    channel: resolution.selected,
    request: {
      url: `POST /v2/universal/apps/${SLACK_APP_SLUG}/actions/${SLACK_SEND_ACTION_SLUG}/run`,
      body: { installationId, arguments: runArguments }
    },
    response: run.body
  });
}
