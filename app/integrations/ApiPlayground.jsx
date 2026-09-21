'use client';

// The other half of embedded: your backend USING the end user's connection.
// Pick an app + action, and this posts to /api/run-action, which calls
//   POST /v2/universal/apps/{appSlug}/actions/{actionSlug}/run
// with { installationId, arguments } and your server-side API key.
import { useState } from 'react';

const buildCurl = ({ appSlug, actionSlug, installationId, argumentsText }) =>
  `curl -X POST https://connect.mindcloud.co/v2/universal/apps/${appSlug}/actions/${actionSlug}/run \\
  -H "Authorization: Bearer $MINDCLOUD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "installationId": "${installationId}", "arguments": ${argumentsText} }'`;

export default function ApiPlayground({ integration, installation }) {
  const apps = integration.apps || [];
  const [isOpen, setIsOpen] = useState(false);
  const [appSlug, setAppSlug] = useState(apps[0]?.slug || '');
  const [actionSlug, setActionSlug] = useState('');
  const [argumentsText, setArgumentsText] = useState('{}');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    let actionArguments;
    try {
      actionArguments = JSON.parse(argumentsText || '{}');
    } catch {
      setResult({ status: 'client', body: { success: false, message: 'Arguments must be valid JSON.' } });
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch('/api/run-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appSlug, actionSlug: actionSlug.trim(), installationId: installation.id, arguments: actionArguments })
      });
      setResult({ status: response.status, body: await response.json() });
    } catch (runError) {
      setResult({ status: 'network', body: { success: false, message: runError.message } });
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) {
    return (
      <button className="btn btn-ghost" onClick={() => setIsOpen(true)}>
        Try the API with this connection →
      </button>
    );
  }

  return (
    <div className="playground">
      <div className="playground-fields">
        <label>
          App
          <select value={appSlug} onChange={(event) => setAppSlug(event.target.value)}>
            {apps.map((app) => (
              <option key={app.slug} value={app.slug}>
                {app.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Action slug
          <input value={actionSlug} onChange={(event) => setActionSlug(event.target.value)} placeholder="e.g. send-channel-message" />
        </label>
        <label>
          Arguments (JSON)
          <textarea rows={3} value={argumentsText} onChange={(event) => setArgumentsText(event.target.value)} />
        </label>
      </div>
      <div className="playground-actions">
        <button className="btn btn-primary" onClick={handleRun} disabled={!actionSlug.trim() || isRunning}>
          {isRunning ? 'Running…' : 'Run action'}
        </button>
        <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>
          Close
        </button>
      </div>
      <p className="playground-hint">
        Find each app's action slugs and argument schemas at{' '}
        <a href={`https://mindcloud.co/docs/universal/rest/${appSlug}`} target="_blank" rel="noopener noreferrer">
          mindcloud.co/docs/universal
        </a>
        . Equivalent request from your own backend:
      </p>
      <pre className="code-block">{buildCurl({ appSlug, actionSlug: actionSlug.trim() || '{action-slug}', installationId: installation.id, argumentsText: argumentsText || '{}' })}</pre>
      {result && (
        <>
          <p className="playground-hint">Response (HTTP {result.status}):</p>
          <pre className="code-block">{JSON.stringify(result.body, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
