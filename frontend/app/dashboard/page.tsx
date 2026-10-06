'use client';

import React, { useEffect, useState } from 'react';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { zonesApi, HostedZone } from '@/lib/api';
import Link from 'next/link';
import { Globe, Activity, Share2, Network, Plus, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [hostedZones, setHostedZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    zonesApi.getAll()
      .then(setHostedZones)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPublicZones = hostedZones.filter(z => z.type === 'Public').length;
  const totalPrivateZones = hostedZones.filter(z => z.type === 'Private').length;
  const totalRecords = hostedZones.reduce((acc, z) => acc + (z.record_count || 0), 0);

  return (
    <AWSPageContainer
      title="Route 53 Dashboard"
      description="Amazon Route 53 is a highly available and scalable Domain Name System (DNS) web service."
      actions={
        <Link href="/hosted-zones" className="aws-btn-primary flex items-center space-x-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Create hosted zone</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Top Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Hosted Zones Card */}
          <div className="aws-card border-l-4 border-l-aws-orange hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase tracking-wider">
                  Hosted Zones
                </p>
                <h3 className="text-2xl font-black text-aws-textLight dark:text-aws-textDark mt-1">
                  {loading ? '...' : hostedZones.length}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-950/50 rounded-full text-aws-orange">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-aws-borderLight dark:border-aws-borderDark flex items-center justify-between text-xs text-aws-subtextLight dark:text-aws-subtextDark">
              <span>{totalPublicZones} Public / {totalPrivateZones} Private</span>
              <Link href="/hosted-zones" className="text-aws-blue hover:underline font-semibold flex items-center space-x-1">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* DNS Records Count Card */}
          <div className="aws-card border-l-4 border-l-blue-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase tracking-wider">
                  Managed Records
                </p>
                <h3 className="text-2xl font-black text-aws-textLight dark:text-aws-textDark mt-1">
                  {loading ? '...' : totalRecords}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-full text-blue-500">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-aws-borderLight dark:border-aws-borderDark flex items-center justify-between text-xs text-aws-subtextLight dark:text-aws-subtextDark">
              <span>Across {hostedZones.length} zones</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">100% Synced</span>
            </div>
          </div>

          {/* Health Checks Card */}
          <div className="aws-card border-l-4 border-l-green-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase tracking-wider">
                  Health Checks
                </p>
                <h3 className="text-2xl font-black text-aws-textLight dark:text-aws-textDark mt-1">
                  2 Healthy
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-950/50 rounded-full text-green-500">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-aws-borderLight dark:border-aws-borderDark flex items-center justify-between text-xs text-aws-subtextLight dark:text-aws-subtextDark">
              <span>0 Alarming</span>
              <Link href="/health-checks" className="text-aws-blue hover:underline font-semibold flex items-center space-x-1">
                <span>Configure</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Traffic Policies Card */}
          <div className="aws-card border-l-4 border-l-purple-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase tracking-wider">
                  Traffic Policies
                </p>
                <h3 className="text-2xl font-black text-aws-textLight dark:text-aws-textDark mt-1">
                  0 Policies
                </h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-950/50 rounded-full text-purple-500">
                <Share2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-aws-borderLight dark:border-aws-borderDark flex items-center justify-between text-xs text-aws-subtextLight dark:text-aws-subtextDark">
              <span>Visual Traffic Flow</span>
              <Link href="/traffic-policies" className="text-aws-blue hover:underline font-semibold flex items-center space-x-1">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Start & Recent Zones Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Hosted Zones Table Card */}
          <div className="lg:col-span-2 aws-card space-y-4">
            <div className="flex items-center justify-between border-b border-aws-borderLight dark:border-aws-borderDark pb-3">
              <h2 className="font-bold text-sm text-aws-textLight dark:text-aws-textDark flex items-center space-x-2">
                <Globe className="w-4 h-4 text-aws-orange" />
                <span>Hosted zones overview</span>
              </h2>
              <Link href="/hosted-zones" className="text-xs text-aws-blue font-semibold hover:underline">
                View all hosted zones
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-aws-subtextLight dark:text-aws-subtextDark">
                Loading hosted zones...
              </div>
            ) : hostedZones.length === 0 ? (
              <div className="py-8 text-center text-xs text-aws-subtextLight dark:text-aws-subtextDark space-y-2">
                <p className="font-semibold text-sm">No hosted zones created yet.</p>
                <p>Create a hosted zone to start routing DNS traffic for your domain.</p>
                <Link href="/hosted-zones" className="aws-btn-primary inline-block mt-2">
                  Create Hosted Zone
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-aws-subtextLight dark:text-aws-subtextDark border-b border-aws-borderLight dark:border-aws-borderDark">
                      <th className="p-2.5 font-semibold">Domain Name</th>
                      <th className="p-2.5 font-semibold">Type</th>
                      <th className="p-2.5 font-semibold">Hosted Zone ID</th>
                      <th className="p-2.5 font-semibold">Record Count</th>
                      <th className="p-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aws-borderLight dark:divide-aws-borderDark">
                    {hostedZones.slice(0, 5).map((zone) => (
                      <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                        <td className="p-2.5 font-semibold text-aws-blue hover:underline">
                          <Link href={`/hosted-zones/${zone.id}`}>
                            {zone.name}
                          </Link>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            zone.type === 'Public' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          }`}>
                            {zone.type}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-aws-subtextLight dark:text-aws-subtextDark">
                          {zone.id}
                        </td>
                        <td className="p-2.5">{zone.record_count}</td>
                        <td className="p-2.5 text-right">
                          <Link href={`/hosted-zones/${zone.id}`} className="aws-btn-secondary py-0.5 px-2">
                            Manage records
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Features & Quick Actions Card */}
          <div className="aws-card space-y-4">
            <h2 className="font-bold text-sm text-aws-textLight dark:text-aws-textDark border-b border-aws-borderLight dark:border-aws-borderDark pb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Route 53 Quick Actions</span>
            </h2>

            <div className="space-y-2 text-xs">
              <Link href="/hosted-zones" className="block p-3 border border-aws-borderLight dark:border-aws-borderDark rounded hover:border-aws-blue hover:bg-blue-50/50 dark:hover:bg-gray-800 transition">
                <div className="font-bold text-aws-textLight dark:text-aws-textDark">Create Hosted Zone</div>
                <div className="text-aws-subtextLight dark:text-aws-subtextDark text-[11px] mt-0.5">
                  Configure DNS domain routing for Public or Private VPC domains.
                </div>
              </Link>

              <Link href="/hosted-zones" className="block p-3 border border-aws-borderLight dark:border-aws-borderDark rounded hover:border-aws-blue hover:bg-blue-50/50 dark:hover:bg-gray-800 transition">
                <div className="font-bold text-aws-textLight dark:text-aws-textDark">Import BIND Zone File</div>
                <div className="text-aws-subtextLight dark:text-aws-subtextDark text-[11px] mt-0.5">
                  Bulk import DNS records directly from standard BIND zone format files.
                </div>
              </Link>

              <Link href="/health-checks" className="block p-3 border border-aws-borderLight dark:border-aws-borderDark rounded hover:border-aws-blue hover:bg-blue-50/50 dark:hover:bg-gray-800 transition">
                <div className="font-bold text-aws-textLight dark:text-aws-textDark">Monitor Health Checks</div>
                <div className="text-aws-subtextLight dark:text-aws-subtextDark text-[11px] mt-0.5">
                  Monitor endpoint availability and configure failover routing.
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AWSPageContainer>
  );
}
