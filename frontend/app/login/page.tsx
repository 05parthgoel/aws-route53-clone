'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, User as UserIcon, Building, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [awsAccountId, setAwsAccountId] = useState('1234-5678-9012');
  const [username, setUsername] = useState('aws-admin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password, awsAccountId);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f3f3] dark:bg-[#0f1b2a] flex flex-col justify-between items-center p-4">
      {/* Top Header */}
      <div className="w-full max-w-md pt-8 flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-[#ec7211] text-white text-base font-black px-2 py-1 rounded tracking-tighter shadow-sm">
            AWS
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Amazon Route 53
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          AWS Management Console - IAM User Sign-In
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#1d2c3f] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-6 my-auto">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#ec7211]" />
            <span>Sign in as IAM user</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Access hosted zones, DNS records, and Route 53 services.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* AWS Account ID */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              AWS Account ID or Account Alias
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={awsAccountId}
                onChange={(e) => setAwsAccountId(e.target.value)}
                placeholder="1234-5678-9012"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3] focus:outline-none"
              />
            </div>
          </div>

          {/* IAM Username */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              IAM user name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="aws-admin"
                required
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3] focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3] focus:outline-none"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ec7211] hover:bg-[#eb5f07] text-white font-bold py-2.5 px-4 rounded transition flex items-center justify-center space-x-2 text-sm shadow disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>Mock AWS IAM Authenticator</span>
          <span className="text-[#0972d3] cursor-pointer hover:underline">Forgot password?</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-[11px] text-gray-500 dark:text-gray-400 pb-4 text-center">
        © 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
      </footer>
    </div>
  );
}
