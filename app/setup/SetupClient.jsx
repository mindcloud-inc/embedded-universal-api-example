'use client';

// The guided path for a developer who has never seen MindCloud. Some steps
// happen in the MindCloud dashboard and can't be detected from here, so they
// show a step number; the ones this app can verify show a live checkmark.
// When the verifiable ones are green, the rest of the app unlocks.
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useMindCloud } from '../../lib/useMindCloud.js';
import { getSlackContext } from '../../lib/getSlackContext.js';

const StepMarker = ({ step, index }) => {
  if (step.manual) {
    return <span className="status-dot number">{index + 1}</span>;
  }

  return <span className={`status-dot ${step.done ? 'done' : ''}`}>{step.done ? '✓' : ''}</span>;
};

export default function SetupClient() {
  const { integrations, refresh } = useMindCloud();
  const slack = getSlackContext(integrations);

  // Everything the API key can verify about the MindCloud side of setup.
  const [status, setStatus] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyError, setKeyError] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/mindcloud-status');
      setStatus(await response.json());
    } catch (statusError) {
      setStatus({ success: false, message: statusError.message });
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRecheck = () => {
    loadStatus();
    refresh();
  };

  const handleSaveKey = async (event) => {
    event.preventDefault();
    setIsSavingKey(true);
    setKeyError(null);

    try {
      const response = await fetch('/api/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() })
      });
      const body = await response.json();

      if (!body.success) {
        setKeyError(body.message);
        return;
      }

      setApiKeyInput('');
      await loadStatus();
      refresh();
    } catch (saveError) {
      setKeyError(saveError.message);
    } finally {
      setIsSavingKey(false);
    }
  };

  const steps = [
    {
      done: !!status?.company,
      title: 'Create a MindCloud account and organization',
      body: status?.company ? (
        <p>
          Connected to <strong>{status.company.name}</strong>. Your organization is the account your customers' connections live under.
        </p>
      ) : (
        <p>
          Sign up at{' '}
          <a href="https://app.mindcloud.co/signup" target="_blank" rel="noopener noreferrer">
            MindCloud Gravity
          </a>
          . Your organization is the account your customers' connections will live under.
        </p>
      )
    },
    {
      done: status?.enableEmbedded === true,
      title: 'Ask your MindCloud representative to enable Embedded',
      body: status?.enableEmbedded ? <p>Embedded is enabled for this organization.</p> : <p>Embedded is enabled per organization by MindCloud. Your sales representative can turn it on for your account.</p>
    },
    {
      done: !!status?.company,
      title: 'Create an API key and paste it here',
      body: status?.company ? (
        <p>Your API key works — this app created its demo end user and can mint end-user tokens.</p>
      ) : (
        <>
          <p>
            Create a <strong>Full Access</strong> key at{' '}
            <a href="https://app.mindcloud.co/user/api-keys" target="_blank" rel="noopener noreferrer">
              MindCloud Gravity → Settings → API Keys
            </a>
            , then paste it here. It is stored server-side in <code>.env.local</code> and never sent to the browser.
          </p>
          <form className="key-form" onSubmit={handleSaveKey}>
            <input type="password" value={apiKeyInput} onChange={(event) => setApiKeyInput(event.target.value)} placeholder="Paste your MindCloud API key" autoComplete="off" />
            <button className="btn btn-primary" type="submit" disabled={!apiKeyInput.trim() || isSavingKey}>
              {isSavingKey ? 'Checking…' : 'Save key'}
            </button>
          </form>
          {keyError && <p className="step-error">{keyError}</p>}
        </>
      )
    },
    {
      manual: true,
      title: 'Turn on API access in Embedded',
      body: (
        <p>
          In{' '}
          <a href="https://app.mindcloud.co/embedded" target="_blank" rel="noopener noreferrer">
            MindCloud Gravity → Embedded
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
            MindCloud Gravity → Embedded → API → Integrations
          </a>
          , click <strong>Create Integration</strong> and pick <strong>Slack</strong>. That defines what your customers can connect — you do this once, in your account.
        </p>
      )
    },
    {
      done: !!slack.installation,
      title: 'Connect Slack as an end user',
      body: (
        <div className="step-row">
          <p>Go to this sample application's Integrations page and connect Slack the way your customers would.</p>
          {slack.hasIntegration && (
            <Link className="btn btn-primary" href="/integrations">
              Go to Integrations
            </Link>
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
          <span>Setup complete — try "Send to Slack" on a conversation in the Inbox.</span>
          <Link className="btn btn-primary" href="/">
            Go to the Inbox
          </Link>
        </div>
      ) : (
        <button className="btn btn-ghost" onClick={handleRecheck}>
          Re-check status
        </button>
      )}
    </div>
  );
}
