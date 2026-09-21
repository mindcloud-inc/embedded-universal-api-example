'use client';

// The mock product actually USING the customer's connection: every conversation
// can be sent to the customer's Slack channel through MindCloud. The button
// walks the user to whatever setup step is still missing.
import { useState } from 'react';
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
  const { integrations, error, openConnect, openManage } = useMindCloud();
  const slack = getSlackContext(integrations);
  const [sendState, setSendState] = useState({});
  const [banner, setBanner] = useState(null);

  const handleSend = async (conversation) => {
    // Each missing piece routes the user to the right fix instead of failing.
    if (!slack.integration) {
      setBanner({
        text: 'This demo needs a Slack integration in your MindCloud account first.',
        actionLabel: 'Open the setup guide',
        href: '/setup'
      });
      return;
    }

    if (!slack.installation) {
      setBanner({
        text: 'Connect your Slack account first — it takes about 20 seconds.',
        actionLabel: 'Connect Slack',
        onClick: () => openConnect(slack.integration.id)
      });
      return;
    }

    if (!slack.channelName) {
      setBanner({
        text: 'Pick which Slack channel this app should post to.',
        actionLabel: 'Set your channel',
        onClick: () => openManage(slack.installation.id)
      });
      return;
    }

    setBanner(null);
    setSendState((prev) => ({ ...prev, [conversation.subject]: { status: 'sending' } }));

    try {
      const response = await fetch('/api/send-to-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installationId: slack.installation.id,
          appId: slack.slackApp?.id,
          channelName: slack.channelName,
          text: `New conversation from ${conversation.from}: "${conversation.subject}"`
        })
      });
      const body = await response.json();

      setSendState((prev) => ({
        ...prev,
        [conversation.subject]: body.success ? { status: 'sent', channel: body.channel, request: body.request, response: body.response } : { status: 'error', message: body.message }
      }));
    } catch (sendError) {
      setSendState((prev) => ({ ...prev, [conversation.subject]: { status: 'error', message: sendError.message } }));
    }
  };

  return (
    <>
      {error && (
        <div className="banner banner-error">
          <span>{error}</span>
          <Link className="btn" href="/setup">
            Open the setup guide
          </Link>
        </div>
      )}
      {banner && (
        <div className="banner">
          <span>{banner.text}</span>
          {banner.href ? (
            <Link className="btn btn-primary" href={banner.href}>
              {banner.actionLabel}
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={banner.onClick}>
              {banner.actionLabel}
            </button>
          )}
        </div>
      )}

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
                  <button className="btn" onClick={() => handleSend(conversation)} disabled={state?.status === 'sending'}>
                    {state?.status === 'sending' ? 'Sending…' : 'Send to Slack'}
                  </button>
                </div>
              </div>

              {state?.status === 'sent' && (
                <div className="inbox-result">
                  <span className="chip chip-green">Posted to #{state.channel?.label}</span>
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
