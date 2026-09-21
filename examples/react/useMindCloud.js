// Step 2 — Let the customer connect (React)
//
// Load the SDK with a token from your backend, list the integrations, and open
// the MindCloud-hosted connect dialog. You own the page; MindCloud owns the
// dialog.
import { useCallback, useEffect, useRef, useState } from 'react';

const EMBEDDED = 'https://embedded.mindcloud.co';

const loadSdk = () =>
  new Promise((resolve, reject) => {
    if (window.MindCloud) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = `${EMBEDDED}/assets/embedded/sdk.1.0.0.min.js`;
    script.onload = () => (window.MindCloud ? resolve() : reject(new Error('SDK failed to load')));
    script.onerror = () => reject(new Error('SDK failed to load'));
    document.head.appendChild(script);
  });

export const useMindCloud = () => {
  const sdk = useRef(null);
  const [integrations, setIntegrations] = useState(null);

  // Pass any options object to force a refetch — a bare call returns the cache.
  const refresh = useCallback(async () => {
    setIntegrations((await sdk.current?.getIntegrations({ includeWorkflows: true })) || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { token } = await fetch('/api/embedded-token', { method: 'POST' }).then((response) => response.json());

      await loadSdk();
      sdk.current = window.MindCloud({ baseUrl: EMBEDDED });
      sdk.current.setToken(token);
      await refresh();
    };

    init();
  }, [refresh]);

  return {
    integrations,
    // onClose fires however the dialog is dismissed — the reliable refetch hook.
    connect: (integrationId) => sdk.current?.install({ integrationId, onClose: refresh }),
    manage: (installationId) => sdk.current?.modify({ installationId, onClose: refresh })
  };
};
