import { getMe } from './mindcloud.js';

// One call tells you everything the API key can prove about the MindCloud side
// of setup: which organization it belongs to and whether Embedded is enabled
// for it. GET /v2/me returns a curated capability block — never raw settings.
export const getMindCloudStatus = async (apiKey) => {
  const me = await getMe(apiKey);
  const company = me.body?.data?.company;

  if (!company) {
    const message = me.body?.message === 'NO_API_KEY' ? 'NO_API_KEY' : me.body?.message || 'That key was rejected. Check that you copied a Full Access key.';
    return { error: message, status: me.status >= 400 ? me.status : 502 };
  }

  return {
    company: { id: company.id, name: company.name },
    enableEmbedded: company.embedded?.isEnabled === true
  };
};
