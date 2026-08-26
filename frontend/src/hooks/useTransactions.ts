import { useQuery } from '@tanstack/react-query';
import { transactionApi, GetTransactionsParams } from '@/services/api/transactionApi';
import { PageResponse, TransactionSummaryDto, TransactionDetailDto } from '@/types/api';

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
