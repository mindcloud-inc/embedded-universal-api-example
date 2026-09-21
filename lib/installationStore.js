// Which installation belongs to which of YOUR users.
//
// You have to keep this mapping yourself: credentials created through the
// embedded SDK are scoped by installation, and /v2/connections cannot be
// filtered by end user, so there is no server-side lookup from "my user" to
// "their installation". Capture the installationId once (the browser gets it
// from the SDK for the signed-in session) and store it against your user row.
//
// This demo uses data/installations.json; in your app it is a column.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(process.cwd(), 'data', 'installations.json');

const readStore = async () => {
  try {
    return JSON.parse(await fs.readFile(STORE_PATH, 'utf8'));
  } catch {
    return {};
  }
};

export const getInstallationId = async (appUserId) => {
  return (await readStore())[appUserId] || null;
};

export const saveInstallationId = async (appUserId, installationId) => {
  const store = await readStore();
  store[appUserId] = installationId;

  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
};
