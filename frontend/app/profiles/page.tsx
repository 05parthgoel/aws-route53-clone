'use client';

import React from 'react';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { Layers } from 'lucide-react';
import Link from 'next/link';

export default function ProfilesPage() {
  return (
    <AWSPageContainer
      title="Route 53 Profiles"
      description="Route 53 Profiles allow you to share DNS configurations across multiple VPCs and AWS accounts."
      breadcrumbs={[{ label: 'Profiles' }]}
    >
      <div className="aws-card text-center py-12 space-y-4">
        <Layers className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-bold text-sm">Route 53 Profiles (Placeholder)</h3>
        <p className="text-xs text-aws-subtextLight dark:text-aws-subtextDark max-w-md mx-auto">
          Centralize management of private hosted zones, Resolver rules, and DNS Firewall rule groups.
        </p>
        <Link href="/hosted-zones" className="aws-btn-secondary inline-block">
          Go to Hosted Zones
        </Link>
      </div>
    </AWSPageContainer>
  );
}
