'use client';

import React, { useState } from 'react';
import { AWSHeader } from './AWSHeader';
import { AWSSidebar } from './AWSSidebar';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AWSPageContainerProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const AWSPageContainer: React.FC<AWSPageContainerProps> = ({
  title,
  description,
  breadcrumbs = [],
  actions,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-aws-bgLight dark:bg-aws-bgDark text-aws-textLight dark:text-aws-textDark">
      <AWSHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <AWSSidebar isOpen={sidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Breadcrumb Bar */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1.5 text-xs text-aws-subtextLight dark:text-aws-subtextDark">
              <Link href="/dashboard" className="hover:text-aws-blue transition font-medium">
                Route 53
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-aws-blue transition font-medium">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-aws-textLight dark:text-aws-textDark">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Page Title & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-aws-borderLight dark:border-aws-borderDark">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-aws-textLight dark:text-aws-textDark">
                {title}
              </h1>
              {description && (
                <p className="text-xs text-aws-subtextLight dark:text-aws-subtextDark mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>

          {/* Main Page Content */}
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};
