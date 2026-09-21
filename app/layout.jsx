import AppNav from './AppNav.jsx';
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
            <AppNav />
            <div className="sidebar-footer">Powered by MindCloud</div>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
