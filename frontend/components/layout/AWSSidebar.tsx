'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Globe, 
  Share2, 
  Activity, 
  Network, 
  Layers, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';

interface AWSSidebarProps {
  isOpen?: boolean;
}

export const AWSSidebar: React.FC<AWSSidebarProps> = ({ isOpen = true }) => {
  const pathname = usePathname();
  const [dnsExpanded, setDnsExpanded] = useState(true);
  const [trafficExpanded, setTrafficExpanded] = useState(true);
  const [resolverExpanded, setResolverExpanded] = useState(true);

  const isActive = (path: string) => {
    if (path === '/hosted-zones' && pathname.startsWith('/hosted-zones')) return true;
    return pathname === path;
  };

  return (
    <aside className={`bg-white dark:bg-[#161e2d] w-64 border-r border-aws-borderLight dark:border-aws-borderDark flex-shrink-0 flex flex-col transition-all duration-200 ${isOpen ? 'block' : 'hidden md:block'}`}>
      <div className="p-3 border-b border-aws-borderLight dark:border-aws-borderDark flex items-center justify-between">
        <h2 className="font-bold text-xs uppercase tracking-wider text-aws-subtextLight dark:text-aws-subtextDark">
          Route 53 Navigation
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-medium">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center space-x-2.5 px-3 py-2 rounded transition ${
            isActive('/dashboard') 
              ? 'bg-orange-50 dark:bg-aws-cardDark border-l-4 border-aws-orange text-aws-orange font-bold' 
              : 'text-aws-textLight dark:text-aws-textDark hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* DNS Management Section */}
        <div>
          <button
            onClick={() => setDnsExpanded(!dnsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-aws-subtextLight dark:text-aws-subtextDark hover:text-aws-textLight font-semibold text-[11px] uppercase tracking-wider"
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-aws-orange" />
              <span>DNS Management</span>
            </div>
            {dnsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          {dnsExpanded && (
            <div className="ml-4 pl-2 border-l border-aws-borderLight dark:border-aws-borderDark space-y-0.5 mt-0.5">
              <Link
                href="/hosted-zones"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded transition ${
                  isActive('/hosted-zones') 
                    ? 'bg-orange-50 dark:bg-aws-cardDark text-aws-orange font-bold border-l-2 border-aws-orange' 
                    : 'text-aws-textLight dark:text-aws-textDark hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>Hosted zones</span>
              </Link>
            </div>
          )}
        </div>

        {/* Traffic Management Section */}
        <div>
          <button
            onClick={() => setTrafficExpanded(!trafficExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-aws-subtextLight dark:text-aws-subtextDark hover:text-aws-textLight font-semibold text-[11px] uppercase tracking-wider"
          >
            <div className="flex items-center space-x-2">
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Traffic Management</span>
            </div>
            {trafficExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {trafficExpanded && (
            <div className="ml-4 pl-2 border-l border-aws-borderLight dark:border-aws-borderDark space-y-0.5 mt-0.5">
              <Link
                href="/traffic-policies"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded transition ${
                  isActive('/traffic-policies') 
                    ? 'bg-orange-50 dark:bg-aws-cardDark text-aws-orange font-bold' 
                    : 'text-aws-textLight dark:text-aws-textDark hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>Traffic policies</span>
              </Link>
            </div>
          )}
        </div>

        {/* Health Checks Section */}
        <Link
          href="/health-checks"
          className={`flex items-center space-x-2.5 px-3 py-2 rounded transition ${
            isActive('/health-checks') 
              ? 'bg-orange-50 dark:bg-aws-cardDark border-l-4 border-aws-orange text-aws-orange font-bold' 
              : 'text-aws-textLight dark:text-aws-textDark hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Activity className="w-4 h-4 text-green-500" />
          <span>Health checks</span>
        </Link>

        {/* Route 53 Resolver */}
        <div>
          <button
            onClick={() => setResolverExpanded(!resolverExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-aws-subtextLight dark:text-aws-subtextDark hover:text-aws-textLight font-semibold text-[11px] uppercase tracking-wider"
          >
            <div className="flex items-center space-x-2">
              <Network className="w-3.5 h-3.5 text-purple-500" />
              <span>Resolver</span>
            </div>
            {resolverExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {resolverExpanded && (
            <div className="ml-4 pl-2 border-l border-aws-borderLight dark:border-aws-borderDark space-y-0.5 mt-0.5">
              <Link
                href="/resolver"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded transition ${
                  isActive('/resolver') 
                    ? 'bg-orange-50 dark:bg-aws-cardDark text-aws-orange font-bold' 
                    : 'text-aws-textLight dark:text-aws-textDark hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>Rules & Endpoints</span>
              </Link>
            </div>
          )}
        </div>

        {/* Profiles */}
        <Link
          href="/profiles"
          className={`flex items-center space-x-2.5 px-3 py-2 rounded transition ${
            isActive('/profiles') 
              ? 'bg-orange-50 dark:bg-aws-cardDark border-l-4 border-aws-orange text-aws-orange font-bold' 
              : 'text-aws-textLight dark:text-aws-textDark hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Profiles</span>
        </Link>
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-aws-borderLight dark:border-aws-borderDark bg-gray-50 dark:bg-gray-900 text-[10px] text-aws-subtextLight dark:text-aws-subtextDark">
        <p className="font-semibold text-gray-700 dark:text-gray-300">AWS Route 53 Replica v1.0</p>
        <p>Connected to SQLite persistent DB</p>
      </div>
    </aside>
  );
};
