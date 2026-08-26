import { useQuery } from '@tanstack/react-query';
import { auditApi, GetAuditLogsParams } from '@/services/api/auditApi';
import { PageResponse, AuditLogDto } from '@/types/api';

export const useAuditLogs = (params: GetAuditLogsParams) => {
  return useQuery<PageResponse<AuditLogDto>, Error>({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.getLogs(params),
  });
};
