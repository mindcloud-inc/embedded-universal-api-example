'use client';

// Until setup is finished there is nothing to look at, so the nav shows the
// setup guide alone; the product pages appear once Slack is connected.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMindCloud } from '../lib/useMindCloud.js';
import { getSlackContext } from '../lib/getSlackContext.js';

export default function AppNav() {
  const pathname = usePathname();
  const { integrations } = useMindCloud();
  const { hasIntegration } = getSlackContext(integrations);

  const items = hasIntegration
    ? [
        { href: '/', label: 'Inbox' },
        { href: '/integrations', label: 'Integrations' },
        { href: '/setup', label: 'Demo Setup Guide' },
        { href: '/code', label: 'See Code Implementation' }
      ]
    : [{ href: '/setup', label: 'Demo Setup Guide' }];

  return (
    <nav>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
