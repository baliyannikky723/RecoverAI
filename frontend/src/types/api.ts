export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type TransactionStatusEnum =
  | 'FAILED'
  | 'AT_RISK'
  | 'RECOVERING'
  | 'RECOVERED'
  | 'ESCALATED'
  | 'STOPPED';

export type RiskLevelEnum = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecoveryPriorityEnum = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FailureReasonEnum =
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_EXPIRED'
  | 'BANK_DECLINED'
  | 'NETWORK_ERROR'
  | 'LIMIT_EXCEEDED'
  | 'AUTHENTICATION_FAILED'
  | 'UNKNOWN';

export type PaymentAttemptStatusEnum = 'SUCCESS' | 'FAILED' | 'PENDING';

export type RecoveryActionTypeEnum =
  | 'RETRY_PAYMENT'
  | 'SEND_PAYMENT_LINK'
  | 'REQUEST_PAYMENT_METHOD_UPDATE'
  | 'SEND_REMINDER'
  | 'ESCALATE_TO_HUMAN'
  | 'STOP_RECOVERY';

export type RecoveryActionStatusEnum =
  | 'PENDING'
  | 'APPROVED'
  | 'EXECUTED'
  | 'FAILED'
  | 'CANCELLED'
  | 'HUMAN_REVIEW';

export interface CustomerSummaryDto {
  id: string;
  name: string;
  email: string;
  lifetimeValue: number;
  successfulPaymentCount: number;
  failedPaymentCount: number;
  reliabilityScore: number;
  createdAt: string;
}

export interface CustomerDetailDto extends CustomerSummaryDto {
  transactionHistory: TransactionSummaryDto[];
}

export interface PaymentAttemptDto {
  id: string;
  attemptNumber: number;
  status: PaymentAttemptStatusEnum;
  failureReason?: string;
  attemptedAt: string;
}

export interface RecoveryActionDto {
  id: string;
  transactionId: string;
  customerName: string;
  amount: number;
  currency: string;
  actionType: RecoveryActionTypeEnum;
  confidence: number;
  expectedRecoveryAmount: number;
  status: RecoveryActionStatusEnum;
  reason: string;
  createdAt: string;
  executedAt?: string;
}

export interface AuditLogDto {
  id: string;
  transactionId?: string;
  eventType: string;
  actor: string;
  decision?: string;
  action?: string;
  result?: string;
  reason?: string;
  timestamp: string;
}

export interface TransactionSummaryDto {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: TransactionStatusEnum;
  failureReason: FailureReasonEnum;
  riskLevel: RiskLevelEnum;
  recoveryPriority: RecoveryPriorityEnum;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetailDto {
  id: string;
  transactionId: string;
  customer: CustomerSummaryDto;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: TransactionStatusEnum;
  failureReason: FailureReasonEnum;
  riskLevel: RiskLevelEnum;
  recoveryPriority: RecoveryPriorityEnum;
  createdAt: string;
  updatedAt: string;
  paymentAttempts: PaymentAttemptDto[];
  recoveryActions: RecoveryActionDto[];
  auditLogs: AuditLogDto[];
}

export interface DashboardSummaryDto {
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
  transactionsAtRisk: number;
  revenueOverview: {
    month: string;
    atRisk: number;
    recovered: number;
    baseline: number;
  }[];
  recoveryByAction: {
    action: string;
    recoveredAmount: number;
    count: number;
    successRate: number;
  }[];
  failureReasonDistribution: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  highPriorityTransactions: TransactionSummaryDto[];
}

export interface AnalyticsSummaryDto {
  revenueAtRisk: number;
  revenueRecovered: number;
  recoveryRate: number;
  averageRecoveryTimeHours: number;
  totalInvoices: number;
}

export interface RecoveryComparisonDto {
  baselineRevenue: number;
  recoverAiRevenue: number;
  improvementPercentage: number;
  baselineRate: number;
  recoverAiRate: number;
  netGain: number;
  additionalRecoveredInvoices: number;
}
