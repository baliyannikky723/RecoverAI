import { useQuery } from '@tanstack/react-query';
import { recoveryApi, GetRecoveryParams } from '@/services/api/recoveryApi';
import { PageResponse, RecoveryActionDto } from '@/types/api';

export const useRecoveryActions = (params: GetRecoveryParams) => {
  return useQuery<PageResponse<RecoveryActionDto>, Error>({
    queryKey: ['recovery', params],
    queryFn: () => recoveryApi.getActions(params),
  });
};

export const useRecoveryActionDetail = (id?: string) => {
  return useQuery<RecoveryActionDto, Error>({
    queryKey: ['recovery-action', id],
    queryFn: () => recoveryApi.getActionById(id!),
    enabled: Boolean(id),
  });
};
