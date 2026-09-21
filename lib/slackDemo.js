// The one concrete story this demo tells: "send a conversation to the
// customer's Slack channel". These constants address MindCloud's Slack app on
// the Universal API and name the per-installation option this app reads.
export const SLACK_APP_SLUG = 'slack';
export const SLACK_SEND_ACTION_SLUG = 'sendChannelMessage';

// Metadata definition the developer creates on the integration (Integration
// Metadata → Add Metadata): label "Slack channel", key exactly this, type text.
// End users fill it in the connect dialog's Options tab; this app reads it from
// installation.metadata and resolves the name to a channel id at send time.
export const SLACK_CHANNEL_METADATA_KEY = 'slackChannel';
