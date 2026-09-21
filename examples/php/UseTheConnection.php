<?php
// Step 3 — Use the connection (PHP / Laravel)
//
// One helper covers every app and action. Reads and writes are the same call
// with a different action slug.

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MindCloud
{
    private const API = 'https://connect.mindcloud.co';

    // Action slugs are the docs-style kebab form: listChannels -> list-channels.
    public static function runAction(string $appSlug, string $actionSlug, string $installationId, array $arguments = []): array
    {
        return Http::withToken(env('MINDCLOUD_API_KEY'))
            ->acceptJson()
            ->post(self::API . "/v2/universal/apps/{$appSlug}/actions/{$actionSlug}/run", [
                'installationId' => $installationId,
                'arguments' => $arguments,
            ])
            ->json();
    }

    // Read: the customer's Slack channels.
    public static function slackChannels(string $installationId): array
    {
        return self::runAction('slack', 'list-channels', $installationId, ['excludeArchived' => true])['data'];
    }

    // Write: post as that customer.
    public static function sendSlackMessage(string $installationId, string $channelId, string $text): array
    {
        return self::runAction('slack', 'send-channel-message', $installationId, [
            'channel' => $channelId,
            'text' => $text,
        ]);
    }
}
