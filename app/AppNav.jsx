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
  const { isSetupComplete } = getSlackContext(integrations);

  const items = isSetupComplete
    ? [
        { href: '/', label: 'Inbox' },
        { href: '/integrations', label: 'Integrations' },
        { href: '/setup', label: 'Setup guide' }
      ]
    : [{ href: '/setup', label: 'Setup guide' }];

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
