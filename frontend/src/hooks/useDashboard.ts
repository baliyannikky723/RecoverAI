import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api/dashboardApi';
import { DashboardSummaryDto } from '@/types/api';

export const useDashboardSummary = () => {
  return useQuery<DashboardSummaryDto, Error>({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });
};
