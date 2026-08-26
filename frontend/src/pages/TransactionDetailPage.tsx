import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  User,
  CreditCard,
  History
} from 'lucide-react';
import { useTransactionDetail } from '@/hooks/useTransactions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: transaction, isLoading, isError, error, refetch } = useTransactionDetail(id);

  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  const handleApprove = () => {
    setApprovalFeedback('Action Approved: Recovery strategy is queued for simulation.');
    setTimeout(() => setApprovalFeedback(null), 4000);
  };

  const handleReject = () => {
    setApprovalFeedback('Action Rejected: Transaction moved to human review queue.');
    setTimeout(() => setApprovalFeedback(null), 4000);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'RECOVERED':
      case 'Recovered':
        return <Badge variant="success">Recovered</Badge>;
      case 'AT_RISK':
      case 'At Risk':
        return <Badge variant="warning">At Risk</Badge>;
      case 'RECOVERING':
      case 'Recovering':
        return <Badge variant="info">Recovering</Badge>;
      case 'FAILED':
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'ESCALATED':
      case 'Escalated':
        return <Badge variant="purple">Escalated</Badge>;
      case 'STOPPED':
      case 'Stopped':
        return <Badge variant="neutral">Stopped</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'HIGH':
      case 'High':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'MEDIUM':
      case 'Medium':
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

  const primaryAction = transaction.recoveryActions?.[0];

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

        <div className="flex flex-col sm:items-end">
          <span className="text-xs text-slate-400 font-medium">Transaction Amount</span>
          <span className="text-3xl font-extrabold font-mono text-white">
            ₹{transaction.amount.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Currency: {transaction.currency}</span>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {approvalFeedback && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{approvalFeedback}</span>
          </div>
          <span className="text-[10px] text-blue-400/70 uppercase tracking-widest font-mono">Read-Only Mode</span>
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
                      <span>AI Decision Recommendation</span>
                      <Badge variant="purple" className="text-[10px] font-mono">
                        Coming in Phase 4
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Recommended strategy generated based on decline code & customer LTV
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Recommendation summary box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Strategy:</span>
                    <strong className="text-xs font-semibold text-blue-400">
                      {formatActionType(primaryAction?.actionType)}
                    </strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Confidence:</span>
                    <Badge variant="success" className="font-mono text-xs">
                      {primaryAction?.confidence || 82}% Confidence
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-xs text-slate-300">
                  <span className="text-slate-400 block mb-1 font-medium">Strategic Reasoning:</span>
                  {primaryAction?.reason || 'Soft decline pattern detected. Expected recovery rate improves significantly within the optimal time window.'}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block">Expected Recovery</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ₹{primaryAction?.expectedRecoveryAmount?.toLocaleString() || transaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Optimal Execution Window</span>
                    <span className="font-mono text-slate-300">+24 Hours (Next Day 10:30 AM)</span>
                  </div>
                </div>
              </div>

              {/* Action Approval Controls (Read-Only) */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleApprove}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Strategy</span>
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-9"
                  >
                    <span>Reject / Manual</span>
                  </Button>
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  Autonomous execution inactive
                </span>
              </div>
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
