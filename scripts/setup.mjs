// Interactive setup: walks you through each env value and writes .env.local.
// Re-run any time — existing values are shown as defaults.
import { createInterface } from 'node:readline/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ENV_FILE = new URL('../.env.local', import.meta.url);

const FIELDS = [
  {
    key: 'MINDCLOUD_API_KEY',
    label: 'MindCloud API key (Full Access — create at https://app.mindcloud.co/user/api-keys)',
    required: true
  },
  { key: 'DEMO_USER_EMAIL', label: 'Demo end-user email', fallback: 'demo@example.com' },
  { key: 'DEMO_USER_NAME', label: 'Demo end-user name', fallback: 'Demo User' },
  { key: 'MINDCLOUD_API_BASE_URL', label: 'MindCloud API base URL', fallback: 'https://connect.mindcloud.co' },
  { key: 'NEXT_PUBLIC_MINDCLOUD_EMBEDDED_BASE_URL', label: 'MindCloud embedded SDK base URL', fallback: 'https://embedded.mindcloud.co' }
];

const readExistingEnv = () => {
  if (!existsSync(ENV_FILE)) {
    return {};
  }

  const entries = readFileSync(ENV_FILE, 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    });

  return Object.fromEntries(entries);
};

const main = async () => {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const existing = readExistingEnv();
  const values = {};

  console.log('\nMindCloud example app setup — press Enter to accept a [default].\n');

  for (const field of FIELDS) {
    const fallback = existing[field.key] || field.fallback || '';

    let answer = '';
    do {
      const suffix = fallback ? ` [${fallback}]` : '';
      answer = (await readline.question(`${field.label}${suffix}: `)).trim() || fallback;

      if (field.required && !answer) {
        console.log('  This value is required.');
      }
    } while (field.required && !answer);

    values[field.key] = answer;
  }

  readline.close();

  const contents = FIELDS.map((field) => `${field.key}=${values[field.key]}`).join('\n') + '\n';
  writeFileSync(ENV_FILE, contents);

  console.log('\nWrote .env.local. Start the app with:\n\n  npm run dev\n\nThen open http://localhost:4321\n');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
