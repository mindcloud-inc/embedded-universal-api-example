#!/usr/bin/env bash
# Step 1 — Identify the customer (raw HTTP)
#
# The two calls your backend makes. Your API key never leaves the server.

# 1. Create the end user ONCE and store data.userId on your own user record.
#    This endpoint does not deduplicate: calling it twice creates two users.
curl -X POST https://connect.mindcloud.co/v1/users \
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "externalId": "<your user id>", "name": "Ada Lovelace", "email": "ada@acme.com" }'
# → { "success": true, "data": { "userId": "enduser_..." } }

# 2. Mint a short-lived token whenever that customer opens your integrations page.
curl https://connect.mindcloud.co/v1/users/enduser_.../token \
  -H "Authorization: Bearer $MINDCLOUD_API_KEY"
# → { "token": "<jwt>" }   ← hand this to the browser

# Check your key and what your organization has enabled:
curl https://connect.mindcloud.co/v2/me \
  -H "Authorization: Bearer $MINDCLOUD_API_KEY"
# → { "data": { "company": { "name": "...", "embedded": { "isEnabled": true } } } }
