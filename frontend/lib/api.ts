import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  aws_account_id: string;
  username: string;
}

export interface HostedZone {
  id: string;
  name: string;
  type: string;
  comment?: string;
  vpc_id?: string;
  vpc_region?: string;
  record_count: number;
  created_at: string;
}

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: string;
  ttl: number;
  records: string[];
  routing_policy: string;
  weight?: number;
  set_identifier?: string;
  health_check_id?: string;
  created_at: string;
}

export interface HostedZoneDetail extends HostedZone {
  records: DNSRecord[];
}

// API functions
export const authApi = {
  login: async (username: string, password: string, aws_account_id?: string) => {
    const res = await api.post('/auth/login', { username, password, aws_account_id });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  }
};

export const zonesApi = {
  getAll: async (search?: string, zone_type?: string) => {
    const params: any = {};
    if (search) params.search = search;
    if (zone_type) params.zone_type = zone_type;
    const res = await api.get('/zones', { params });
    return res.data as HostedZone[];
  },
  create: async (data: { name: string; type: string; comment?: string; vpc_id?: string; vpc_region?: string }) => {
    const res = await api.post('/zones', data);
    return res.data as HostedZone;
  },
  getById: async (zoneId: string) => {
    const res = await api.get(`/zones/${zoneId}`);
    return res.data as HostedZoneDetail;
  },
  update: async (zoneId: string, data: { comment?: string }) => {
    const res = await api.put(`/zones/${zoneId}`, data);
    return res.data as HostedZone;
  },
  delete: async (zoneId: string) => {
    const res = await api.delete(`/zones/${zoneId}`);
    return res.data;
  },
  exportBind: async (zoneId: string) => {
    const res = await api.get(`/zones/${zoneId}/export/bind`, { responseType: 'text' });
    return res.data as string;
  },
  exportJson: async (zoneId: string) => {
    const res = await api.get(`/zones/${zoneId}/export/json`);
    return res.data;
  }
};

export const recordsApi = {
  getByZone: async (zoneId: string, search?: string, record_type?: string) => {
    const params: any = {};
    if (search) params.search = search;
    if (record_type) params.record_type = record_type;
    const res = await api.get(`/zones/${zoneId}/records`, { params });
    return res.data as DNSRecord[];
  },
  create: async (zoneId: string, data: { name: string; type: string; ttl: number; records: string[]; routing_policy: string; weight?: number; set_identifier?: string }) => {
    const res = await api.post(`/zones/${zoneId}/records`, data);
    return res.data as DNSRecord;
  },
  update: async (recordId: string, data: Partial<DNSRecord>) => {
    const res = await api.put(`/records/${recordId}`, data);
    return res.data as DNSRecord;
  },
  delete: async (recordId: string) => {
    const res = await api.delete(`/records/${recordId}`);
    return res.data;
  },
  bulkDelete: async (recordIds: string[]) => {
    const res = await api.post('/records/bulk-delete', { record_ids: recordIds });
    return res.data;
  },
  importBind: async (zoneId: string, zoneContent: string) => {
    const res = await api.post(`/zones/${zoneId}/import/bind`, { zone_content: zoneContent });
    return res.data;
  }
};
