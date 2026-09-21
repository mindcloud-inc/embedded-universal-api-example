import { getCompany, getMe } from './mindcloud.js';

// What an API key can tell you about the MindCloud side of setup: which
// organization it belongs to, and whether Embedded is enabled for it.
export const getMindCloudStatus = async (apiKey) => {
  const me = await getMe(apiKey);
  const companyId = me.body?.data?.companyId || me.body?.data?.apiKey?.companyId;

  if (!companyId) {
    const message = me.body?.message === 'NO_API_KEY' ? 'NO_API_KEY' : me.body?.message || 'That key was rejected. Check that you copied a Full Access key.';
    return { error: message, status: me.status >= 400 ? me.status : 502 };
  }

  const companyResult = await getCompany({ companyId, apiKey });
  const company = companyResult.body?.data?.[0];

  if (!company) {
    return { error: companyResult.body?.message || 'Could not read your MindCloud organization.', status: companyResult.status >= 400 ? companyResult.status : 502 };
  }

  return {
    company: { id: company.id, name: company.name },
    enableEmbedded: company.settings?.enableEmbedded === true
  };
};
