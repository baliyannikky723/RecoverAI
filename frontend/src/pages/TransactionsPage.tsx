import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [reasonFilter, setReasonFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const pageSize = 10;

  // Live TanStack Query hook with server-side filtering and pagination
  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch
  } = useTransactions({
    search: searchTerm,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    risk: riskFilter !== 'All' ? riskFilter : undefined,
    failureReason: reasonFilter !== 'All' ? reasonFilter : undefined,
    page: currentPage - 1,
    size: pageSize,
  });

  const transactions = pagedData?.content || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 1;

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'All' ||
    riskFilter !== 'All' ||
    reasonFilter !== 'All';

  const getStatusBadge = (status: string) => {
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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'MEDIUM':
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="success">Low</Badge>;
    }
  };

  const formatReasonEnum = (reason: string) => {
    if (!reason) return '—';
    return reason
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setRiskFilter('All');
    setReasonFilter('All');
    setCurrentPage(1);
    setFeedbackMessage('All filters and search queries have been reset.');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      setFeedbackMessage('No transactions available to export.');
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    const headers = [
      'Transaction ID',
      'Customer Name',
      'Customer Email',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Failure Reason',
      'Risk Level',
      'Priority',
      'Created At'
    ];

    const rows = transactions.map((t) => [
      `"${t.transactionId}"`,
      `"${t.customerName}"`,
      `"${t.customerEmail}"`,
      t.amount,
      `"${t.currency}"`,
      `"${t.paymentMethod}"`,
      `"${t.status}"`,
      `"${t.failureReason}"`,
      `"${t.riskLevel}"`,
      `"${t.recoveryPriority}"`,
      `"${t.createdAt}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `recoverai_transactions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedbackMessage(
      `Exported ${transactions.length} transaction records to CSV file.`
    );
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Transactions
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Server-side search & filtering across {totalElements.toLocaleString()} database transactions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs h-9 border-slate-700 hover:bg-slate-800 text-slate-300 space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="text-xs h-9 border-slate-700 hover:bg-slate-800 text-slate-300 space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Success / Feedback Toast Notification */}
      {feedbackMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <ErrorAlert
          title="Failed to Load Transactions"
          message={error?.message || 'Unable to fetch transactions from the server.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search transaction, customer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="FAILED">Failed</option>
                <option value="AT_RISK">At Risk</option>
                <option value="RECOVERING">Recovering</option>
                <option value="RECOVERED">Recovered</option>
                <option value="ESCALATED">Escalated</option>
                <option value="STOPPED">Stopped</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <div>
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            {/* Failure Reason Filter */}
            <div>
              <select
                value={reasonFilter}
                onChange={(e) => {
                  setReasonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Failure Reasons</option>
                <option value="INSUFFICIENT_FUNDS">Insufficient Funds</option>
                <option value="CARD_EXPIRED">Card Expired</option>
                <option value="BANK_DECLINED">Bank Declined</option>
                <option value="NETWORK_ERROR">Network Error</option>
                <option value="LIMIT_EXCEEDED">Limit Exceeded</option>
                <option value="AUTHENTICATION_FAILED">Authentication Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Transactions Table */}
      <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No transactions found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or active filters.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                      {txn.transactionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-medium text-slate-200">
                          {txn.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {txn.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-100 font-semibold">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {txn.paymentMethod || 'Credit Card / UPI'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {formatReasonEnum(txn.failureReason)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getRiskBadge(txn.riskLevel)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(txn.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/transactions/${txn.transactionId}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-blue-400 text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Review</span>
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
              {transactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-200 font-mono">
              {Math.min(currentPage * pageSize, totalElements)}
            </strong>{' '}
            of <strong className="text-slate-200 font-mono">{totalElements}</strong> transactions
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
