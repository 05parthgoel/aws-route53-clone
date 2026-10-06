'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AWSPageContainer } from '@/components/layout/AWSPageContainer';
import { AWSTable, Column } from '@/components/ui/AWSTable';
import { AWSModal } from '@/components/ui/AWSModal';
import { AWSNotification } from '@/components/ui/AWSNotification';
import { zonesApi, recordsApi, HostedZoneDetail, DNSRecord } from '@/lib/api';
import { Plus, Trash2, Edit3, Download, Upload, Copy, Check, FileText, ArrowLeft, Globe, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;

  const [zoneDetail, setZoneDetail] = useState<HostedZoneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [recordTypeFilter, setRecordTypeFilter] = useState('All');

  // Modals & Drawers state
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DNSRecord | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [importBindOpen, setImportBindOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'bind' | 'json'>('bind');
  const [exportContent, setExportContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [recSubdomain, setRecSubdomain] = useState('');
  const [recType, setRecType] = useState('A');
  const [recTtl, setRecTtl] = useState(300);
  const [recValues, setRecValues] = useState('');
  const [recRoutingPolicy, setRecRoutingPolicy] = useState('Simple');
  const [recWeight, setRecWeight] = useState<number | undefined>(undefined);
  const [recSetId, setRecSetId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // BIND Import
  const [bindContent, setBindContent] = useState('');

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; title: string; message?: string } | null>(null);

  const fetchDetail = () => {
    setLoading(true);
    zonesApi.getById(zoneId)
      .then(setZoneDetail)
      .catch((err) => {
        setNotification({
          type: 'error',
          title: 'Failed to load hosted zone details',
          message: err?.response?.data?.detail || err.message
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (zoneId) fetchDetail();
  }, [zoneId]);

  // Pre-fill edit modal when editRecord is selected
  useEffect(() => {
    if (editRecord) {
      const parts = editRecord.name.split('.');
      const suffix = zoneDetail?.name || '';
      if (editRecord.name === suffix) {
        setRecSubdomain('');
      } else {
        setRecSubdomain(editRecord.name.replace(`.${suffix}`, ''));
      }
      setRecType(editRecord.type);
      setRecTtl(editRecord.ttl);
      setRecValues(editRecord.records ? editRecord.records.join('\n') : '');
      setRecRoutingPolicy(editRecord.routing_policy);
      setRecWeight(editRecord.weight);
      setRecSetId(editRecord.set_identifier || '');
    }
  }, [editRecord, zoneDetail]);

  const handleCreateOrUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recValues.trim()) return;

    setSubmitting(true);
    const valueArray = recValues.split('\n').map(v => v.trim()).filter(Boolean);

    try {
      if (editRecord) {
        // Update existing record
        await recordsApi.update(editRecord.id, {
          name: recSubdomain ? `${recSubdomain}.${zoneDetail?.name}` : zoneDetail?.name,
          type: recType,
          ttl: Number(recTtl),
          records: valueArray,
          routing_policy: recRoutingPolicy,
          weight: recRoutingPolicy === 'Weighted' ? Number(recWeight) : undefined,
          set_identifier: recSetId || undefined
        });
        setNotification({
          type: 'success',
          title: 'Record updated successfully',
          message: `Record '${editRecord.name}' updated.`
        });
        setEditRecord(null);
      } else {
        // Create new record
        await recordsApi.create(zoneId, {
          name: recSubdomain,
          type: recType,
          ttl: Number(recTtl),
          records: valueArray,
          routing_policy: recRoutingPolicy,
          weight: recRoutingPolicy === 'Weighted' ? Number(recWeight) : undefined,
          set_identifier: recSetId || undefined
        });
        setNotification({
          type: 'success',
          title: 'Record created successfully',
          message: `New ${recType} record created.`
        });
        setCreateRecordOpen(false);
      }

      // Reset form
      setRecSubdomain('');
      setRecValues('');
      fetchDetail();
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Operation failed',
        message: err?.response?.data?.detail || err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecords = async () => {
    if (selectedKeys.length === 0) return;
    setSubmitting(true);
    try {
      await recordsApi.bulkDelete(selectedKeys);
      setNotification({
        type: 'success',
        title: 'Record(s) deleted',
        message: `Successfully deleted ${selectedKeys.length} DNS record(s).`
      });
      setSelectedKeys([]);
      setDeleteModalOpen(false);
      fetchDetail();
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

  const handleImportBind = async () => {
    if (!bindContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await recordsApi.importBind(zoneId, bindContent);
      setNotification({
        type: 'success',
        title: 'BIND Import Complete',
        message: res.message
      });
      setImportBindOpen(false);
      setBindContent('');
      fetchDetail();
    } catch (err: any) {
      setNotification({
        type: 'error',
        title: 'Import failed',
        message: err?.response?.data?.detail || err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenExport = async (format: 'bind' | 'json') => {
    setExportFormat(format);
    setExportModalOpen(true);
    try {
      if (format === 'bind') {
        const text = await zonesApi.exportBind(zoneId);
        setExportContent(text);
      } else {
        const jsonObj = await zonesApi.exportJson(zoneId);
        setExportContent(JSON.stringify(jsonObj, null, 2));
      }
    } catch (err: any) {
      setExportContent('Error loading export content.');
    }
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRecords = (zoneDetail?.records || []).filter(r => {
    if (recordTypeFilter === 'All') return true;
    return r.type === recordTypeFilter;
  });

  const columns: Column<DNSRecord>[] = [
    {
      header: 'Record name',
      cell: (r) => (
        <span className="font-bold text-aws-textLight dark:text-aws-textDark">
          {r.name}
        </span>
      )
    },
    {
      header: 'Type',
      cell: (r) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 font-mono">
          {r.type}
        </span>
      )
    },
    {
      header: 'Routing policy',
      accessorKey: 'routing_policy',
      cell: (r) => (
        <span className="text-aws-subtextLight dark:text-aws-subtextDark font-medium">
          {r.routing_policy} {r.weight !== undefined && r.weight !== null ? `(Weight: ${r.weight})` : ''}
        </span>
      )
    },
    {
      header: 'Value / Route traffic to',
      cell: (r) => (
        <div className="font-mono text-[11px] space-y-0.5 max-w-md truncate">
          {r.records.map((val, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-900/80 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 inline-block mr-1">
              {val}
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'TTL (seconds)',
      accessorKey: 'ttl',
      cell: (r) => <span className="font-mono">{r.ttl}</span>
    },
    {
      header: 'Action',
      cell: (r) => (
        <button
          onClick={() => setEditRecord(r)}
          className="aws-btn-secondary px-2 py-0.5 flex items-center space-x-1"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      )
    }
  ];

  return (
    <AWSPageContainer
      title={zoneDetail ? zoneDetail.name : 'Hosted zone details'}
      description={`Hosted Zone ID: ${zoneId}`}
      breadcrumbs={[
        { label: 'Hosted zones', href: '/hosted-zones' },
        { label: zoneDetail?.name || zoneId }
      ]}
      actions={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenExport('bind')}
            className="aws-btn-secondary flex items-center space-x-1.5"
            title="Export Zone in BIND format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export BIND</span>
          </button>

          <button
            onClick={() => setImportBindOpen(true)}
            className="aws-btn-secondary flex items-center space-x-1.5"
            title="Import BIND Zone File"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import BIND</span>
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            disabled={selectedKeys.length === 0}
            className="aws-btn-danger flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete records</span>
          </button>

          <button
            onClick={() => {
              setEditRecord(null);
              setRecSubdomain('');
              setRecValues('');
              setCreateRecordOpen(true);
            }}
            className="aws-btn-primary flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create record</span>
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

      {/* Zone Overview Summary Bar */}
      {zoneDetail && (
        <div className="aws-card bg-gray-50/80 dark:bg-gray-800/40 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-xs">
          <div>
            <p className="text-[11px] font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase">Type</p>
            <p className="font-bold mt-0.5">{zoneDetail.type} Hosted Zone</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase">Records Count</p>
            <p className="font-bold mt-0.5">{zoneDetail.records.length} records</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase">Hosted Zone ID</p>
            <p className="font-mono text-aws-blue font-semibold mt-0.5">{zoneDetail.id}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-aws-subtextLight dark:text-aws-subtextDark uppercase">Comment</p>
            <p className="italic mt-0.5 truncate">{zoneDetail.comment || 'None'}</p>
          </div>
        </div>
      )}

      {/* Records Table */}
      <AWSTable
        data={filteredRecords}
        columns={columns}
        keyExtractor={(item) => item.id}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        searchPlaceholder="Search records by name or value..."
        onRefresh={fetchDetail}
        filterOptions={
          <select
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
            className="aws-select"
          >
            <option value="All">All Record Types</option>
            <option value="A">A - IPv4 address</option>
            <option value="AAAA">AAAA - IPv6 address</option>
            <option value="CNAME">CNAME - Canonical name</option>
            <option value="TXT">TXT - Text string</option>
            <option value="MX">MX - Mail exchange</option>
            <option value="NS">NS - Name server</option>
            <option value="PTR">PTR - Pointer record</option>
            <option value="SRV">SRV - Service locator</option>
            <option value="CAA">CAA - Certification Authority</option>
          </select>
        }
      />

      {/* Create / Edit Record Modal */}
      <AWSModal
        isOpen={createRecordOpen || editRecord !== null}
        onClose={() => {
          setCreateRecordOpen(false);
          setEditRecord(null);
        }}
        title={editRecord ? `Edit DNS record: ${editRecord.name}` : `Create record in ${zoneDetail?.name}`}
        maxWidth="xl"
        footer={
          <>
            <button
              onClick={() => {
                setCreateRecordOpen(false);
                setEditRecord(null);
              }}
              className="aws-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrUpdateRecord}
              disabled={submitting || !recValues.trim()}
              className="aws-btn-primary"
            >
              {submitting ? 'Saving...' : editRecord ? 'Save changes' : 'Create record'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateOrUpdateRecord} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Record Name */}
            <div>
              <label className="block font-bold mb-1">
                Record name
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  placeholder="subdomain (e.g. www, api)"
                  value={recSubdomain}
                  onChange={(e) => setRecSubdomain(e.target.value)}
                  className="aws-input flex-1"
                />
                <span className="text-xs font-mono font-bold text-aws-subtextLight dark:text-aws-subtextDark">
                  .{zoneDetail?.name}
                </span>
              </div>
            </div>

            {/* Record Type */}
            <div>
              <label className="block font-bold mb-1">Record type</label>
              <select
                value={recType}
                onChange={(e) => setRecType(e.target.value)}
                className="aws-select w-full"
              >
                <option value="A">A - Routes traffic to IPv4 address</option>
                <option value="AAAA">AAAA - Routes traffic to IPv6 address</option>
                <option value="CNAME">CNAME - Routes traffic to another domain</option>
                <option value="TXT">TXT - Verification text / SPF</option>
                <option value="MX">MX - Routes mail to mail server</option>
                <option value="NS">NS - Name server record</option>
                <option value="PTR">PTR - Maps IP to domain name</option>
                <option value="SRV">SRV - Specifies location of services</option>
                <option value="CAA">CAA - Authorize Certificate Authorities</option>
              </select>
            </div>
          </div>

          {/* Record Values */}
          <div>
            <label className="block font-bold mb-1">
              Value / Route traffic to <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder={
                recType === 'A' ? 'e.g.\n198.51.100.1\n198.51.100.2' :
                recType === 'CNAME' ? 'e.g. target.example.com' :
                recType === 'MX' ? 'e.g. 10 mail.example.com' :
                'Enter record values (one per line)'
              }
              value={recValues}
              onChange={(e) => setRecValues(e.target.value)}
              rows={4}
              required
              className="aws-input font-mono resize-none"
            />
            <p className="text-[11px] text-aws-subtextLight dark:text-aws-subtextDark mt-1">
              Enter each value on a separate line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TTL */}
            <div>
              <label className="block font-bold mb-1">TTL (seconds)</label>
              <input
                type="number"
                value={recTtl}
                onChange={(e) => setRecTtl(Number(e.target.value))}
                min={1}
                className="aws-input font-mono"
              />
              <div className="flex space-x-2 mt-1">
                {[60, 300, 3600, 86400].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRecTtl(t)}
                    className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {t === 60 ? '1m' : t === 300 ? '5m' : t === 3600 ? '1h' : '1d'} ({t}s)
                  </button>
                ))}
              </div>
            </div>

            {/* Routing Policy */}
            <div>
              <label className="block font-bold mb-1">Routing policy</label>
              <select
                value={recRoutingPolicy}
                onChange={(e) => setRecRoutingPolicy(e.target.value)}
                className="aws-select w-full"
              >
                <option value="Simple">Simple routing</option>
                <option value="Weighted">Weighted routing</option>
                <option value="Latency">Latency routing</option>
                <option value="Failover">Failover routing</option>
                <option value="Geolocation">Geolocation routing</option>
                <option value="Multi-value answer">Multi-value answer</option>
              </select>
            </div>
          </div>

          {/* Conditional Weighted inputs */}
          {recRoutingPolicy === 'Weighted' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border">
              <div>
                <label className="block font-bold mb-1">Weight (0-255)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={recWeight || ''}
                  onChange={(e) => setRecWeight(Number(e.target.value))}
                  min={0}
                  max={255}
                  className="aws-input"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Record Set ID</label>
                <input
                  type="text"
                  placeholder="e.g. US-East-Production"
                  value={recSetId}
                  onChange={(e) => setRecSetId(e.target.value)}
                  className="aws-input"
                />
              </div>
            </div>
          )}
        </form>
      </AWSModal>

      {/* Delete Confirmation Modal */}
      <AWSModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete DNS records"
        maxWidth="md"
        footer={
          <>
            <button onClick={() => setDeleteModalOpen(false)} className="aws-btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeleteRecords} disabled={submitting} className="aws-btn-danger">
              {submitting ? 'Deleting...' : 'Delete records'}
            </button>
          </>
        }
      >
        <p className="font-semibold text-aws-textLight dark:text-aws-textDark">
          Are you sure you want to delete {selectedKeys.length} selected record(s)?
        </p>
        <p className="text-red-600 dark:text-red-400 text-xs">
          Deleting DNS records will stop traffic routing for those subdomains immediately.
        </p>
      </AWSModal>

      {/* BIND Zone File Import Modal */}
      <AWSModal
        isOpen={importBindOpen}
        onClose={() => setImportBindOpen(false)}
        title={`Import BIND zone file to ${zoneDetail?.name}`}
        maxWidth="xl"
        footer={
          <>
            <button onClick={() => setImportBindOpen(false)} className="aws-btn-secondary">
              Cancel
            </button>
            <button onClick={handleImportBind} disabled={submitting || !bindContent.trim()} className="aws-btn-primary">
              {submitting ? 'Importing...' : 'Import Records'}
            </button>
          </>
        }
      >
        <p className="text-xs text-aws-subtextLight dark:text-aws-subtextDark">
          Paste standard BIND zone file contents below (supports $ORIGIN, $TTL, IN A, CNAME, TXT, MX, NS, CAA).
        </p>
        <textarea
          placeholder={`$ORIGIN ${zoneDetail?.name}.\n$TTL 3600\n@ IN A 198.51.100.1\nwww IN CNAME ${zoneDetail?.name}.`}
          value={bindContent}
          onChange={(e) => setBindContent(e.target.value)}
          rows={10}
          className="aws-input font-mono resize-none"
        />
      </AWSModal>

      {/* Export Modal */}
      <AWSModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={`Export Hosted Zone: ${zoneDetail?.name}`}
        maxWidth="xl"
        footer={
          <>
            <button onClick={handleCopyExport} className="aws-btn-secondary flex items-center space-x-1">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <button onClick={() => setExportModalOpen(false)} className="aws-btn-primary">
              Done
            </button>
          </>
        }
      >
        <div className="flex space-x-2 mb-2 border-b border-aws-borderLight dark:border-aws-borderDark pb-2">
          <button
            onClick={() => handleOpenExport('bind')}
            className={`px-3 py-1 rounded text-xs font-bold ${exportFormat === 'bind' ? 'bg-aws-orange text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            BIND Format
          </button>
          <button
            onClick={() => handleOpenExport('json')}
            className={`px-3 py-1 rounded text-xs font-bold ${exportFormat === 'json' ? 'bg-aws-orange text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            JSON Format
          </button>
        </div>
        <textarea
          value={exportContent}
          readOnly
          rows={12}
          className="aws-input font-mono resize-none bg-gray-50 dark:bg-gray-900"
        />
      </AWSModal>
    </AWSPageContainer>
  );
}
