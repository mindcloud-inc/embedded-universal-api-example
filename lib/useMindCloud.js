import { useCallback, useEffect, useRef, useState } from 'react';

// The whole client-side embedded flow, shared by every page:
//   1. ask OUR backend for an end-user token   (POST /api/embedded-token)
//   2. load the MindCloud embedded SDK          (one script tag)
//   3. sdk.setToken(token) + load integrations
// The SDK owns the connect UI (credential forms, OAuth popups, options), so
// pages just render data and call sdk.install() / sdk.modify().
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

export const useMindCloud = () => {
  const sdkRef = useRef(null);
  const [integrations, setIntegrations] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!sdkRef.current) {
      return;
    }

    // Passing options forces the SDK to refetch instead of returning its cache.
    const list = await sdkRef.current.getIntegrations({ includeWorkflows: true });
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

  // Refresh whenever a connect/manage modal session ends, whatever way it ends.
  const openConnect = useCallback((integrationId) => sdkRef.current?.install({ integrationId, onClose: refresh }), [refresh]);
  const openManage = useCallback((installationId) => sdkRef.current?.modify({ installationId, onClose: refresh }), [refresh]);

  return { integrations, error, isLoading: !integrations && !error, refresh, openConnect, openManage };
};
