import SetupClient from './SetupClient.jsx';

export const metadata = { title: 'Demo Setup Guide — Beacon' };

export default function SetupPage() {
  return (
    <>
      <header className="page-header">
        <h1>Demo Setup Guide</h1>
        <p>
          Beacon is a fake SaaS product demonstrating MindCloud Embedded: your customers connect their own accounts inside your app, and your backend then uses those connections through one API. Follow the steps to see it working with your own Slack — this
          app checks off each one as you go.
        </p>
      </header>
      <SetupClient />
    </>
  );
}
