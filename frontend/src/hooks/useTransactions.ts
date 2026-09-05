import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi, GetTransactionsParams } from '@/services/api/transactionApi';
import { PageResponse, TransactionSummaryDto, TransactionDetailDto, AiDecisionDto } from '@/types/api';

export const useTransactions = (params: GetTransactionsParams) => {
  return useQuery<PageResponse<TransactionSummaryDto>, Error>({
    queryKey: ['transactions', params],
    queryFn: () => transactionApi.getTransactions(params),
  });
};

export const useTransactionDetail = (id?: string) => {
  return useQuery<TransactionDetailDto, Error>({
    queryKey: ['transaction', id],
    queryFn: () => transactionApi.getTransactionById(id!),
    enabled: Boolean(id),
  });
};

export const useGenerateAiDecision = () => {
  const queryClient = useQueryClient();
  return useMutation<AiDecisionDto, Error, string>({
    mutationFn: (id: string) => transactionApi.generateAiDecision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
    },
  });
};

export const useExecuteStrategy = () => {
  const queryClient = useQueryClient();
  return useMutation<TransactionDetailDto, Error, { id: string; decision: AiDecisionDto }>({
    mutationFn: ({ id, decision }) => transactionApi.executeStrategy(id, decision),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(['transaction', id], data);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
