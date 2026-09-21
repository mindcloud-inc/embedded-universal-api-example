import InboxClient from './InboxClient.jsx';

export default function InboxPage() {
  return (
    <>
      <header className="page-header">
        <h1>Inbox</h1>
        <p>Try "Send to Slack" on any conversation — it posts to your own Slack through the connection made on the Integrations page.</p>
      </header>
      <InboxClient />
    </>
  );
}
