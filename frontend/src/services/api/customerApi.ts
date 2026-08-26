import { apiClient } from './client';
import { CustomerDetailDto } from '@/types/api';

export const customerApi = {
  getCustomerById: async (id: string): Promise<CustomerDetailDto> => {
    const response = await apiClient.get<CustomerDetailDto>(`/api/customers/${id}`);
    return response.data;
  },
};
