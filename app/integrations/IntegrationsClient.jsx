'use client';

// The whole embedded flow, client side:
//   1. ask OUR backend for an end-user token   (POST /api/embedded-token)
//   2. load the MindCloud embedded SDK          (one script tag)
//   3. sdk.setToken(token) + sdk.getIntegrations()
//   4. render cards; Connect/Manage open the MindCloud modal
// The SDK owns the connect UI (credentials, OAuth popups, options), so this
// file is just data fetching and rendering.
import { useCallback, useEffect, useRef, useState } from 'react';
import ApiPlayground from './ApiPlayground.jsx';

const EMBEDDED_BASE_URL = process.env.NEXT_PUBLIC_MINDCLOUD_EMBEDDED_BASE_URL || 'https://embedded.mindcloud.co';

const loadSdkScript = () => {
  if (window.MindCloud) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${EMBEDDED_BASE_URL}/assets/embedded/sdk.1.0.0.min.js`;
    script.async = true;
    script.onload = () => (window.MindCloud ? resolve() : reject(new Error('SDK script loaded but window.MindCloud is missing')));
    script.onerror = () => reject(new Error('Failed to load the MindCloud embedded SDK script'));
    document.head.appendChild(script);
  });
};

export default function IntegrationsClient() {
  const sdkRef = useRef(null);
  const [integrations, setIntegrations] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const list = await sdkRef.current.getIntegrations();
    setIntegrations(list || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const tokenResponse = await fetch('/api/embedded-token', { method: 'POST' });
        const tokenBody = await tokenResponse.json();
        if (!tokenBody.token) {
          throw new Error(tokenBody.message || 'Could not get an end-user token.');
        }

        await loadSdkScript();
        sdkRef.current = window.MindCloud({ baseUrl: EMBEDDED_BASE_URL });
        sdkRef.current.setToken(tokenBody.token);
        await refresh();
      } catch (initError) {
        setError(initError.message);
      }
    };

    init();
  }, [refresh]);

  const handleConnect = (integration) => {
    sdkRef.current.install({ integrationId: integration.id, onAuthenticationComplete: refresh });
  };

  const handleManage = (installation) => {
    sdkRef.current.modify({ installationId: installation.id, onAuthenticationComplete: refresh });
  };

  if (error) {
    return (
      <div className="notice notice-error">
        <strong>Setup needed:</strong> {error}
      </div>
    );
  }

  if (!integrations) {
    return <div className="notice">Loading integrations…</div>;
  }

  if (integrations.length === 0) {
    return (
      <div className="notice">
        No integrations are published for this MindCloud account yet. Create one (Connect-Only works great here) at{' '}
        <a href="https://app.mindcloud.co/embedded" target="_blank" rel="noopener noreferrer">
          app.mindcloud.co/embedded
        </a>
        , then refresh this page.
      </div>
    );
  }

  return (
    <div className="card-grid">
      {integrations.map((integration) => {
        const installations = integration.installations || [];

        return (
          <div key={integration.id} className="card">
            <div className="card-header">
              {integration.app?.iconUrl && <img className="app-icon" src={integration.app.iconUrl} alt="" />}
              <div>
                <div className="card-title">{integration.name}</div>
                {integration.description && <div className="card-description">{integration.description}</div>}
              </div>
            </div>

            {installations.length > 0 && (
              <div className="installations">
                {installations.map((installation) => (
                  <div key={installation.id} className="installation">
                    <div className="installation-row">
                      <span className={`chip ${installation.isInstalled ? 'chip-green' : ''}`}>{installation.isInstalled ? 'Connected' : 'Incomplete'}</span>
                      <code className="installation-id">{installation.id}</code>
                      <button className="btn" onClick={() => handleManage(installation)}>
                        Manage
                      </button>
                    </div>
                    {installation.isInstalled && <ApiPlayground integration={integration} installation={installation} />}
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary" onClick={() => handleConnect(integration)}>
              {installations.length > 0 ? 'Add another connection' : 'Connect'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
