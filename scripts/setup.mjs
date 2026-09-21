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
  { key: 'DEMO_USER_NAME', label: 'Demo end-user name', fallback: 'Demo User' }
];

// Never prompted — sensible defaults live in code. Preserved when a previous
// .env.local set them by hand (see .env.example).
const PASSTHROUGH_KEYS = ['MINDCLOUD_API_BASE_URL', 'NEXT_PUBLIC_MINDCLOUD_EMBEDDED_BASE_URL'];

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
  // Resolves null when stdin ends (piped input, Ctrl-D) — a pending question
  // never settles on its own then, and the process would exit silently. Asking
  // after close throws, so later fields check the flag and use their fallbacks.
  let isStdinClosed = false;
  const stdinClosed = new Promise((resolve) =>
    readline.once('close', () => {
      isStdinClosed = true;
      resolve(null);
    })
  );
  const existing = readExistingEnv();
  const values = {};

  console.log('\nMindCloud example app setup — press Enter to accept a [default].\n');

  for (const field of FIELDS) {
    const fallback = existing[field.key] || field.fallback || '';

    let answer = '';
    do {
      const suffix = fallback ? ` [${fallback}]` : '';
      const response = isStdinClosed ? null : await Promise.race([readline.question(`${field.label}${suffix}: `), stdinClosed]);

      if (response === null) {
        if (field.required && !fallback) {
          console.error(`\n${field.key} is required — run the setup interactively.`);
          process.exit(1);
        }
        answer = fallback;
        break;
      }

      answer = response.trim() || fallback;

      if (field.required && !answer) {
        console.log('  This value is required.');
      }
    } while (field.required && !answer);

    values[field.key] = answer;
  }

  readline.close();

  for (const key of PASSTHROUGH_KEYS) {
    if (existing[key]) {
      values[key] = existing[key];
    }
  }

  const contents =
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';
  writeFileSync(ENV_FILE, contents);

  console.log('\nWrote .env.local. Start the app with:\n\n  npm run dev\n\nThen open http://localhost:4321\n');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
