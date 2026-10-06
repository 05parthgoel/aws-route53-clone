'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AWSNotificationProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  onDismiss?: () => void;
}

export const AWSNotification: React.FC<AWSNotificationProps> = ({
  type,
  title,
  message,
  onDismiss
}) => {
  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950/40 border-green-500 text-green-800 dark:text-green-300',
      icon: <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-800 dark:text-blue-300',
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300',
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
    }
  }[type];

  return (
    <div className={`p-3 border-l-4 rounded shadow-sm text-xs flex items-start justify-between space-x-3 mb-4 ${styles.bg}`}>
      <div className="flex items-start space-x-2.5">
        {styles.icon}
        <div>
          <h4 className="font-bold">{title}</h4>
          {message && <p className="mt-0.5 opacity-90">{message}</p>}
        </div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-0.5 hover:opacity-100 opacity-60">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
