'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface AWSTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  filterOptions?: React.ReactNode;
}

export function AWSTable<T>({
  data,
  columns,
  keyExtractor,
  selectedKeys = [],
  onSelectionChange,
  searchPlaceholder = 'Find resources...',
  onRefresh,
  filterOptions
}: AWSTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter data by search term
  const filteredData = data.filter((item: any) => {
    if (!searchTerm) return true;
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(paginatedData.map(keyExtractor));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (key: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedKeys, key]);
    } else {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    }
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedKeys.includes(keyExtractor(item)));

  return (
    <div className="aws-card p-0 overflow-hidden border border-aws-borderLight dark:border-aws-borderDark">
      {/* Table Toolbar */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-aws-borderLight dark:border-aws-borderDark flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input + Filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-aws-subtextLight dark:text-aws-subtextDark" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="aws-input pl-8 pr-7"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filterOptions}
        </div>

        {/* Counter + Refresh */}
        <div className="flex items-center space-x-3 text-xs text-aws-subtextLight dark:text-aws-subtextDark font-medium">
          <span>
            {selectedKeys.length > 0 ? (
              <strong className="text-aws-orange">{selectedKeys.length} selected</strong>
            ) : (
              `Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - ${Math.min(
                currentPage * pageSize,
                filteredData.length
              )} of ${filteredData.length} matches`
            )}
          </span>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-aws-textLight dark:text-aws-textDark"
              title="Refresh Table Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-aws-subtextLight dark:text-aws-subtextDark border-b border-aws-borderLight dark:border-aws-borderDark font-semibold uppercase tracking-wider text-[11px]">
              {onSelectionChange && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-400 accent-aws-orange focus:ring-aws-orange"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th key={idx} className="p-3 font-bold text-aws-textLight dark:text-aws-textDark">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-aws-borderLight dark:divide-aws-borderDark">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="p-8 text-center text-aws-subtextLight dark:text-aws-subtextDark"
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="font-semibold text-sm">No matching resources found</p>
                    <p className="text-xs">Try adjusting your search filter or parameters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const key = keyExtractor(item);
                const isSelected = selectedKeys.includes(key);
                return (
                  <tr
                    key={key}
                    className={`hover:bg-blue-50/50 dark:hover:bg-gray-800/80 transition ${
                      isSelected ? 'bg-orange-50/60 dark:bg-aws-cardDark' : ''
                    }`}
                  >
                    {onSelectionChange && (
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(key, e.target.checked)}
                          className="rounded border-gray-400 accent-aws-orange focus:ring-aws-orange"
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-3 text-aws-textLight dark:text-aws-textDark">
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? (item[col.accessorKey] as any)
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-aws-borderLight dark:border-aws-borderDark flex items-center justify-between">
          <span className="text-xs text-aws-subtextLight dark:text-aws-subtextDark">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="aws-btn-secondary px-2 py-1 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="aws-btn-secondary px-2 py-1 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
