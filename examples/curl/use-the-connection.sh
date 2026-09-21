#!/usr/bin/env bash
# Step 3 — Use the connection (raw HTTP)
#
# The same call shape for every app and action, addressed by installationId.

# Read: list the customer's Slack channels.
# Action slugs are the docs-style kebab form: listChannels -> list-channels.
curl -X POST https://connect.mindcloud.co/v2/universal/apps/slack/actions/list-channels/run \
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "installationId": "install_...", "arguments": { "excludeArchived": true } }'

# Write: post a message as that customer.
curl -X POST https://connect.mindcloud.co/v2/universal/apps/slack/actions/send-channel-message/run \
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "installationId": "install_...", "arguments": { "channel": "C0123", "text": "Hello" } }'

# Browse every app, its actions, and their argument schemas:
curl https://connect.mindcloud.co/v2/universal/apps -H "Authorization: Bearer $MINDCLOUD_API_KEY"
curl https://connect.mindcloud.co/v2/universal/apps/slack/actions -H "Authorization: Bearer $MINDCLOUD_API_KEY"
curl https://connect.mindcloud.co/v2/universal/apps/slack/actions/send-channel-message -H "Authorization: Bearer $MINDCLOUD_API_KEY"

# List an installation's connections:
curl -G https://connect.mindcloud.co/v2/connections \
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \
  --data-urlencode 'where=installationId==install_...'
