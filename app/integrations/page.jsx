import IntegrationsClient from './IntegrationsClient.jsx';

export const metadata = { title: 'Integrations — Beacon' };

export default function IntegrationsPage() {
  return (
    <>
      <header className="page-header">
        <h1>Integrations</h1>
        <p>Connect the tools your team already uses.</p>
      </header>
      <IntegrationsClient />
    </>
  );
}
