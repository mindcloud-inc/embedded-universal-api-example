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

export const getOrCreateEndUserId = async ({ appUserId, name, email }) => {
  const store = await readStore();

  if (store[appUserId]) {
    return { endUserId: store[appUserId] };
  }

  const created = await createEndUser({ externalId: appUserId, name, email });
  const endUserId = created.body?.data?.userId;

  if (!endUserId) {
    return { error: created.body?.message || 'Failed to create the MindCloud end user.', status: created.status };
  }

  store[appUserId] = endUserId;
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));

  return { endUserId };
};
