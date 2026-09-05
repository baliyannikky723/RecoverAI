import React, { useState } from 'react';
import { Search, User, ShieldAlert, RefreshCw, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  ltv: number;
  successRate: number;
  totalTxns: number;
  status: 'HEALTHY' | 'AT_RISK' | 'RECOVERING';
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'Siddharth Patel', email: 'siddharth.patel19@gmail.com', ltv: 22066.76, successRate: 0.85, totalTxns: 33, status: 'RECOVERING' },
  { id: '2', name: 'Rohan Nair', email: 'rohan.nair128@yahoo.com', ltv: 12450.40, successRate: 0.98, totalTxns: 56, status: 'HEALTHY' },
  { id: '3', name: 'Meera Sharma', email: 'meera.sharma399@yahoo.com', ltv: 8520.10, successRate: 0.92, totalTxns: 12, status: 'HEALTHY' },
  { id: '4', name: 'Divya Saxena', email: 'divya.saxena46@gmail.com', ltv: 3120.00, successRate: 0.60, totalTxns: 8, status: 'AT_RISK' },
  { id: '5', name: 'Ishita Kapoor', email: 'ishita.kapoor483@corp.net', ltv: 45900.50, successRate: 0.95, totalTxns: 89, status: 'HEALTHY' },
  { id: '6', name: 'Harsh Nair', email: 'harsh.nair213@enterprise.in', ltv: 11200.00, successRate: 0.70, totalTxns: 15, status: 'AT_RISK' },
  { id: '7', name: 'Kavita Malhotra', email: 'kavita.malhotra400@gmail.com', ltv: 5612.60, successRate: 0.88, totalTxns: 20, status: 'RECOVERING' },
  { id: '8', name: 'Priya Menon', email: 'priya.menon253@corp.net', ltv: 56423.37, successRate: 0.97, totalTxns: 110, status: 'HEALTHY' },
  { id: '9', name: 'Arjun Joshi', email: 'arjun.joshi169@enterprise.in', ltv: 9810.70, successRate: 0.82, totalTxns: 24, status: 'RECOVERING' },
  { id: '10', name: 'Meera Nair', email: 'meera.nair464@corp.net', ltv: 18450.00, successRate: 0.78, totalTxns: 41, status: 'AT_RISK' }
];

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { user } = useAuth();

  const getPersonalizedCustomers = () => {
    if (!user) return mockCustomers;
    
    // Hash email to get a seed and scale
    let hash = 0;
    const email = user.email;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const scale = 0.35 + (seed % 160) / 100;
    const domain = email.split('@')[1] || 'example.com';
    
    return mockCustomers.map(c => ({
      ...c,
      ltv: Math.round(c.ltv * scale * 100) / 100,
      email: `${c.email.split('@')[0]}@${domain}`,
      totalTxns: Math.round(c.totalTxns * scale) || 3,
      status: (seed + parseInt(c.id)) % 3 === 0 
        ? 'HEALTHY' 
        : (seed + parseInt(c.id)) % 3 === 1 
          ? 'AT_RISK' 
          : 'RECOVERING'
    })) as Customer[];
  };

  const personalizedCustomers = getPersonalizedCustomers();

  const filteredCustomers = personalizedCustomers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Healthy</Badge>;
      case 'AT_RISK':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">At Risk</Badge>;
      case 'RECOVERING':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Recovering</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Cards for Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</CardTitle>
            <User className="h-4.5 w-4.5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,482</div>
            <p className="text-[10px] text-slate-500 mt-1">+12% growth this month</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Recovery Cases</CardTitle>
            <RefreshCw className="h-4.5 w-4.5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">47</div>
            <p className="text-[10px] text-slate-500 mt-1">Currently in dunning sequence</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Customers</CardTitle>
            <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">14</div>
            <p className="text-[10px] text-slate-500 mt-1">Requiring immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Customers List */}
      <Card className="glass-card">
        <CardHeader className="pb-3 border-b border-slate-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-white">Customer Database</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Manage customer profiles and monitor billing health</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-56 transition-colors"
                />
              </div>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="ALL">All Statuses</option>
                <option value="HEALTHY">Healthy</option>
                <option value="RECOVERING">Recovering</option>
                <option value="AT_RISK">At Risk</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Lifetime Value (LTV)</th>
                  <th className="px-6 py-3.5 text-right">Success Rate</th>
                  <th className="px-6 py-3.5 text-right">Total Payments</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="fintech-table-row">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-xs">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">{customer.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold font-mono text-white">
                        ₹{customer.ltv.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className={`font-semibold ${customer.successRate >= 0.9 ? 'text-emerald-400' : customer.successRate >= 0.8 ? 'text-amber-400' : 'text-red-400'}`}>
                          {(customer.successRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300 font-mono">
                        {customer.totalTxns}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors inline-flex items-center space-x-1"
                          title="View Ledger"
                        >
                          <span className="text-[10px] px-1 font-medium">History</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      No customers found matching the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
