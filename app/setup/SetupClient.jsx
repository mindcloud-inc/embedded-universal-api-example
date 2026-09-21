'use client';

// The guided path for a developer who has never seen MindCloud. Some steps
// happen in the MindCloud dashboard and can't be detected from here, so they
// show a step number; the ones this app can verify show a live checkmark.
// When the verifiable ones are green, the rest of the app unlocks.
import Link from 'next/link';
import { useMindCloud } from '../../lib/useMindCloud.js';
import { getSlackContext } from '../../lib/getSlackContext.js';

const StepMarker = ({ step, index }) => {
  if (step.manual) {
    return <span className="status-dot number">{index + 1}</span>;
  }

  return <span className={`status-dot ${step.done ? 'done' : ''}`}>{step.done ? '✓' : ''}</span>;
};

export default function SetupClient() {
  const { integrations, error, isLoading, refresh, openConnect } = useMindCloud();
  const slack = getSlackContext(integrations);

  const steps = [
    {
      manual: true,
      title: 'Create a MindCloud account and organization',
      body: (
        <p>
          Sign up at{' '}
          <a href="https://app.mindcloud.co/signup" target="_blank" rel="noopener noreferrer">
            app.mindcloud.co
          </a>
          . Your organization is the account your customers' connections will live under.
        </p>
      )
    },
    {
      manual: true,
      title: 'Ask your MindCloud representative to enable Embedded',
      body: <p>Embedded is enabled per organization by MindCloud. Your sales representative can turn it on for your account.</p>
    },
    {
      done: !error && !isLoading,
      title: 'Create an API key and connect this app',
      body: error ? (
        <>
          <p className="step-error">{error}</p>
          <p>
            Create a <strong>Full Access</strong> key at{' '}
            <a href="https://app.mindcloud.co/user/api-keys" target="_blank" rel="noopener noreferrer">
              Settings → API Keys
            </a>
            , then run <code>npm run setup</code> and restart <code>npm run dev</code>.
          </p>
        </>
      ) : (
        <p>Your API key works — this app created its demo end user and can mint end-user tokens.</p>
      )
    },
    {
      manual: true,
      title: 'Turn on API access in Embedded',
      body: (
        <p>
          In{' '}
          <a href="https://app.mindcloud.co/embedded" target="_blank" rel="noopener noreferrer">
            app.mindcloud.co → Embedded
          </a>
          , switch on <strong>"Connecting through your codebase?"</strong>. That reveals the Embedded API Integrations page you'll use next.
        </p>
      )
    },
    {
      done: !!slack.integration,
      title: 'Create a Slack integration',
      body: (
        <p>
          On{' '}
          <a href="https://app.mindcloud.co/embedded/api" target="_blank" rel="noopener noreferrer">
            Embedded → API → Integrations
          </a>
          , click <strong>Create Integration</strong> and pick <strong>Slack</strong>. That defines what your customers can connect — you do this once, in your account.
        </p>
      )
    },
    {
      done: !!slack.installation,
      title: 'Connect Slack as a customer would',
      body: (
        <div className="step-row">
          <p>This opens the same MindCloud dialog your customers see. Sign in to Slack and you're done.</p>
          {slack.integration && (
            <button className="btn btn-primary" onClick={() => openConnect(slack.integration.id)}>
              Connect Slack
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="setup-steps">
      {steps.map((step, index) => (
        <div key={step.title} className={`setup-step ${!step.manual && step.done ? 'done' : ''}`}>
          <div className="setup-step-header">
            <StepMarker step={step} index={index} />
            <h2>{step.title}</h2>
          </div>
          <div className="setup-step-body">{step.body}</div>
        </div>
      ))}

      {slack.isSetupComplete ? (
        <div className="banner">
          <span>Setup complete — the Inbox and Integrations pages are unlocked.</span>
          <Link className="btn btn-primary" href="/">
            Go to the Inbox
          </Link>
        </div>
      ) : (
        <button className="btn btn-ghost" onClick={refresh}>
          Re-check status
        </button>
      )}
    </div>
  );
}
