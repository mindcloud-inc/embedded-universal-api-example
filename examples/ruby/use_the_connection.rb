# Step 3 — Use the connection (Ruby / Rails)
#
# One helper covers every app and action. Reads and writes are the same call
# with a different action slug.
class MindCloud
  API = "https://connect.mindcloud.co".freeze

  # Action slugs are the docs-style kebab form: listChannels -> list-channels.
  def self.run_action(app_slug:, action_slug:, installation_id:, arguments: {})
    response = HTTP.headers(headers).post(
      "#{API}/v2/universal/apps/#{app_slug}/actions/#{action_slug}/run",
      json: { installationId: installation_id, arguments: arguments }
    )

    response.parse
  end

  # Read: the customer's Slack channels.
  def self.slack_channels(installation_id)
    run_action(
      app_slug: "slack",
      action_slug: "list-channels",
      installation_id: installation_id,
      arguments: { excludeArchived: true }
    ).fetch("data").map { |row| row.slice("id", "name") }
  end

  # Write: post as that customer.
  def self.send_slack_message(installation_id, channel_id, text)
    run_action(
      app_slug: "slack",
      action_slug: "send-channel-message",
      installation_id: installation_id,
      arguments: { channel: channel_id, text: text }
    )
  end

  def self.headers
    {
      "Authorization" => "Bearer #{ENV.fetch('MINDCLOUD_API_KEY')}",
      "Content-Type" => "application/json"
    }
  end
end
