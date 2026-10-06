'use client';

import React from 'react';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { Activity, Plus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function HealthChecksPage() {
  return (
    <AWSPageContainer
      title="Health checks"
      description="Route 53 health checks monitor the health and performance of your web applications."
      breadcrumbs={[{ label: 'Health checks' }]}
      actions={
        <button disabled className="aws-btn-primary opacity-50 cursor-not-allowed flex items-center space-x-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Create health check</span>
        </button>
      }
    >
      <div className="space-y-4">
        <div className="aws-card p-4 border-l-4 border-l-green-500 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-bold text-xs text-aws-textLight dark:text-aws-textDark">
                Global Endpoint Health Monitoring Status
              </h3>
              <p className="text-aws-subtextLight dark:text-aws-subtextDark text-[11px]">
                All mock health check probes are active across 15 global AWS Edge locations.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 font-bold rounded text-[11px]">
            2 / 2 Healthy
          </span>
        </div>

        <div className="aws-card text-center py-8 space-y-3">
          <Activity className="w-10 h-10 text-green-500 mx-auto" />
          <h4 className="font-bold text-sm">Health Checks Configuration (Placeholder)</h4>
          <p className="text-xs text-aws-subtextLight dark:text-aws-subtextDark max-w-md mx-auto">
            Configure HTTP/HTTPS endpoint probes, String matching, and CloudWatch alarm triggers for DNS failover.
          </p>
          <Link href="/hosted-zones" className="aws-btn-secondary inline-block">
            Go to Hosted Zones
          </Link>
        </div>
      </div>
    </AWSPageContainer>
  );
}
