import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api/analyticsApi';
import { 
  AnalyticsSummaryDto, 
  RecoveryComparisonDto, 
  RecoveryPerformanceDto, 
  AiVsBaselineComparisonDto 
} from '@/types/api';

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

export const useRecoveryPerformance = () => {
  return useQuery<RecoveryPerformanceDto, Error>({
    queryKey: ['analytics', 'performance'],
    queryFn: analyticsApi.getRecoveryPerformance,
  });
};

export const useAiVsBaseline = () => {
  return useQuery<AiVsBaselineComparisonDto, Error>({
    queryKey: ['analytics', 'ai-vs-baseline'],
    queryFn: analyticsApi.getAiVsBaseline,
  });
};

export const useRunRecoverySimulation = () => {
  const queryClient = useQueryClient();
  return useMutation<AiVsBaselineComparisonDto, Error, void>({
    mutationFn: analyticsApi.runSimulation,
    onSuccess: (data) => {
      queryClient.setQueryData(['analytics', 'ai-vs-baseline'], data);
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
