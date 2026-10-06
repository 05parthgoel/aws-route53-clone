'use client';

import React from 'react';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { Share2, Plus, Info } from 'lucide-react';
import Link from 'next/link';

export default function TrafficPoliciesPage() {
  return (
    <AWSPageContainer
      title="Traffic policies"
      description="Traffic flow allows you to construct complex routing configurations visually."
      breadcrumbs={[{ label: 'Traffic policies' }]}
      actions={
        <button disabled className="aws-btn-primary opacity-50 cursor-not-allowed flex items-center space-x-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Create traffic policy</span>
        </button>
      }
    >
      <div className="aws-card text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center mx-auto text-purple-600">
          <Share2 className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-bold text-base text-aws-textLight dark:text-aws-textDark">
            Traffic Policies & Visual Flow (Placeholder)
          </h3>
          <p className="text-xs text-aws-subtextLight dark:text-aws-subtextDark">
            Traffic policies enable geolocation routing, latency-based routing, and multi-region failover trees using visual diagrams.
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded max-w-lg mx-auto text-xs text-blue-800 dark:text-blue-300 flex items-center space-x-2 text-left">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>This feature section is currently mocked. Use Hosted Zones to manage DNS records.</span>
        </div>

        <Link href="/hosted-zones" className="aws-btn-secondary inline-block">
          Return to Hosted Zones
        </Link>
      </div>
    </AWSPageContainer>
  );
}
