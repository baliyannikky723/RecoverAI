import { apiClient } from './client';

export interface DemoRequest {
  email: string;
  name?: string;
  company?: string;
  message?: string;
}

export interface DemoResponse {
  success: boolean;
  isLiveSent: boolean;
  recipient: string;
  provider: string;
  message: string;
  timestamp: string;
}

export const contactApi = {
  submitDemoRequest: async (data: DemoRequest): Promise<DemoResponse> => {
    const response = await apiClient.post<DemoResponse>('/api/contact/demo', data);
    return response.data;
  },
};
