import InboxClient from './InboxClient.jsx';

export default function InboxPage() {
  return (
    <>
      <header className="page-header">
        <h1>Inbox</h1>
        <p>Pick a channel from your connected Slack, then hit "Send to Slack" on any conversation. Both are live Universal API calls against your own Slack connection.</p>
      </header>
      <InboxClient />
    </>
  );
}
