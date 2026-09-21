'use client';

// A customer-facing integrations page: cards with Connect / Manage. All the
// heavy lifting (credential forms, OAuth popups, the Options tab) is the
// MindCloud modal — this file only renders data from sdk.getIntegrations().
import Link from 'next/link';
import { useMindCloud } from '../../lib/MindCloudProvider.jsx';

const getStatus = (integration) => {
  const installations = integration.installations || [];
  const connected = installations.filter((installation) => installation.isInstalled);

  if (connected.length > 0) {
    return { label: 'Connected', className: 'chip-green', installation: connected[0] };
  }

  if (installations.length > 0) {
    return { label: 'Setup incomplete', className: 'chip-amber', installation: installations[0] };
  }

  return { label: null, installation: null };
};

export default function IntegrationsClient() {
  const { integrations, error, isLoading, openConnect, openManage } = useMindCloud();

  if (error) {
    return (
      <div className="banner banner-error">
        <span>{error}</span>
        <Link className="btn" href="/setup">
          Open the setup guide
        </Link>
      </div>
    );
  }

  // Skeleton cards keep the grid's shape so the real cards don't shift in.
  if (isLoading) {
    return (
      <div className="card-grid">
        {[0, 1].map((index) => (
          <div key={index} className="card">
            <div className="card-header">
              <span className="skeleton skeleton-icon" />
              <span className="skeleton skeleton-line skeleton-title" />
            </div>
            <p className="card-description">
              <span className="skeleton skeleton-line" />
              <span className="skeleton skeleton-line skeleton-line-short" />
            </p>
            <div className="card-actions">
              <span className="skeleton skeleton-button" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="notice">
        <p>
          <strong>No integrations yet.</strong> Integrations are defined once in your MindCloud account, then every one of your customers can connect to them here.
        </p>
        <Link className="btn btn-primary" href="/setup">
          Open the setup guide
        </Link>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {integrations.map((integration) => {
        const status = getStatus(integration);

        return (
          <div key={integration.id} className="card">
            <div className="card-header">
              {integration.app?.iconUrl && <img className="app-icon" src={integration.app.iconUrl} alt="" />}
              <div className="card-title-group">
                <div className="card-title">{integration.name}</div>
                {status.label && <span className={`chip ${status.className}`}>{status.label}</span>}
              </div>
            </div>
            <p className="card-description">{integration.description || `Connect your ${integration.app?.name || ''} account so this app can work with it on your behalf.`.trim()}</p>
            <div className="card-actions">
              {status.installation ? (
                <>
                  <button className="btn" onClick={() => openManage(status.installation.id)}>
                    Manage
                  </button>
                  <button className="btn btn-ghost" onClick={() => openConnect(integration.id)}>
                    Add another account
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => openConnect(integration.id)}>
                  Connect
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
