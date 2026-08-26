import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bot,
  UserCheck,
  Server,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const AuditLogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const pageSize = 10;

  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch
  } = useAuditLogs({
    search: searchTerm,
    actor: actorFilter !== 'All' ? actorFilter : undefined,
    event: eventFilter !== 'All' ? eventFilter : undefined,
    page: currentPage - 1,
    size: pageSize,
  });

  const logs = pagedData?.content || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 1;

  const getActorBadge = (actor: string) => {
    switch (actor.toUpperCase()) {
      case 'AI_DECISION_ENGINE':
      case 'DECISION_ENGINE':
        return (
          <Badge variant="purple" className="space-x-1 font-mono text-[10px]">
            <Bot className="w-3 h-3" />
            <span>DECISION ENGINE</span>
          </Badge>
        );
      case 'RECOVERY_BOT':
      case 'BOT':
        return (
          <Badge variant="info" className="space-x-1 font-mono text-[10px]">
            <Bot className="w-3 h-3" />
            <span>BOT EXECUTOR</span>
          </Badge>
        );
      case 'MERCHANT_ADMIN':
      case 'ADMIN':
        return (
          <Badge variant="warning" className="space-x-1 font-mono text-[10px]">
            <UserCheck className="w-3 h-3" />
            <span>MERCHANT ADMIN</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="space-x-1 font-mono text-[10px]">
            <Server className="w-3 h-3" />
            <span>{actor}</span>
          </Badge>
        );
    }
  };

  const getResultBadge = (result?: string) => {
    if (!result) return null;
    switch (result.toUpperCase()) {
      case 'SUCCESS':
      case 'RESOLVED':
        return <Badge variant="success">Success</Badge>;
      case 'QUEUED':
      case 'PENDING':
        return <Badge variant="warning">Queued</Badge>;
      case 'FLAGGED':
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'DECLINED':
        return <Badge variant="neutral">Declined</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      setFeedbackMessage('No audit records available to export.');
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    const headers = ['Timestamp', 'Event Type', 'Actor', 'Decision', 'Action', 'Result', 'Reason', 'Transaction ID'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.eventType}"`,
      `"${l.actor}"`,
      `"${l.decision || ''}"`,
      `"${l.action || ''}"`,
      `"${l.result || ''}"`,
      `"${l.reason || ''}"`,
      `"${l.transactionId || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recoverai_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedbackMessage(`Exported ${logs.length} audit logs to CSV file.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActorFilter('All');
    setEventFilter('All');
    setCurrentPage(1);
    setFeedbackMessage('Audit log filters have been reset.');
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const hasActiveFilters = searchTerm !== '' || actorFilter !== 'All' || eventFilter !== 'All';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Audit Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Complete database audit trail ({totalElements.toLocaleString()} recorded events) for decision traceability.
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
            <span>Export Trail</span>
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="text-xs h-9 border-slate-700 hover:bg-slate-800 text-slate-300 space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <ErrorAlert
          title="Failed to Load Audit Trail"
          message={error?.message || 'Unable to fetch audit records from backend.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Filters Bar */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search reason, decision, action..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Actor Filter */}
            <div>
              <select
                value={actorFilter}
                onChange={(e) => {
                  setActorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Actors</option>
                <option value="GATEWAY">Gateway</option>
                <option value="DECISION_ENGINE">Decision Engine</option>
                <option value="SYSTEM">System</option>
                <option value="MERCHANT_ADMIN">Merchant Admin</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <select
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="All">All Event Types</option>
                <option value="Payment Failed">Payment Failed</option>
                <option value="Recovery Planned">Recovery Planned</option>
                <option value="Action Executed">Action Executed</option>
                <option value="Human Review Escalation">Human Escalation</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Transaction</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Decision</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    <p className="text-sm font-medium">No audit events found</p>
                    <p className="text-xs mt-1">Try clearing your filters or changing search keywords.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-medium">
                      {log.transactionId ? (
                        <Link to={`/transactions/${log.transactionId}`} className="hover:underline">
                          {log.transactionId}
                        </Link>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans font-medium whitespace-nowrap">
                      {log.eventType}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {getActorBadge(log.actor)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {log.decision || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {log.action || '—'}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {getResultBadge(log.result)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans max-w-xs truncate" title={log.reason}>
                      {log.reason || '—'}
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
              {logs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-200 font-mono">
              {Math.min(currentPage * pageSize, totalElements)}
            </strong>{' '}
            of <strong className="text-slate-200 font-mono">{totalElements}</strong> audit logs
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
