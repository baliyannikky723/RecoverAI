export interface HealthDetails {
  javaVersion?: string;
  systemUptimeMillis?: number;
  memoryFreeBytes?: number;
  memoryTotalBytes?: number;
  [key: string]: unknown;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN' | string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  details?: HealthDetails;
}
