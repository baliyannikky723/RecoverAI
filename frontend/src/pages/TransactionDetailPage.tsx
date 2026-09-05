import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  User,
  CreditCard,
  History,
  AlertTriangle
} from 'lucide-react';
import { useTransactionDetail, useGenerateAiDecision, useExecuteStrategy } from '@/hooks/useTransactions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { AiDecisionDto } from '@/types/api';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: transaction, isLoading, isError, error, refetch } = useTransactionDetail(id);
  const generateAiDecisionMutation = useGenerateAiDecision();
  const executeStrategyMutation = useExecuteStrategy();

  const [aiDecision, setAiDecision] = useState<AiDecisionDto | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Reset AI state when navigating to a different transaction
  React.useEffect(() => {
    setAiDecision(null);
    setAiError(null);
    setApprovalFeedback(null);
  }, [id]);

  // Auto-hydrate AI state from pending action when transaction data loads
  React.useEffect(() => {
    if (transaction && transaction.recoveryActions) {
      const pending = transaction.recoveryActions.find(a => a.status === 'PENDING');
      if (pending) {
        setAiDecision({
          action: pending.actionType,
          confidence: pending.confidence,
          reason: pending.reason,
          expectedRecoveryAmount: pending.expectedRecoveryAmount,
          retryAfterHours: 0, // Not stored in RecoveryAction, use default
          riskLevel: transaction.riskLevel,
          decisionId: pending.id,
          transactionId: transaction.transactionId
        });
      }
    }
  }, [transaction]);

  const handleGenerateAiDecision = () => {
    setAiError(null);
    generateAiDecisionMutation.mutate(id!, {
      onSuccess: (data) => {
        setAiDecision(data);
        refetch(); // Invalidate and reload to fetch updated audit logs
      },
      onError: () => {
        setAiError("AI decision engine is currently unavailable. The transaction remains unchanged.");
      }
    });
  };

  const handleApprove = () => {
    if (!id || !aiDecision) return;
    executeStrategyMutation.mutate(
      { id: id, decision: aiDecision },
      {
        onSuccess: () => {
          setApprovalFeedback(`Strategy approved! Executing recovery pipeline action: ${formatActionType(aiDecision.action)}`);
          setTimeout(() => setApprovalFeedback(null), 5000);
        },
        onError: (err: any) => {
          setApprovalFeedback(`Error executing strategy: ${err.message}`);
          setTimeout(() => setApprovalFeedback(null), 5000);
        }
      }
    );
  };

  const handleReject = () => {
    if (!id || !transaction) return;
    const manualDecision: AiDecisionDto = {
      action: 'ESCALATE_TO_HUMAN',
      confidence: 1.0,
      reason: 'Transaction manually rejected by Merchant Admin. Escalating to VIP support queue.',
      expectedRecoveryAmount: transaction.amount,
      retryAfterHours: 0,
      riskLevel: 'HIGH',
      transactionId: transaction.transactionId
    };
    executeStrategyMutation.mutate(
      { id: id, decision: manualDecision },
      {
        onSuccess: () => {
          setApprovalFeedback('Action Rejected: Transaction status escalated to VIP support queue.');
          setTimeout(() => setApprovalFeedback(null), 5000);
        },
        onError: (err: any) => {
          setApprovalFeedback(`Error rejecting strategy: ${err.message}`);
          setTimeout(() => setApprovalFeedback(null), 5000);
        }
      }
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'RECOVERED':
        return <Badge variant="success">RECOVERED</Badge>;
      case 'AT_RISK':
        return <Badge variant="warning">AT_RISK</Badge>;
      case 'RECOVERING':
        return <Badge variant="info">RECOVERING</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">FAILED</Badge>;
      case 'ESCALATED':
        return <Badge variant="purple">ESCALATED</Badge>;
      case 'STOPPED':
        return <Badge variant="neutral">STOPPED</Badge>;
      default:
        return <Badge variant="secondary">{status || 'UNKNOWN'}</Badge>;
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'HIGH':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="success">Low</Badge>;
    }
  };

  const formatReasonEnum = (reason?: string) => {
    if (!reason) return 'Generic Decline';
    return reason
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatActionType = (type?: string) => {
    if (!type) return 'Smart Retry Payment';
    return type
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Link to="/transactions" className="hover:text-slate-200 text-xs text-slate-400 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Transactions</span>
        </Link>
        <ErrorAlert
          title="Transaction Not Found"
          message={error?.message || `Unable to locate transaction with ID: ${id}.`}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const hasBeenAnalyzed = aiDecision !== null;
  const executedActions = transaction.recoveryActions?.filter(a => a.status === 'EXECUTED' || a.status === 'FAILED');
  const hasExecutedAction = executedActions && executedActions.length > 0;
  const latestExecutedAction = hasExecutedAction ? executedActions[0] : null;
  const isRecovered = transaction.status === 'RECOVERED';
  const actualRecoveredAmount = isRecovered ? transaction.amount : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link to="/transactions" className="hover:text-slate-200 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Transactions</span>
          </Link>
          <span>/</span>
          <span className="font-mono text-slate-200 font-medium">{transaction.transactionId}</span>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusBadge(transaction.status)}
          <span className="text-xs text-slate-500 font-mono">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold font-mono text-white">
              {transaction.transactionId}
            </h2>
            <Badge variant="purple" className="font-mono text-xs">
              {formatReasonEnum(transaction.failureReason)}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Customer: <strong className="text-slate-200">{transaction.customer.name}</strong> ({transaction.customer.email})
          </p>
        </div>

        <div className="flex flex-col sm:items-end space-y-2">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 font-medium">Transaction Amount</span>
            <span className="text-3xl font-extrabold font-mono text-white">
              ₹{transaction.amount.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Currency: {transaction.currency}</span>
          </div>
          
          <Button 
            onClick={() => {
              fetch('/api/webhooks/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'payment.failed',
                  payload: {
                    payment: {
                      entity: {
                        id: transaction.transactionId,
                        amount: transaction.amount * 100, // INR in paise
                        currency: transaction.currency,
                        status: 'failed',
                        error_code: 'BAD_REQUEST_ERROR',
                        error_description: 'Payment failed due to simulated webhook'
                      }
                    }
                  }
                })
              }).then(res => res.json())
                .then(data => {
                  setApprovalFeedback('Webhook Simulation Triggered Successfully!');
                  setTimeout(() => setApprovalFeedback(null), 5000);
                  refetch();
                });
            }}
            size="sm" 
            variant="outline" 
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-[10px] h-7"
          >
            <Zap className="w-3 h-3 mr-1" /> Simulate Webhook
          </Button>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {approvalFeedback && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{approvalFeedback}</span>
          </div>
        </div>
      )}

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: AI Decision Engine Card & Payment History */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recovery Recommendation Card */}
          <Card className="bg-slate-900/70 border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <span>Transaction AI Analysis</span>
                      {!hasBeenAnalyzed && !hasExecutedAction && (
                        <Badge variant="neutral" className="text-[10px] font-mono">
                          NOT_ANALYZED
                        </Badge>
                      )}
                      {generateAiDecisionMutation.isPending && (
                        <Badge variant="info" className="text-[10px] font-mono">
                          ANALYZING
                        </Badge>
                      )}
                      {hasBeenAnalyzed && !hasExecutedAction && (
                        <Badge variant="purple" className="text-[10px] font-mono">
                          ANALYZED
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Transaction-level contextual recovery strategy and guardrail execution
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {aiError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-xs">
                  {aiError}
                </div>
              )}

              {hasExecutedAction ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Execution Status:</span>
                        <strong className="text-xs font-semibold text-emerald-400 uppercase font-mono">
                          {transaction.status}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-xs text-slate-300 space-y-2">
                      <div>
                        <span className="text-slate-400 block mb-0.5 font-medium">Executed Action Type:</span>
                        <strong className="text-blue-400 font-mono text-xs block">
                          {formatActionType(latestExecutedAction?.actionType)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5 font-medium">Reasoning & Outcome:</span>
                        <p className="leading-relaxed text-slate-300">{latestExecutedAction?.reason}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 border-l-4 border-l-blue-500">
                        <span className="text-slate-500 block mb-1">Expected Recovery (AI)</span>
                        <span className="font-mono font-semibold text-blue-400 text-sm">
                          ₹{latestExecutedAction?.expectedRecoveryAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className={`p-3 bg-slate-900 rounded-lg border border-slate-800 border-l-4 ${isRecovered ? 'border-l-emerald-500' : 'border-l-slate-600'}`}>
                        <span className="text-slate-500 block mb-1">Actual Recovered</span>
                        <span className={`font-mono font-semibold text-sm ${isRecovered ? 'text-emerald-400' : 'text-slate-400'}`}>
                          ₹{actualRecoveredAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-right">
                       <span className="text-slate-500 block text-[10px] font-mono">
                          Executed At: {new Date(latestExecutedAction?.executedAt || latestExecutedAction?.createdAt || new Date()).toLocaleString()}
                        </span>
                    </div>
                  </div>
                </div>
              ) : generateAiDecisionMutation.isPending ? (
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-10 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-slate-300">Analyzing transaction context...</span>
                </div>
              ) : hasBeenAnalyzed ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Recommended Action:</span>
                        <strong className="text-xs font-semibold text-blue-400 font-mono">
                          {formatActionType(aiDecision.action)}
                        </strong>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Confidence:</span>
                        <Badge variant={aiDecision.confidence >= 0.55 ? "success" : "warning"} className="font-mono text-xs">
                          {Math.round(aiDecision.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-400 block mb-1 font-medium">Strategic Reasoning:</span>
                      {aiDecision.reason}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-slate-500 block">Expected Recovery</span>
                        <span className="font-mono font-semibold text-blue-400">
                          ₹{aiDecision.expectedRecoveryAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Optimal Execution Window</span>
                        <span className="font-mono text-slate-300">
                          {aiDecision.retryAfterHours > 0
                            ? `+${aiDecision.retryAfterHours} Hours`
                            : 'Immediate Action'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <span className="text-xs text-slate-400 font-medium">Guardrail Policy Status:</span>
                      {aiDecision.guardrailRejected ? (
                        <div className="flex items-center space-x-1.5 text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold tracking-wide">REJECTED / OVERRIDDEN</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold tracking-wide">APPROVED</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Approval Controls */}
                  <div className="flex items-center space-x-3 pt-2">
                    <Button
                      onClick={handleApprove}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 space-x-1.5 w-full sm:w-auto px-6"
                      disabled={executeStrategyMutation.isPending}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{executeStrategyMutation.isPending ? 'Executing...' : 'Approve Strategy'}</span>
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-9 w-full sm:w-auto px-6"
                      disabled={executeStrategyMutation.isPending}
                    >
                      <span>Reject & Escalate</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-10 flex flex-col items-center justify-center space-y-4">
                  <p className="text-sm font-medium text-slate-300 text-center">
                    AI analysis has not been run yet.
                  </p>
                  <p className="text-xs text-slate-500 text-center max-w-sm pb-2">
                    Run the engine to extract context from failure reasons, LTV, and historical attempts to recommend the optimal recovery strategy.
                  </p>
                  <Button
                    onClick={handleGenerateAiDecision}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs space-x-1.5 px-6 h-10 shadow-lg shadow-blue-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-semibold tracking-wide">Analyze with RecoverAI</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Attempt History Table */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payment Attempt History ({transaction.paymentAttempts?.length || 0})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Attempt #</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Failure Reason</th>
                      <th className="py-2.5 px-4 text-right">Attempted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transaction.paymentAttempts?.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-200">
                          Attempt #{attempt.attemptNumber}
                        </td>
                        <td className="py-2.5 px-4">
                          {attempt.status === 'SUCCESS' ? (
                            <Badge variant="success">Success</Badge>
                          ) : (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">
                          {formatReasonEnum(attempt.failureReason)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                          {new Date(attempt.attemptedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer Profile & Risk Assessment */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Customer Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-100 text-sm">
                  {transaction.customer.name}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {transaction.customer.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Lifetime Spending</span>
                  <span className="font-mono font-semibold text-slate-100">
                    ₹{transaction.customer.lifetimeValue.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Reliability Score</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {transaction.customer.reliabilityScore}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Successful Payments</span>
                  <span className="font-mono text-slate-300">
                    {transaction.customer.successfulPaymentCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Failed Payments</span>
                  <span className="font-mono text-red-400">
                    {transaction.customer.failedPaymentCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Information Card */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Risk Level</span>
                {getRiskBadge(transaction.riskLevel)}
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Recovery Priority</span>
                <span className="font-mono text-slate-200 font-medium">
                  {transaction.recoveryPriority}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Payment Channel</span>
                <span className="font-mono text-slate-300">
                  {transaction.paymentMethod || 'Credit Card / AutoPay'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Revenue at Risk</span>
                <span className="font-mono font-semibold text-red-400">
                  ₹{transaction.amount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Timeline / Linked Audit Logs */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>Recovery Event Trail</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transaction.auditLogs && transaction.auditLogs.length > 0 ? (
                <div className="space-y-3 text-xs">
                  {transaction.auditLogs.map((log) => (
                    <div key={log.id} className="relative pl-4 border-l border-slate-800 space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-200">{log.eventType}</span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{log.decision || log.action}</p>
                      <span className="text-[10px] font-mono text-blue-400">Actor: {log.actor}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No linked audit entries recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
