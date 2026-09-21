// What the API key can tell us about the MindCloud side of setup: which
// organization it belongs to, and whether Embedded is enabled for it. The
// setup guide uses this to check off the dashboard steps automatically.
import { getCompany } from '../../../lib/mindcloud.js';

export async function GET() {
  const result = await getCompany();
  const company = result.body?.data?.[0];

  if (!company) {
    return Response.json(
      { success: false, message: result.body?.message || result.body?.error?.message || 'Could not read your MindCloud organization.' },
      { status: result.status >= 400 ? result.status : 502 }
    );
  }

  return Response.json({
    success: true,
    company: { id: company.id, name: company.name },
    enableEmbedded: company.settings?.enableEmbedded === true
  });
}
