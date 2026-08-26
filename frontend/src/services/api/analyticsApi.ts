import { apiClient } from './client';
import { AnalyticsSummaryDto, RecoveryComparisonDto } from '@/types/api';

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummaryDto> => {
    const response = await apiClient.get<AnalyticsSummaryDto>('/api/analytics/summary');
    return response.data;
  },

  getComparison: async (): Promise<RecoveryComparisonDto> => {
    const response = await apiClient.get<RecoveryComparisonDto>('/api/analytics/recovery-comparison');
    return response.data;
  },
};
