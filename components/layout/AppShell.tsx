'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const showHeaderFooter = !pathname.includes('/login');

  if (!showHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <main>
      <div className="container">
        <Header />
        <div className="content">
          <div className="content-main">{children}</div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
