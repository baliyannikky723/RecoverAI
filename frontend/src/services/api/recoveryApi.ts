import { apiClient } from './client';
import { PageResponse, RecoveryActionDto } from '@/types/api';

export interface GetRecoveryParams {
  status?: string;
  page?: number;
  size?: number;
}

export const recoveryApi = {
  getActions: async (params: GetRecoveryParams = {}): Promise<PageResponse<RecoveryActionDto>> => {
    const cleanParams: Record<string, string | number> = {};
    if (params.status && params.status !== 'All') cleanParams.status = params.status;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;

    const response = await apiClient.get<PageResponse<RecoveryActionDto>>('/api/recovery', {
      params: cleanParams,
    });
    return response.data;
  },

  getActionById: async (id: string): Promise<RecoveryActionDto> => {
    const response = await apiClient.get<RecoveryActionDto>(`/api/recovery/${id}`);
    return response.data;
  },
};
