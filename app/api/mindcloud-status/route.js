// What the API key can tell us about the MindCloud side of setup, used by the
// setup guide to check off the dashboard steps automatically.
import { getMindCloudStatus } from '../../../lib/getMindCloudStatus.js';

export async function GET() {
  const status = await getMindCloudStatus();

  if (status.error) {
    return Response.json({ success: false, message: status.error === 'NO_API_KEY' ? null : status.error, needsApiKey: status.error === 'NO_API_KEY' }, { status: status.status });
  }

  return Response.json({ success: true, ...status });
}
