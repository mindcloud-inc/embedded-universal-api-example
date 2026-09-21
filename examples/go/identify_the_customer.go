// Step 1 — Identify the customer (Go)
//
// Create the MindCloud end user once, store the id on your own user row, then
// mint a short-lived token whenever that customer opens your integrations page.
package mindcloud

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
)

const api = "https://connect.mindcloud.co"

func authHeader(req *http.Request) {
	req.Header.Set("Authorization", "Bearer "+os.Getenv("MINDCLOUD_API_KEY"))
	req.Header.Set("Content-Type", "application/json")
}

// CreateEndUser: POST /v1/users does NOT deduplicate — calling it twice
// creates two end users. Store the id on your own user row.
func CreateEndUser(u User) (string, error) {
	payload, _ := json.Marshal(map[string]string{
		"externalId": u.ID,
		"name":       u.Name,
		"email":      u.Email,
	})

	req, _ := http.NewRequest("POST", api+"/v1/users", bytes.NewReader(payload))
	authHeader(req)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	var body struct {
		Data struct {
			UserID string `json:"userId"`
		} `json:"data"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return "", err
	}

	return body.Data.UserID, nil
}

func EmbeddedToken(w http.ResponseWriter, r *http.Request) {
	user := SessionUser(r)

	if user.MindCloudEndUserID == "" {
		id, err := CreateEndUser(user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		user.MindCloudEndUserID = id
		SaveUser(user)
	}

	req, _ := http.NewRequest("GET", api+"/v1/users/"+user.MindCloudEndUserID+"/token", nil)
	authHeader(req)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer res.Body.Close()

	io.Copy(w, res.Body) // { "token": "..." }
}
