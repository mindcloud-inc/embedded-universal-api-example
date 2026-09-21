import { SLACK_APP_SLUG } from './slackDemo.js';

// Derives the demo's state from the SDK's integrations data. Each absence maps
// to one setup step; when nothing is missing, setup is complete and the rest of
// the app unlocks.
export const getSlackContext = (integrations) => {
  const integration = (integrations || []).find((item) => (item.apps || []).some((app) => app.slug === SLACK_APP_SLUG));
  const slackApp = integration?.apps?.find((app) => app.slug === SLACK_APP_SLUG) || null;
  const installation = (integration?.installations || []).find((item) => item.isInstalled) || null;

  return {
    integration,
    slackApp,
    installation,
    isSetupComplete: Boolean(integration && installation)
  };
};
