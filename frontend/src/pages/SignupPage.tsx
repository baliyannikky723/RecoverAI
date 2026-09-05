import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, Mail, Lock, User, Building2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPlanDetails = () => {
    if (selectedPlan === 'pro') {
      return { title: 'Growth Pro', price: '₹6,200/mo', trial: '14-Day Free Trial' };
    }
    if (selectedPlan === 'developer') {
      return { title: 'Free Developer', price: '₹0/mo', trial: '100 Transactions' };
    }
    return null;
  };

  const planInfo = getPlanDetails();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signup(name, email, password, merchantName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'An error occurred during account registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 bg-grid-pattern relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold mb-3.5">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-500 mt-1">Start recovering payment declines today</p>
        </div>

        {planInfo && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-semibold">Plan: {planInfo.title}</span>
            </div>
            <span className="text-[11px] text-indigo-300 font-mono font-medium">{planInfo.price} ({planInfo.trial})</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Merchant Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Merchant / Company Name input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Merchant Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Apex Retail Hub"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="•••••••• (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors shadow-md shadow-indigo-500/10 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Registering...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Navigation back link */}
        <div className="mt-5 text-center text-xs text-slate-500 pt-4 border-t border-slate-850">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
