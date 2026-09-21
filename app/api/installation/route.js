// The browser reports which installation the signed-in customer just connected;
// the server stores it against THAT session's user. Every later call reads the
// stored value, so no request can name someone else's installation.
import { getSessionUser } from '../../../lib/session.js';
import { saveInstallationId } from '../../../lib/installationStore.js';

export async function POST(request) {
  const { installationId } = await request.json().catch(() => ({}));

  if (!installationId) {
    return Response.json({ success: false, message: 'installationId is required.' }, { status: 400 });
  }

  const sessionUser = await getSessionUser();
  await saveInstallationId(sessionUser.appUserId, installationId);

  return Response.json({ success: true });
}
