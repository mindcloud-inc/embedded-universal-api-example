// Stands in for your database: a real app stores the MindCloud end-user id as
// a column on its own users table. This demo keeps it in data/users.json so a
// restart doesn't create duplicate end users.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createEndUser } from './mindcloud.js';

const STORE_PATH = path.join(process.cwd(), 'data', 'users.json');

const readStore = async () => {
  try {
    return JSON.parse(await fs.readFile(STORE_PATH, 'utf8'));
  } catch {
    return {};
  }
};

const writeStore = async (store) => {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
};

const createAndStore = async ({ appUserId, name, email }) => {
  const created = await createEndUser({ externalId: appUserId, name, email });
  const endUserId = created.body?.data?.userId;

  if (!endUserId) {
    return { error: created.body?.message || 'Failed to create the MindCloud end user.', status: created.status };
  }

  const store = await readStore();
  store[appUserId] = endUserId;
  await writeStore(store);

  return { endUserId };
};

export const getOrCreateEndUserId = async ({ appUserId, name, email }) => {
  const store = await readStore();

  if (store[appUserId]) {
    return { endUserId: store[appUserId] };
  }

  return createAndStore({ appUserId, name, email });
};

// An end user belongs to the company that owns the API key that created it, so
// pointing this app at a key from a different organization makes the stored id
// unusable ("Unauthorized access"). Drop it and create one in the new company.
export const recreateEndUserId = async ({ appUserId, name, email }) => {
  const store = await readStore();
  delete store[appUserId];
  await writeStore(store);

  return createAndStore({ appUserId, name, email });
};
