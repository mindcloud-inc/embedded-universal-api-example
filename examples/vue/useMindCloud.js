// Step 2 — Let the customer connect (Vue, composition API)
import { onMounted, ref } from 'vue';

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
  const sdk = ref(null);
  const integrations = ref(null);

  // Pass any options object to force a refetch — a bare call returns the cache.
  const refresh = async () => {
    integrations.value = (await sdk.value?.getIntegrations({ includeWorkflows: true })) || [];
  };

  onMounted(async () => {
    const { token } = await fetch('/api/embedded-token', { method: 'POST' }).then((response) => response.json());

    await loadSdk();
    sdk.value = window.MindCloud({ baseUrl: EMBEDDED });
    sdk.value.setToken(token);
    await refresh();
  });

  return {
    integrations,
    // onClose fires however the dialog is dismissed — the reliable refetch hook.
    connect: (integrationId) => sdk.value?.install({ integrationId, onClose: refresh }),
    manage: (installationId) => sdk.value?.modify({ installationId, onClose: refresh })
  };
};
