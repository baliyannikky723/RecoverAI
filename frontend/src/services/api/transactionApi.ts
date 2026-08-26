import { apiClient } from './client';
import { PageResponse, TransactionSummaryDto, TransactionDetailDto } from '@/types/api';

export interface GetTransactionsParams {
  search?: string;
  status?: string;
  risk?: string;
  failureReason?: string;
  page?: number;
  size?: number;
}

export const transactionApi = {
  getTransactions: async (params: GetTransactionsParams = {}): Promise<PageResponse<TransactionSummaryDto>> => {
    const cleanParams: Record<string, string | number> = {};
    if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params.status && params.status !== 'All') cleanParams.status = params.status;
    if (params.risk && params.risk !== 'All') cleanParams.risk = params.risk;
    if (params.failureReason && params.failureReason !== 'All') cleanParams.failureReason = params.failureReason;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;

    const response = await apiClient.get<PageResponse<TransactionSummaryDto>>('/api/transactions', {
      params: cleanParams,
    });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<TransactionDetailDto> => {
    const response = await apiClient.get<TransactionDetailDto>(`/api/transactions/${id}`);
    return response.data;
  },
};
