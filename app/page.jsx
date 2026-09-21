import Link from 'next/link';

// A fake team inbox so the integrations page has a believable home. Everything
// on this page is static — the real example lives at /integrations.
const CONVERSATIONS = [
  { from: 'Maya Chen', subject: 'Order #4821 never arrived', time: '9:12 AM', tag: 'Urgent' },
  { from: 'Jordan Alvarez', subject: 'Can we upgrade to the team plan?', time: '8:47 AM', tag: 'Sales' },
  { from: 'Priya Nair', subject: 'CSV export renders blank columns', time: 'Yesterday', tag: 'Bug' },
  { from: 'Sam Whitfield', subject: 'Loving the new dashboard!', time: 'Yesterday', tag: 'Praise' }
];

export default function InboxPage() {
  return (
    <>
      <header className="page-header">
        <h1>Inbox</h1>
        <p>
          This is a mock customer-messaging app. The interesting part is the <Link href="/integrations">Integrations</Link> page, where your customers connect
          their own Slack, email, and other accounts through MindCloud.
        </p>
      </header>
      <div className="inbox">
        {CONVERSATIONS.map((conversation) => (
          <div key={conversation.subject} className="inbox-row">
            <div>
              <div className="inbox-from">{conversation.from}</div>
              <div className="inbox-subject">{conversation.subject}</div>
            </div>
            <div className="inbox-meta">
              <span className="chip">{conversation.tag}</span>
              <span className="inbox-time">{conversation.time}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
