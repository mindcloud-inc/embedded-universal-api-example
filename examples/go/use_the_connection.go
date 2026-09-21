// Step 3 — Use the connection (Go)
//
// One helper covers every app and action. Reads and writes are the same call
// with a different action slug.
package mindcloud

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// RunAction: action slugs are the docs-style kebab form, so the catalog's
// listChannels is addressed as list-channels.
func RunAction(appSlug, actionSlug, installationID string, arguments map[string]any) (map[string]any, error) {
	payload, _ := json.Marshal(map[string]any{
		"installationId": installationID,
		"arguments":      arguments,
	})

	url := fmt.Sprintf("%s/v2/universal/apps/%s/actions/%s/run", api, appSlug, actionSlug)
	req, _ := http.NewRequest("POST", url, bytes.NewReader(payload))
	authHeader(req)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var body map[string]any
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, err
	}

	return body, nil
}

// Read: the customer's Slack channels.
func SlackChannels(installationID string) (map[string]any, error) {
	return RunAction("slack", "list-channels", installationID, map[string]any{
		"excludeArchived": true,
	})
}

// Write: post as that customer.
func SendSlackMessage(installationID, channelID, text string) (map[string]any, error) {
	return RunAction("slack", "send-channel-message", installationID, map[string]any{
		"channel": channelID,
		"text":    text,
	})
}
