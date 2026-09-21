# Step 1 — Identify the customer (Python / FastAPI)
#
# Create the MindCloud end user once, store the id on your own user row, then
# mint a short-lived token whenever that customer opens your integrations page.
import os

import httpx

API = "https://connect.mindcloud.co"
HEADERS = {"Authorization": f"Bearer {os.environ['MINDCLOUD_API_KEY']}"}


# POST /v1/users does NOT deduplicate — calling it twice creates two end users.
async def create_end_user(user) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API}/v1/users",
            headers=HEADERS,
            json={"externalId": user.id, "name": user.name, "email": user.email},
        )

    return response.json()["data"]["userId"]


@app.post("/api/embedded-token")
async def embedded_token(user=Depends(current_user)):
    end_user_id = user.mindcloud_end_user_id

    if not end_user_id:
        end_user_id = await create_end_user(user)
        await db.users.update(user.id, mindcloud_end_user_id=end_user_id)

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API}/v1/users/{end_user_id}/token", headers=HEADERS)

    return {"token": response.json()["token"]}
