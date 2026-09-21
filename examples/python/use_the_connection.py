# Step 3 — Use the connection (Python / FastAPI)
#
# One helper covers every app and action. Reads and writes are the same call
# with a different action slug.
import os

import httpx

API = "https://connect.mindcloud.co"
HEADERS = {"Authorization": f"Bearer {os.environ['MINDCLOUD_API_KEY']}"}


# Action slugs are the docs-style kebab form: listChannels -> list-channels.
async def run_action(app_slug: str, action_slug: str, installation_id: str, arguments: dict) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API}/v2/universal/apps/{app_slug}/actions/{action_slug}/run",
            headers=HEADERS,
            json={"installationId": installation_id, "arguments": arguments},
        )

    return response.json()


# Read: the customer's Slack channels.
@app.get("/api/slack/channels")
async def slack_channels(user=Depends(current_user)):
    body = await run_action("slack", "list-channels", installation_for(user), {"excludeArchived": True})
    return [{"id": row["id"], "name": row["name"]} for row in body["data"]]


# Write: post as that customer.
@app.post("/api/slack/send")
async def slack_send(payload: SendPayload, user=Depends(current_user)):
    return await run_action(
        "slack",
        "send-channel-message",
        installation_for(user),
        {"channel": payload.channel_id, "text": payload.text},
    )
