export type TransactionStatus =
  | 'Failed'
  | 'At Risk'
  | 'Recovering'
  | 'Recovered'
  | 'Escalated'
  | 'Stopped';

export type RiskLevel = 'High' | 'Medium' | 'Low';

export type FailureReason =
  | 'Insufficient Funds'
  | 'Card Expired'
  | 'Bank Declined'
  | 'Network Error'
  | 'Limit Exceeded'
  | 'Authentication Failed';

export type RecoveryActionType =
  | 'Retry Payment'
  | 'Payment Link'
  | 'Payment Method Update'
  | 'Reminder'
  | 'Human Escalation';

export type RecoveryTabStatus =
  | 'Pending'
  | 'Approved'
  | 'Executed'
  | 'Failed'
  | 'Human Review';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lifetimeValue: number;
  totalTransactions: number;
  successfulTransactions: number;
  reliabilityScore: number; // e.g. 92%
}

export interface PaymentAttempt {
  id: string;
  attemptNumber: number;
  gateway: string;
  method: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  failureCode: string;
  failureReason: string;
}

export interface RiskAssessment {
  revenueAtRisk: number;
  riskLevel: RiskLevel;
  recoveryPriority: 'Critical' | 'High' | 'Medium' | 'Low';
  failureCategory: string;
  customerRiskScore: number;
}

export interface AIDecision {
  recommendedAction: string;
  actionType: RecoveryActionType;
  confidence: number; // 0-100
  expectedRecovery: number;
  suggestedSchedule: string;
  reason: string;
  guardrailStatus: 'Passed' | 'Review Needed';
}

export interface RecoveryTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'failure' | 'detection' | 'ai_decision' | 'action_queued' | 'recovered' | 'escalated';
}

export interface Transaction {
  id: string;
  customerId: string;
  customer: Customer;
  amount: number;
  currency: string;
  paymentMethod: string;
  failureReason: FailureReason;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  recoveryProbability: number; // percentage e.g. 87
  recommendedAction: string;
  actionType: RecoveryActionType;
  createdAt: string;
  updatedAt: string;
  attempts: PaymentAttempt[];
  riskAssessment: RiskAssessment;
  aiDecision: AIDecision;
  timeline: RecoveryTimelineEvent[];
}

export interface RecoveryOperationItem {
  id: string;
  transactionId: string;
  customerName: string;
  amount: number;
  currency: string;
  recommendedAction: string;
  actionType: RecoveryActionType;
  confidence: number;
  status: RecoveryTabStatus;
  createdAt: string;
  scheduledAt?: string;
  channel: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  transactionId: string;
  event: string;
  actor: 'SYSTEM' | 'AI_DECISION_ENGINE' | 'MERCHANT_ADMIN' | 'RECOVERY_BOT';
  decision: string;
  action: string;
  result: 'Success' | 'Queued' | 'Pending' | 'Flagged' | 'Declined';
  details?: string;
}

export interface OverviewMetrics {
  revenueAtRisk: string; // e.g. "₹18.4L"
  revenueRecovered: string; // e.g. "₹11.7L"
  recoveryRate: string; // e.g. "63.6%"
  transactionsAtRisk: string; // e.g. "3,284"
  avgRecoveryTime: string; // e.g. "4.2 hrs"
}
