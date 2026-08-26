import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '@/services/api/healthService';
import { HealthResponse } from '@/types/health';

export const useHealthStatus = () => {
  return useQuery<HealthResponse, Error>({
    queryKey: ['backendHealth'],
    queryFn: fetchHealthStatus,
    refetchInterval: 15000,
    retry: 2,
  });
};
