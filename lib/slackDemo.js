// The one story this demo tells, in two Universal API calls:
//   1. read  — list the channels in the customer's Slack
//   2. create — post a message to the channel they picked
// Both are addressed by installationId; no Slack token touches this codebase.
export const SLACK_APP_SLUG = 'slack';
export const SLACK_LIST_CHANNELS_ACTION_SLUG = 'listChannels';
export const SLACK_SEND_ACTION_SLUG = 'sendChannelMessage';
