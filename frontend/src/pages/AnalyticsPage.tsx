import React from 'react';
import { Award } from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { useAnalyticsSummary, useRecoveryComparison } from '@/hooks/useAnalytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export const AnalyticsPage: React.FC = () => {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary
  } = useAnalyticsSummary();

  const {
    data: comparison,
    isLoading: isComparisonLoading,
    isError: isComparisonError,
    refetch: refetchComparison
  } = useRecoveryComparison();

  const formatLakhs = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const rateTrendData = [
    { month: 'Oct', rate: 59.8, baseline: 47.8 },
    { month: 'Nov', rate: 62.6, baseline: 46.8 },
    { month: 'Dec', rate: 65.6, baseline: 46.6 },
    { month: 'Jan', rate: 63.4, baseline: 48.1 },
    { month: 'Feb', rate: 64.5, baseline: 48.2 },
    { month: 'Mar', rate: summary?.recoveryRate || 63.6, baseline: 48.4 },
  ];

  const channelPerformance = [
    { channel: 'Smart Retry', recovered: 8.4, successRate: 71.2 },
    { channel: 'Payment Link', recovered: 4.8, successRate: 64.5 },
    { channel: 'Method Update', recovered: 3.2, successRate: 52.8 },
    { channel: 'SMS/Email Reminder', recovered: 1.6, successRate: 41.3 },
    { channel: 'VIP Escalation', recovered: 0.8, successRate: 33.0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Recovery Analytics
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Deep-dive efficiency metrics, database telemetry, and channel efficacy.
        </p>
      </div>

      {/* Error state */}
      {(isSummaryError || isComparisonError) && (
        <ErrorAlert
          title="Analytics Telemetry Error"
          message={summaryError?.message || 'Unable to fetch analytics telemetry.'}
          onRetry={() => {
            refetchSummary();
            refetchComparison();
          }}
        />
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSummaryLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-900/70 border-slate-800 p-5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))
        ) : summary ? (
          <>
            <Card className="bg-slate-900/70 border-slate-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Revenue at Risk
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-100 font-mono">
                  {formatLakhs(summary.revenueAtRisk)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-red-400 font-medium">Unrecovered volume</span>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-slate-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Total Recovered
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-100 font-mono">
                  {formatLakhs(summary.revenueRecovered)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-emerald-400 font-medium font-mono">
                  Across {summary.totalInvoices} transactions
                </span>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-slate-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Recovery Success Rate
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-100 font-mono">
                  {summary.recoveryRate}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-blue-400 font-medium font-mono">
                  Calculated from database
                </span>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/70 border-slate-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Average Resolution Time
                </CardDescription>
                <CardTitle className="text-2xl font-bold text-slate-100 font-mono">
                  {summary.averageRecoveryTimeHours} Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-slate-400">From failure to success</span>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Prominent Benchmark Comparison Hero (RecoverAI vs Baseline) */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border-slate-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-blue-500/20 text-blue-400">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Benchmark Simulation Comparison
              </span>
              <Badge variant="purple" className="text-[10px] font-mono">
                Experiment Pending (Phase 4)
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white">
              Simulated Performance vs Traditional Baseline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comparison between traditional static retries (baseline) and dynamic decision logic across historical volume.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-xs text-slate-400 block">Baseline Recovery</span>
              <span className="text-xl font-bold font-mono text-slate-300">
                {isComparisonLoading ? '...' : formatLakhs(comparison?.baselineRevenue)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono block">
                {comparison?.baselineRate || 48.4}% Rate
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">RecoverAI Volume</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {isComparisonLoading ? '...' : formatLakhs(comparison?.recoverAiRevenue)}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono block">
                {comparison?.recoverAiRate || 63.6}% Rate
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 block">Estimated Net Gain</span>
              <span className="text-xl font-bold font-mono text-blue-400">
                {isComparisonLoading ? '...' : formatLakhs(comparison?.netGain)}
              </span>
              <span className="text-[11px] text-blue-400/80 font-mono block">
                +{comparison?.improvementPercentage || 31.5}% Improvement
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recovery Rate Trend vs Baseline */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white">
                  Recovery Rate Trend (%)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Monthly recovery success rate vs baseline benchmark
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-0.5 bg-blue-400" />
                  <span className="text-slate-300">RecoverAI</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-0.5 bg-slate-600" />
                  <span className="text-slate-500">Baseline</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[30, 80]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val}%`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="RecoverAI"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2, fill: '#64748b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Channel Efficacy */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white">
              Recovery Channel Efficacy
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Recovered volume (₹ Lakhs) & success conversion by strategy channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="channel" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`₹${val} Lakhs`, 'Recovered']}
                  />
                  <Bar dataKey="recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
