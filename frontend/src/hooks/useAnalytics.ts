import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api/analyticsApi';
import { AnalyticsSummaryDto, RecoveryComparisonDto } from '@/types/api';

export const useAnalyticsSummary = () => {
  return useQuery<AnalyticsSummaryDto, Error>({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.getSummary,
  });
};

export const useRecoveryComparison = () => {
  return useQuery<RecoveryComparisonDto, Error>({
    queryKey: ['analytics', 'comparison'],
    queryFn: analyticsApi.getComparison,
  });
};
