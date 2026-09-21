<?php
// Step 1 — Identify the customer (PHP / Laravel)
//
// Create the MindCloud end user once, store the id on your own user row, then
// mint a short-lived token whenever that customer opens your integrations page.

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class EmbeddedTokenController extends Controller
{
    private const API = 'https://connect.mindcloud.co';

    public function store(Request $request)
    {
        $user = $request->user();

        // POST /v1/users does NOT deduplicate — calling it twice creates two users.
        if (! $user->mindcloud_end_user_id) {
            $user->update(['mindcloud_end_user_id' => $this->createEndUser($user)]);
        }

        $response = $this->client()->get(self::API . "/v1/users/{$user->mindcloud_end_user_id}/token");

        return ['token' => $response->json('token')];
    }

    private function client()
    {
        return Http::withToken(env('MINDCLOUD_API_KEY'))->acceptJson();
    }

    private function createEndUser($user): string
    {
        $response = $this->client()->post(self::API . '/v1/users', [
            'externalId' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);

        return $response->json('data.userId');
    }
}
