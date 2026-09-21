'use client';

// The guided path for a developer who has never seen MindCloud: every step has
// live status, exact instructions, and a button when this app can do the step
// itself. Steps 1–3 happen once in YOUR MindCloud account; steps 4–5 are what
// each of your customers does.
import { useMindCloud } from '../../lib/useMindCloud.js';
import { getSlackContext } from '../../lib/getSlackContext.js';
import { SLACK_CHANNEL_METADATA_KEY } from '../../lib/slackDemo.js';

const StatusDot = ({ done }) => <span className={`status-dot ${done ? 'done' : ''}`}>{done ? '✓' : ''}</span>;

export default function SetupClient() {
  const { integrations, error, isLoading, refresh, openConnect, openManage } = useMindCloud();
  const slack = getSlackContext(integrations);

  const steps = [
    {
      done: !error && !isLoading,
      title: 'Connect this app to your MindCloud account',
      body: error ? (
        <>
          <p className="step-error">{error}</p>
          <p>
            Create a <strong>Full Access</strong> API key at <a href="https://app.mindcloud.co/user/api-keys" target="_blank" rel="noopener noreferrer">app.mindcloud.co → Settings → API Keys</a>, then run <code>npm run setup</code> and restart <code>npm run dev</code>.
          </p>
        </>
      ) : (
        <p>Your API key works — this app created its demo end user and can mint end-user tokens.</p>
      )
    },
    {
      done: !!slack.integration,
      title: 'Create a Slack integration in MindCloud',
      body: (
        <p>
          In <a href="https://app.mindcloud.co/embedded" target="_blank" rel="noopener noreferrer">app.mindcloud.co → Embedded</a>, click <strong>Create Integration</strong>, choose <strong>Connect-Only</strong>, and pick <strong>Slack</strong>. That defines what your customers can connect — you do this once, in your account.
        </p>
      )
    },
    {
      done: slack.hasChannelOption,
      title: 'Add the "Slack channel" option',
      body: (
        <p>
          On your Slack integration's page, under <strong>Integration Metadata → Add Metadata</strong>: label it <strong>Slack channel</strong>, set the key to exactly <code>{SLACK_CHANNEL_METADATA_KEY}</code>, type Text. Customers will fill this in when they connect, and this app reads it to know where to post.
        </p>
      )
    },
    {
      done: !!slack.installation,
      title: 'Connect Slack as a customer would',
      body: (
        <div className="step-row">
          <p>This opens the same MindCloud dialog your customers see: sign in to Slack, set your channel, done.</p>
          {slack.integration && (
            <button className="btn btn-primary" onClick={() => openConnect(slack.integration.id)}>
              Connect Slack
            </button>
          )}
        </div>
      )
    },
    {
      done: !!slack.channelName,
      title: 'Set the channel to post to',
      body: (
        <div className="step-row">
          <p>{slack.channelName ? <>Posting to <strong>#{slack.channelName.replace(/^#/, '')}</strong>.</> : 'Open your connection\'s Options and type a channel name, e.g. general.'}</p>
          {slack.installation && (
            <button className="btn" onClick={() => openManage(slack.installation.id)}>
              Open options
            </button>
          )}
        </div>
      )
    },
    {
      done: false,
      hideStatus: true,
      title: 'Send something',
      body: (
        <p>
          Go to the <a href="/">Inbox</a> and hit <strong>Send to Slack</strong> on any conversation. Your backend posts it through the customer's connection with three Universal API calls — check the "See how this worked" panel after it lands.
        </p>
      )
    }
  ];

  return (
    <div className="setup-steps">
      {steps.map((step, index) => (
        <div key={step.title} className={`setup-step ${step.done ? 'done' : ''}`}>
          <div className="setup-step-header">
            {step.hideStatus ? <span className="status-dot number">{index + 1}</span> : <StatusDot done={step.done} />}
            <h2>{step.title}</h2>
          </div>
          <div className="setup-step-body">{step.body}</div>
        </div>
      ))}
      <button className="btn btn-ghost" onClick={refresh}>
        Re-check status
      </button>
    </div>
  );
}
