'use client';

// One SDK instance, one token, one integrations cache for the whole page.
//
// Without a provider every component that needs integrations mints its own
// end-user token and keeps its own copy — two on this app's simplest page.
// Mount this once at the layout and read it with useMindCloud().
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const EMBEDDED_BASE_URL = process.env.NEXT_PUBLIC_MINDCLOUD_EMBEDDED_BASE_URL || 'https://embedded.mindcloud.co';

const MindCloudContext = createContext(null);

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

export const MindCloudProvider = ({ children }) => {
  const sdkRef = useRef(null);
  const [integrations, setIntegrations] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!sdkRef.current) {
      return;
    }

    // Passing options forces a refetch; a bare call returns the SDK's cache.
    const list = await sdkRef.current.getIntegrations({ includeWorkflows: true });
    setIntegrations(list || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const tokenResponse = await fetch('/api/embedded-token', { method: 'POST' });
        const tokenBody = await tokenResponse.json();

        if (!tokenBody.token) {
          throw new Error(tokenBody.message === 'NO_API_KEY' ? 'Add your MindCloud API key in the Demo Setup Guide to get started.' : tokenBody.message || 'Could not get an end-user token.');
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

  const value = {
    integrations,
    error,
    isLoading: !integrations && !error,
    // Until both the token call and the load have resolved, "not connected" is
    // indistinguishable from "not loaded yet".
    isSettled: integrations !== null || !!error,
    refresh,
    // onClose fires however the dialog is dismissed (Finish, X, backdrop) —
    // onAuthenticationComplete does not, so it misses abandoned OAuth popups.
    openConnect: (integrationId) => sdkRef.current?.install({ integrationId, onClose: refresh }),
    openManage: (installationId) => sdkRef.current?.modify({ installationId, onClose: refresh })
  };

  return <MindCloudContext.Provider value={value}>{children}</MindCloudContext.Provider>;
};

export const useMindCloud = () => {
  const context = useContext(MindCloudContext);

  if (!context) {
    throw new Error('useMindCloud must be used inside <MindCloudProvider>');
  }

  return context;
};
