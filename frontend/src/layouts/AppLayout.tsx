import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  RotateCcw,
  BarChart3,
  FileText,
  Search,
  Bell,
  Building2,
  ChevronDown,
  Menu,
  X,
  Zap,
  Users,
  Layers,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const overviewItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const operationItems: NavItem[] = [
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight, badge: '3,284' },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Recovery', path: '/recovery', icon: RotateCcw, badge: '7' },
  { label: 'Campaigns', path: '/campaigns', icon: Layers },
  { label: 'Audit Log', path: '/audit', icon: FileText },
];

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Helper to format current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/transactions/')) return 'Transaction Details';
    if (path.startsWith('/transactions')) return 'Transactions';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/recovery')) return 'Recovery Operations';
    if (path.startsWith('/campaigns')) return 'Recovery Campaigns';
    if (path.startsWith('/analytics')) return 'Recovery Analytics';
    if (path.startsWith('/audit')) return 'Audit Log';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Revenue Recovery';
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-950/90 border-r border-slate-900 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-900">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white leading-tight">
                  RecoverAI
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Revenue Recovery
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="p-3 space-y-6 flex-1 overflow-y-auto">
            {/* Overview Group */}
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Overview
              </div>
              {overviewItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all relative',
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4.5 bg-indigo-500 rounded-r" />
                        )}
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Operations Group */}
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Operations
              </div>
              {operationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all relative',
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4.5 bg-indigo-500 rounded-r" />
                        )}
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Settings & Merchant Profile */}
        <div className="p-3 border-t border-slate-900 space-y-2">
          {/* Settings Link */}
          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all relative',
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4.5 bg-indigo-500 rounded-r" />
                )}
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              </>
            )}
          </NavLink>

          {/* Logout Action */}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          {/* Merchant Profile Info */}
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user?.merchantName || 'Apex Retail Hub'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {user?.merchantId || '#MER-9821'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-950/60 backdrop-blur-md border-b border-slate-900 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-slate-100">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search transactions, customers... (⌘K)"
                className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-sans"
              />
            </div>

            {/* Notification Bell */}
            <button
              title="Notifications"
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
            </button>

            {/* Merchant Profile Avatar */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-900">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-semibold text-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AR'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-200">{user?.name || 'Merchant Admin'}</span>
                <span className="text-[10px] text-slate-400">{user?.email || 'admin@apexretail.in'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
