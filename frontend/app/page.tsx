'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-aws-bgLight dark:bg-aws-bgDark flex items-center justify-center">
      <div className="flex items-center space-x-2 text-xs font-semibold text-aws-subtextLight dark:text-aws-subtextDark">
        <div className="w-4 h-4 border-2 border-aws-orange border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Amazon Route 53 Console...</span>
      </div>
    </div>
  );
}
