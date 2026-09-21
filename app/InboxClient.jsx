'use client';

// The product actually using the customer's connection, in two Universal API
// calls: the channel picker reads their Slack channel list, and Send posts to
// the channel they chose.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMindCloud } from '../lib/useMindCloud.js';
import { getSlackContext } from '../lib/getSlackContext.js';

const CONVERSATIONS = [
  { from: 'Maya Chen', subject: 'Order #4821 never arrived', time: '9:12 AM', tag: 'Urgent' },
  { from: 'Jordan Alvarez', subject: 'Can we upgrade to the team plan?', time: '8:47 AM', tag: 'Sales' },
  { from: 'Priya Nair', subject: 'CSV export renders blank columns', time: 'Yesterday', tag: 'Bug' },
  { from: 'Sam Whitfield', subject: 'Loving the new dashboard!', time: 'Yesterday', tag: 'Praise' }
];

export default function InboxClient() {
  const { integrations, error } = useMindCloud();
  const { installation, isSetupComplete } = getSlackContext(integrations);

  const [channels, setChannels] = useState(null);
  const [channelsError, setChannelsError] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [sendState, setSendState] = useState({});

  const installationId = installation?.id;

  const loadChannels = useCallback(async () => {
    if (!installationId) {
      return;
    }

    setChannelsError(null);

    try {
      const response = await fetch('/api/slack-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installationId })
      });
      const body = await response.json();

      if (!body.success) {
        setChannelsError(body.message);
        return;
      }

      setChannels(body.channels);
      setChannelId((current) => current || body.channels[0]?.id || '');
    } catch (loadError) {
      setChannelsError(loadError.message);
    }
  }, [installationId]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleSend = async (conversation) => {
    setSendState((prev) => ({ ...prev, [conversation.subject]: { status: 'sending' } }));

    try {
      const response = await fetch('/api/send-to-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installationId,
          channelId,
          text: `New conversation from ${conversation.from}: "${conversation.subject}"`
        })
      });
      const body = await response.json();

      setSendState((prev) => ({
        ...prev,
        [conversation.subject]: body.success ? { status: 'sent', request: body.request } : { status: 'error', message: body.message }
      }));
    } catch (sendError) {
      setSendState((prev) => ({ ...prev, [conversation.subject]: { status: 'error', message: sendError.message } }));
    }
  };

  if (error) {
    return (
      <div className="banner banner-error">
        <span>{error}</span>
        <Link className="btn" href="/setup">
          Open the setup guide
        </Link>
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="notice">
        <p>
          <strong>Finish setup first.</strong> Connect a Slack account and this inbox can post conversations straight into it.
        </p>
        <Link className="btn btn-primary" href="/setup">
          Open the setup guide
        </Link>
      </div>
    );
  }

  const selectedChannel = (channels || []).find((channel) => channel.id === channelId);

  return (
    <>
      <div className="channel-bar">
        <div className="channel-bar-left">
          <label htmlFor="slack-channel">Post to</label>
          <select id="slack-channel" value={channelId} onChange={(event) => setChannelId(event.target.value)} disabled={!channels || channels.length === 0}>
            {!channels && <option value="">Loading channels…</option>}
            {channels?.length === 0 && <option value="">No channels found</option>}
            {channels?.map((channel) => (
              <option key={channel.id} value={channel.id}>
                #{channel.name}
              </option>
            ))}
          </select>
        </div>
        <span className="channel-bar-hint">{channelsError || 'Loaded live from your Slack with one Universal API call.'}</span>
      </div>

      <div className="inbox">
        {CONVERSATIONS.map((conversation) => {
          const state = sendState[conversation.subject];

          return (
            <div key={conversation.subject} className="inbox-row">
              <div className="inbox-main">
                <div>
                  <div className="inbox-from">{conversation.from}</div>
                  <div className="inbox-subject">{conversation.subject}</div>
                </div>
                <div className="inbox-meta">
                  <span className="chip">{conversation.tag}</span>
                  <span className="inbox-time">{conversation.time}</span>
                  <button className="btn" onClick={() => handleSend(conversation)} disabled={!channelId || state?.status === 'sending'}>
                    {state?.status === 'sending' ? 'Sending…' : 'Send to Slack'}
                  </button>
                </div>
              </div>

              {state?.status === 'sent' && (
                <div className="inbox-result">
                  <span className="chip chip-green">Posted to #{selectedChannel?.name}</span>
                  <details>
                    <summary>See how this worked</summary>
                    <p className="result-hint">Your backend sent this with its MindCloud API key — no Slack tokens involved:</p>
                    <pre className="code-block">{`${state.request.url}\n${JSON.stringify(state.request.body, null, 2)}`}</pre>
                  </details>
                </div>
              )}
              {state?.status === 'error' && (
                <div className="inbox-result">
                  <span className="chip chip-red">{state.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
