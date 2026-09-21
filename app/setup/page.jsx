import SetupClient from './SetupClient.jsx';

export const metadata = { title: 'Setup — Beacon' };

export default function SetupPage() {
  return (
    <>
      <header className="page-header">
        <h1>Setup guide</h1>
        <p>Five minutes from zero to posting in your own Slack. Steps 1–3 are one-time setup in your MindCloud account; 4–5 are what every customer does in this app.</p>
      </header>
      <SetupClient />
    </>
  );
}
