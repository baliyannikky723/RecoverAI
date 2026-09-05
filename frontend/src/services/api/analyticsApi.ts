import { apiClient } from './client';
import { 
  AnalyticsSummaryDto, 
  RecoveryComparisonDto,
  RecoveryPerformanceDto,
  AiVsBaselineComparisonDto 
} from '@/types/api';

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummaryDto> => {
    const response = await apiClient.get<AnalyticsSummaryDto>('/api/analytics/summary');
    return response.data;
  },

  getComparison: async (): Promise<RecoveryComparisonDto> => {
    const response = await apiClient.get<RecoveryComparisonDto>('/api/analytics/recovery-comparison');
    return response.data;
  },

  getRecoveryPerformance: async (): Promise<RecoveryPerformanceDto> => {
    const response = await apiClient.get<RecoveryPerformanceDto>('/api/analytics/recovery-performance');
    return response.data;
  },

  getAiVsBaseline: async (): Promise<AiVsBaselineComparisonDto> => {
    const response = await apiClient.get<AiVsBaselineComparisonDto>('/api/analytics/ai-vs-baseline');
    return response.data;
  },

  runSimulation: async (): Promise<AiVsBaselineComparisonDto> => {
    const response = await apiClient.post<AiVsBaselineComparisonDto>('/api/analytics/run-recovery-simulation');
    return response.data;
  },
};
