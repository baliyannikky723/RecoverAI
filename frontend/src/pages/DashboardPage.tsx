import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowUpRight,
  ArrowRight,
  Zap,
  Calendar,
  RotateCcw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

const FAILURE_COLORS = [
  '#f87171', // Red
  '#fb923c', // Orange
  '#fbbf24', // Amber
  '#38bdf8', // Light Blue
  '#a855f7', // Purple
  '#94a3b8', // Slate
  '#ec4899', // Pink
];

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const { data: summary, isLoading, isError, error, refetch } = useDashboardSummary();

  const getRiskBadge = (risk: string) => {
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

  const formatLakhs = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const formatReasonEnum = (reason: string) => {
    return reason
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Production SaaS Time Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Revenue Recovery
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Live database telemetry: at-risk revenue and recovery performance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Production Fintech Date Range Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 space-x-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="month" className="bg-slate-900 text-slate-200">This Month (Mar 2026)</option>
              <option value="30d" className="bg-slate-900 text-slate-200">Last 30 Days</option>
              <option value="7d" className="bg-slate-900 text-slate-200">Last 7 Days</option>
              <option value="90d" className="bg-slate-900 text-slate-200">Last 90 Days</option>
            </select>
          </div>

          {/* Contextual Action Chip */}
          <Link to="/recovery">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 border-slate-700 hover:bg-slate-800 text-slate-300 space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Queue</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px]">
                {summary?.highPriorityTransactions?.length || 7}
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <ErrorAlert
          title="Backend Connection Error"
          message={error?.message || 'Unable to fetch dashboard metrics from the Spring Boot API.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Loading Skeleton or KPI Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-900/70 border-slate-800 p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue at Risk */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Revenue at Risk
                </CardDescription>
                <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {formatLakhs(summary.revenueAtRisk)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-red-400 space-x-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Live database calculation</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Revenue Recovered */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Revenue Recovered
                </CardDescription>
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {formatLakhs(summary.revenueRecovered)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-emerald-400 space-x-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live recovered volume</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Recovery Rate */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Recovery Rate
                </CardDescription>
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {summary.recoveryRate}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-blue-400 space-x-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Computed across 1,000 txns</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Transactions at Risk */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium text-slate-400">
                  Transactions at Risk
                </CardDescription>
                <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {summary.transactionsAtRisk?.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-slate-400 space-x-1">
                <span>Avg recovery window: 3.8 hrs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Recovery Overview */}
        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-100">
                  Revenue Recovery Overview
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Monthly at-risk revenue vs successfully recovered volume (in Lakhs INR)
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4 text-xs font-medium">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-400/80" />
                  <span className="text-slate-400">At Risk</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span className="text-slate-300">Recovered</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : summary?.revenueOverview ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={summary.revenueOverview}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val}L`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`₹${value} Lakhs`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="atRisk"
                      name="Revenue at Risk"
                      stroke="#f87171"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAtRisk)"
                    />
                    <Area
                      type="monotone"
                      dataKey="recovered"
                      name="Recovered Volume"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRecovered)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Chart 2: Failure Reasons Distribution */}
        <Card className="bg-slate-900/70 border-slate-800 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-100">
              Failure Reasons
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Live breakdown across 1,000 payment attempts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : summary?.failureReasonDistribution ? (
              <>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.failureReasonDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="percentage"
                      >
                        {summary.failureReasonDistribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={FAILURE_COLORS[index % FAILURE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 text-xs">
                  {summary.failureReasonDistribution.slice(0, 4).map((item, idx) => (
                    <div key={item.reason} className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: FAILURE_COLORS[idx % FAILURE_COLORS.length] }}
                        />
                        <span className="text-slate-300">{item.reason}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {item.percentage}% ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Recovery by Action & High Priority Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery by Action */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-slate-100">
              Recovery by Action
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 mt-0.5">
              Live efficiency across recommended channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : summary?.recoveryByAction ? (
              <>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={summary.recoveryByAction}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                      <YAxis
                        dataKey="action"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={10}
                        width={120}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          fontSize: '12px',
                        }}
                        formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Expected Volume']}
                      />
                      <Bar dataKey="recoveredAmount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                  <span>Top Channel: <strong className="text-slate-200">Smart Retry Payment</strong></span>
                  <Link to="/analytics" className="text-blue-400 hover:underline flex items-center gap-1">
                    <span>View deep-dive</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* High Priority Transactions */}
        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">
                High Priority Transactions
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Top critical transactions from database requiring review
              </CardDescription>
            </div>
            <Link to="/transactions">
              <Button variant="outline" size="sm" className="text-xs h-8 border-slate-700 hover:bg-slate-800 space-x-1.5">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Transaction</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Failure</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      </td>
                    </tr>
                  ) : summary?.highPriorityTransactions?.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        {txn.transactionId}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {txn.customerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-100 font-semibold">
                        ₹{txn.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatReasonEnum(txn.failureReason)}
                      </td>
                      <td className="py-3 px-4">
                        {getRiskBadge(txn.riskLevel)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {txn.recoveryPriority}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/transactions/${txn.transactionId}`}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
