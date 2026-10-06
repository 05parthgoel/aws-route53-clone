'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Bell, Sun, Moon, LogOut, Globe, User as UserIcon, Menu, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface AWSHeaderProps {
  onToggleSidebar?: () => void;
  onGlobalSearch?: (query: string) => void;
}

export const AWSHeader: React.FC<AWSHeaderProps> = ({ onToggleSidebar, onGlobalSearch }) => {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onGlobalSearch) onGlobalSearch(e.target.value);
  };

  return (
    <header className="bg-aws-header text-white h-12 flex items-center justify-between px-3 border-b border-gray-800 select-none z-30 sticky top-0 shadow-md">
      {/* Left: Hamburger menu + Logo + Service Name */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-1 hover:bg-gray-700 rounded text-gray-300 md:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <div className="bg-aws-orange text-white text-xs font-black px-1.5 py-0.5 rounded tracking-tighter">
            AWS
          </div>
          <span className="font-bold text-sm text-gray-100 group-hover:text-white tracking-tight">
            Route 53
          </span>
        </Link>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search for resources, services, docs... (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#161e2d] text-xs text-gray-200 pl-8 pr-12 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-aws-orange transition"
          />
          <span className="absolute right-2.5 top-1.5 text-[10px] text-gray-400 border border-gray-700 px-1 rounded bg-gray-800">
            Ctrl+K
          </span>
        </div>
      </div>

      {/* Right: Controls, Region, Dark mode, Account Dropdown */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Region Indicator */}
        <div className="hidden lg:flex items-center space-x-1 px-2 py-1 bg-[#161e2d] rounded border border-gray-700 text-gray-300">
          <Globe className="w-3.5 h-3.5 text-aws-orange" />
          <span className="font-semibold text-[11px]">Global</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 hover:bg-gray-700 rounded text-gray-300 transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-300 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-aws-orange rounded-full"></span>
        </button>

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 hover:bg-gray-700 rounded text-gray-200 transition"
          >
            <UserIcon className="w-4 h-4 text-gray-300" />
            <span className="font-semibold hidden md:inline">{user?.username || 'aws-admin'}</span>
            <span className="text-[10px] text-gray-400 hidden xl:inline">({user?.aws_account_id || '1234-5678-9012'})</span>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#161e2d] border border-gray-700 rounded shadow-xl py-2 z-50 text-gray-200">
              <div className="px-3 py-2 border-b border-gray-700">
                <p className="font-bold text-xs text-white">{user?.username}</p>
                <p className="text-[11px] text-gray-400">Account ID: {user?.aws_account_id}</p>
              </div>
              <Link 
                href="/dashboard" 
                className="block px-3 py-1.5 hover:bg-gray-700 text-xs"
                onClick={() => setUserDropdownOpen(false)}
              >
                AWS Management Console
              </Link>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-900/40 text-red-400 text-xs flex items-center space-x-1.5 mt-1 border-t border-gray-700 pt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
