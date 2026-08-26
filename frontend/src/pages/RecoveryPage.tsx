import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Eye,
  Zap,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { useRecoveryActions } from '@/hooks/useRecovery';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { cn } from '@/lib/utils';

const tabs: { label: string; value: string; icon: React.ElementType }[] = [
  { label: 'Pending', value: 'PENDING', icon: Clock },
  { label: 'Approved', value: 'APPROVED', icon: CheckCircle2 },
  { label: 'Executed', value: 'EXECUTED', icon: Zap },
  { label: 'Failed', value: 'FAILED', icon: AlertCircle },
  { label: 'Human Review', value: 'HUMAN_REVIEW', icon: Users },
];

export const RecoveryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch
  } = useRecoveryActions({
    status: activeTab,
    page: currentPage - 1,
    size: pageSize,
  });

  const operations = pagedData?.content || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Execution</Badge>;
      case 'APPROVED':
        return <Badge variant="info">Approved</Badge>;
      case 'EXECUTED':
        return <Badge variant="success">Executed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'HUMAN_REVIEW':
        return <Badge variant="purple">Human Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Recovery Operations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Server-managed recovery queue ({totalElements} items in this stage). Read-only execution queue.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info notice about read-only state */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            Autonomous execution engine and manual approval trigger will be enabled in <strong>Phase 4</strong>.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 uppercase">Phase 3 Read-Only</span>
      </div>

      {/* Error state */}
      {isError && (
        <ErrorAlert
          title="Failed to Load Recovery Queue"
          message={error?.message || 'Unable to fetch recovery queue from backend.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Operations Table */}
      <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Strategy</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Expected Recovery</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : operations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No actions found in this stage</p>
                    <p className="text-xs mt-1">Switch to another tab to view different recovery states.</p>
                  </td>
                </tr>
              ) : (
                operations.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      {op.transactionId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {op.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-100 font-semibold">
                      ₹{op.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-blue-400 font-medium">
                      {formatActionType(op.actionType)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-slate-200 font-medium">
                          {op.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-medium">
                      ₹{op.expectedRecoveryAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(op.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/transactions/${op.transactionId}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-blue-400 text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing{' '}
            <strong className="text-slate-200 font-mono">
              {operations.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-200 font-mono">
              {Math.min(currentPage * pageSize, totalElements)}
            </strong>{' '}
            of <strong className="text-slate-200 font-mono">{totalElements}</strong> operations
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1 || isLoading}
              className="h-8 border-slate-800 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            <span className="font-mono text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || isLoading}
              className="h-8 border-slate-800 hover:bg-slate-800 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
