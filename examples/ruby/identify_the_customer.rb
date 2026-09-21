# Step 1 — Identify the customer (Ruby / Rails)
#
# Create the MindCloud end user once, store the id on your own user row, then
# mint a short-lived token whenever that customer opens your integrations page.
class EmbeddedTokensController < ApplicationController
  API = "https://connect.mindcloud.co".freeze

  def create
    user = current_user

    # POST /v1/users does NOT deduplicate — calling it twice creates two users.
    user.update!(mindcloud_end_user_id: create_end_user(user)) if user.mindcloud_end_user_id.blank?

    response = HTTP.headers(mindcloud_headers).get("#{API}/v1/users/#{user.mindcloud_end_user_id}/token")

    render json: { token: response.parse["token"] }
  end

  private

  def mindcloud_headers
    {
      "Authorization" => "Bearer #{ENV.fetch('MINDCLOUD_API_KEY')}",
      "Content-Type" => "application/json"
    }
  end

  def create_end_user(user)
    response = HTTP.headers(mindcloud_headers).post(
      "#{API}/v1/users",
      json: { externalId: user.id, name: user.name, email: user.email }
    )

    response.parse.dig("data", "userId")
  end
end
