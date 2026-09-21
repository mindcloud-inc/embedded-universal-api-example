// The API key can arrive two ways: from the environment, or typed into the
// setup page (which persists it to .env.local). Reading the file as a last
// resort means a key saved from the page works immediately, without waiting
// for the dev server to pick up the env change.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ENV_PATH = path.join(process.cwd(), '.env.local');

let runtimeApiKey = null;

const readEnvFile = () => {
  if (!existsSync(ENV_PATH)) {
    return {};
  }

  const entries = readFileSync(ENV_PATH, 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    });

  return Object.fromEntries(entries);
};

export const getApiKey = () => {
  return runtimeApiKey || process.env.MINDCLOUD_API_KEY || readEnvFile().MINDCLOUD_API_KEY || '';
};

export const saveApiKey = (apiKey) => {
  runtimeApiKey = apiKey;

  const env = { ...readEnvFile(), MINDCLOUD_API_KEY: apiKey };
  const contents =
    Object.entries(env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';

  writeFileSync(ENV_PATH, contents);
};
