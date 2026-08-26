import { apiClient } from './client';
import { PageResponse, AuditLogDto } from '@/types/api';

export interface GetAuditLogsParams {
  search?: string;
  actor?: string;
  event?: string;
  page?: number;
  size?: number;
}

export const auditApi = {
  getLogs: async (params: GetAuditLogsParams = {}): Promise<PageResponse<AuditLogDto>> => {
    const cleanParams: Record<string, string | number> = {};
    if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params.actor && params.actor !== 'All') cleanParams.actor = params.actor;
    if (params.event && params.event !== 'All') cleanParams.event = params.event;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;

    const response = await apiClient.get<PageResponse<AuditLogDto>>('/api/audit-logs', {
      params: cleanParams,
    });
    return response.data;
  },
};
