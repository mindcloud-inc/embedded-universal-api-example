import { SLACK_APP_SLUG, SLACK_CHANNEL_METADATA_KEY } from './slackDemo.js';

// Derives the demo's Slack state from the SDK's integrations data. Each absence
// maps to one setup step the UI walks the user through.
export const getSlackContext = (integrations) => {
  const integration = (integrations || []).find((item) => (item.apps || []).some((app) => app.slug === SLACK_APP_SLUG));
  const slackApp = integration?.apps?.find((app) => app.slug === SLACK_APP_SLUG) || null;
  const installations = integration?.installations || [];
  const installation = installations.find((item) => item.isInstalled) || null;
  const channelName = installation?.metadata?.[SLACK_CHANNEL_METADATA_KEY] || '';
  const hasChannelOption = (integration?.metadataDefinitions || []).some((definition) => definition.key === SLACK_CHANNEL_METADATA_KEY);

  return { integration, slackApp, installation, channelName, hasChannelOption };
};
