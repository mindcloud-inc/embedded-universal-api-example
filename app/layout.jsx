import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Beacon — MindCloud embedded example',
  description: 'Minimal example SaaS app with a MindCloud-powered integrations page.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <span className="brand-dot" /> Beacon
            </div>
            <nav>
              <Link href="/">Inbox</Link>
              <Link href="/integrations">Integrations</Link>
            </nav>
            <div className="sidebar-footer">Mock SaaS app · powered by MindCloud</div>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
