import { apiClient } from './client';
import { DashboardSummaryDto } from '@/types/api';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryDto> => {
    const response = await apiClient.get<DashboardSummaryDto>('/api/dashboard/summary');
    return response.data;
  },
};
