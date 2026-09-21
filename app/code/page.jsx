import { readFileSync } from 'node:fs';
import path from 'node:path';
import CodeExplorer from './CodeExplorer.jsx';

export const metadata = { title: 'Code Implementation — Beacon' };

// The files are read from disk rather than pasted as snippets: what you see
// here is exactly the code that just ran.
const SECTIONS = [
  {
    step: '1',
    title: 'Identify the customer',
    where: 'Backend',
    summary: 'MindCloud needs to know which of your customers is connecting. Create the end user once and store the id against your own user record, then mint a short-lived token whenever they open your integrations page. Your API key never leaves the server.',
    files: [
      { file: 'app/api/embedded-token/route.js', caption: 'Create-or-reuse the end user, then mint their token.' },
      { file: 'lib/demoUserStore.js', caption: 'Stands in for your users table. In your app this is a column, not a JSON file.' }
    ]
  },
  {
    step: '2',
    title: 'Let the customer connect',
    where: 'Frontend',
    summary: 'Load the SDK with that token and render whatever UI you like around it. The connect dialog itself — credential forms, OAuth popups, per-installation options — is MindCloud-hosted, so there is nothing to build or maintain.',
    files: [
      { file: 'lib/useMindCloud.js', caption: 'Token → SDK script → setToken → integrations, plus openConnect/openManage.' },
      { file: 'app/integrations/IntegrationsClient.jsx', caption: 'Your own integrations page: cards rendered from sdk.getIntegrations().' }
    ]
  },
  {
    step: '3',
    title: 'Use the connection',
    where: 'Backend',
    summary: 'Call any of the 3,400+ apps with one REST shape, addressed by the installationId. Reads and writes are the same call with a different action, and no provider token ever touches your codebase.',
    files: [
      { file: 'app/api/slack-channels/route.js', caption: 'A read: list the customer\'s Slack channels.' },
      { file: 'app/api/send-to-slack/route.js', caption: 'A write: post a message as that customer.' },
      { file: 'lib/mindcloud.js', caption: 'The shared server-side client — the only place the API key is read.' }
    ]
  }
];

const readFile = (file) => {
  try {
    return readFileSync(path.join(process.cwd(), file), 'utf8');
  } catch {
    return `// ${file} could not be read.`;
  }
};

export default function CodePage() {
  // Read the files on the server, hand the contents to the client explorer.
  const sections = SECTIONS.map((section) => ({
    ...section,
    files: section.files.map((file) => ({ ...file, code: readFile(file.file) }))
  }));

  return (
    <>
      <header className="page-header">
        <h1>Code Implementation</h1>
        <p>You just ran MindCloud Embedded end to end: a customer connected their own Slack, and this app used that connection through the Universal API. Here is every piece, so you can do the same in your codebase.</p>
      </header>

      <CodeExplorer sections={sections} />

      <div className="notice">
        <p>
          <strong>Next step:</strong> hand <code>LLM.md</code> in this repo to your AI coding tool. It carries every API contract, error code, and the checklist for adapting these patterns to your own stack.
        </p>
      </div>
    </>
  );
}
