import SetupClient from './SetupClient.jsx';

export const metadata = { title: 'Setup — Beacon' };

export default function SetupPage() {
  return (
    <>
      <header className="page-header">
        <h1>Setup guide</h1>
        <p>Zero to posting in your own Slack. Numbered steps happen in the MindCloud dashboard; the rest this app checks for you as you go.</p>
      </header>
      <SetupClient />
    </>
  );
}
