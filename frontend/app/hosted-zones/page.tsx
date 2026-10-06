'use client';

import React, { useEffect, useState } from 'react';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { AWSTable, Column } from '@/components/ui/AWSTable';
import { AWSModal } from '@/components/ui/AWSModal';
import { AWSNotification } from '@/components/ui/AWSNotification';
import { zonesApi, HostedZone } from '@/lib/api';
import Link from 'next/link';
import { Plus, Trash2, Globe, FileText, ExternalLink, RefreshCw } from 'lucide-react';

export default function HostedZonesPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneTypeFilter, setZoneTypeFilter] = useState('All');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form state
  const [domainName, setDomainName] = useState('');
  const [zoneType, setZoneType] = useState('Public');
  const [comment, setComment] = useState('');
  const [vpcId, setVpcId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  const fetchZones = () => {
    setLoading(true);
    zonesApi.getAll(searchQuery, zoneTypeFilter)
      .then(setZones)
      .catch((err) => {
        setNotification({
          type: 'error',
          title: 'Failed to fetch hosted zones',
          message: err?.response?.data?.detail || err.message
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchZones();
  }, [zoneTypeFilter]);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName) return;

    setSubmitting(true);
    try {
      const created = await zonesApi.create({
        name: domainName,
        type: zoneType,
        comment,
        vpc_id: zoneType === 'Private' ? vpcId : undefined
      });
      setNotification({
        type: 'success',
        title: 'Hosted zone created successfully',
        message: `Hosted zone '${created.name}' (${created.id}) has been created with default NS & SOA records.`
      });
      setCreateModalOpen(false);
      setDomainName('');
      setComment('');
      setVpcId('');
      fetchZones();
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Failed to create hosted zone',
        message: err?.response?.data?.detail || err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZones = async () => {
    if (selectedKeys.length === 0) return;
    setSubmitting(true);
    try {
      for (const id of selectedKeys) {
        await zonesApi.delete(id);
      }
      setNotification({
        type: 'success',
        title: 'Hosted zone(s) deleted',
        message: `Successfully deleted ${selectedKeys.length} hosted zone(s).`
      });
      setSelectedKeys([]);
      setDeleteModalOpen(false);
      fetchZones();
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Delete failed',
        message: err?.response?.data?.detail || err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<HostedZone>[] = [
    {
      header: 'Domain name',
      cell: (zone) => (
        <div className="flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-aws-orange" />
          <Link
            href={`/hosted-zones/${zone.id}`}
            className="font-bold text-aws-blue hover:underline text-xs"
          >
            {zone.name}
          </Link>
        </div>
      )
    },
    {
      header: 'Type',
      cell: (zone) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            zone.type === 'Public'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
          }`}
        >
          {zone.type}
        </span>
      )
    },
    {
      header: 'Record count',
      accessorKey: 'record_count',
      cell: (zone) => (
        <span className="font-semibold">{zone.record_count} records</span>
      )
    },
    {
      header: 'Hosted Zone ID',
      accessorKey: 'id',
      cell: (zone) => (
        <code className="font-mono text-[11px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
          {zone.id}
        </code>
      )
    },
    {
      header: 'Comment',
      cell: (zone) => (
        <span className="text-aws-subtextLight dark:text-aws-subtextDark italic truncate max-w-xs block">
          {zone.comment || '—'}
        </span>
      )
    }
  ];

  return (
    <AWSPageContainer
      title="Hosted zones"
      description="A hosted zone is a container for DNS records that define how you want to route traffic on the internet."
      breadcrumbs={[{ label: 'Hosted zones' }]}
      actions={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDeleteModalOpen(true)}
            disabled={selectedKeys.length === 0}
            className="aws-btn-danger flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="aws-btn-primary flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create hosted zone</span>
          </button>
        </div>
      }
    >
      {notification && (
        <AWSNotification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Main Table */}
      <AWSTable
        data={zones}
        columns={columns}
        keyExtractor={(item) => item.id}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        searchPlaceholder="Filter hosted zones by domain name or ID..."
        onRefresh={fetchZones}
        filterOptions={
          <select
            value={zoneTypeFilter}
            onChange={(e) => setZoneTypeFilter(e.target.value)}
            className="aws-select"
          >
            <option value="All">All Zone Types</option>
            <option value="Public">Public Hosted Zone</option>
            <option value="Private">Private Hosted Zone</option>
          </select>
        }
      />

      {/* Create Hosted Zone Modal */}
      <AWSModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create hosted zone"
        footer={
          <>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="aws-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateZone}
              disabled={submitting || !domainName}
              className="aws-btn-primary"
            >
              {submitting ? 'Creating...' : 'Create hosted zone'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateZone} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">
              Domain name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. example.com or app.internal"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              required
              className="aws-input"
            />
            <p className="text-[11px] text-aws-subtextLight dark:text-aws-subtextDark mt-1">
              Enter the registered domain name or sub-domain for this zone.
            </p>
          </div>

          <div>
            <label className="block font-bold mb-1">Type</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 border p-2.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="zoneType"
                  value="Public"
                  checked={zoneType === 'Public'}
                  onChange={() => setZoneType('Public')}
                  className="accent-aws-orange"
                />
                <div>
                  <div className="font-bold">Public hosted zone</div>
                  <div className="text-[11px] text-aws-subtextLight dark:text-aws-subtextDark">
                    Routes traffic on the public internet.
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-2 border p-2.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  type="radio"
                  name="zoneType"
                  value="Private"
                  checked={zoneType === 'Private'}
                  onChange={() => setZoneType('Private')}
                  className="accent-aws-orange"
                />
                <div>
                  <div className="font-bold">Private hosted zone for Amazon VPC</div>
                  <div className="text-[11px] text-aws-subtextLight dark:text-aws-subtextDark">
                    Routes traffic within one or more Amazon VPCs.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {zoneType === 'Private' && (
            <div>
              <label className="block font-bold mb-1">VPC ID</label>
              <input
                type="text"
                placeholder="e.g. vpc-0a1b2c3d4e5f67890"
                value={vpcId}
                onChange={(e) => setVpcId(e.target.value)}
                className="aws-input"
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-1">Comment - optional</label>
            <textarea
              placeholder="Provide a description or purpose for this zone"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="aws-input resize-none"
            />
          </div>
        </form>
      </AWSModal>

      {/* Delete Hosted Zone Modal */}
      <AWSModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete hosted zone(s)"
        maxWidth="md"
        footer={
          <>
            <button onClick={() => setDeleteModalOpen(false)} className="aws-btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteZones} disabled={submitting} className="aws-btn-danger">
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </>
        }
      >
        <p className="font-semibold text-aws-textLight dark:text-aws-textDark">
          Are you sure you want to delete {selectedKeys.length} selected hosted zone(s)?
        </p>
        <p className="text-red-600 dark:text-red-400 text-xs">
          Deleting a hosted zone will also permanently delete all DNS records within it. This operation cannot be undone.
        </p>
      </AWSModal>
    </AWSPageContainer>
  );
}
