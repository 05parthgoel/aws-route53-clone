'use client';

import React from 'react';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { Network, Plus, Info } from 'lucide-react';
import Link from 'next/link';

export default function ResolverPage() {
  return (
    <AWSPageContainer
      title="Route 53 Resolver"
      description="Route 53 Resolver responds recursively to DNS queries for AWS resources."
      breadcrumbs={[{ label: 'Resolver' }]}
    >
      <div className="aws-card text-center py-12 space-y-4">
        <Network className="w-12 h-12 text-purple-500 mx-auto" />
        <h3 className="font-bold text-sm">Route 53 Resolver Endpoints & Rules (Placeholder)</h3>
        <p className="text-xs text-aws-subtextLight dark:text-aws-subtextDark max-w-md mx-auto">
          Inbound and outbound endpoints facilitate hybrid cloud DNS resolution between AWS VPCs and on-premises data centers.
        </p>
        <Link href="/hosted-zones" className="aws-btn-secondary inline-block">
          Go to Hosted Zones
        </Link>
      </div>
    </AWSPageContainer>
  );
}
