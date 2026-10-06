'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AWSModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const AWSModal: React.FC<AWSModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white dark:bg-aws-cardDark border border-aws-borderLight dark:border-aws-borderDark w-full ${maxWidthClass} rounded shadow-2xl flex flex-col overflow-hidden transform transition-all`}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-aws-borderLight dark:border-aws-borderDark bg-gray-50 dark:bg-gray-800/80 flex items-center justify-between">
          <h3 className="font-bold text-sm text-aws-textLight dark:text-aws-textDark">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-aws-subtextLight dark:text-aws-subtextDark hover:text-aws-textLight dark:hover:text-white rounded transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-aws-borderLight dark:border-aws-borderDark bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
