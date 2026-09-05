import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Activity, TrendingUp, CheckCircle, Mail, PhoneCall, AlertTriangle, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CampaignStep {
  name: string;
  channel: 'AI_DECISION' | 'EMAIL' | 'SMS' | 'RETRY' | 'ESCALATE';
  delay: string;
  description: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  successRate: number;
  activeCount: number;
  recoveredRevenue: number;
  steps: CampaignStep[];
}

const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'High-Value VIP Recovery',
    description: 'Triggered for transactions greater than ₹5,000. Uses real-time AI modeling, immediate notifications, and early human support escalation.',
    successRate: 0.745,
    activeCount: 18,
    recoveredRevenue: 342910.50,
    steps: [
      { name: 'AI Decision Analysis', channel: 'AI_DECISION', delay: 'Immediate', description: 'Evaluate customer LTV, failure code, and calculate initial retry confidence.' },
      { name: 'VIP Smart Retry', channel: 'RETRY', delay: '1-4 Hours', description: 'Schedule automatic card retry matched to bank success windows.' },
      { name: 'Personalized Email Dunning', channel: 'EMAIL', delay: '24 Hours', description: 'Send high-priority email with a direct secure checkout link.' },
      { name: 'Dedicated Support Alert', channel: 'ESCALATE', delay: '48 Hours', description: 'Escalate to account managers for direct, high-touch resolution.' }
    ]
  },
  {
    id: 'c2',
    name: 'Standard Card Decline Flow',
    description: 'Designed for daily e-commerce checkouts. Focuses on low-friction automatic retries and casual email reminders.',
    successRate: 0.421,
    activeCount: 89,
    recoveredRevenue: 98450.00,
    steps: [
      { name: 'Immediate Retry Check', channel: 'RETRY', delay: 'Immediate', description: 'Retry once immediately if network/gateway error code is returned.' },
      { name: 'Optimal Retry 2', channel: 'RETRY', delay: '24 Hours', description: 'Retry again following the daily banking window.' },
      { name: 'Email Payment Reminder', channel: 'EMAIL', delay: '3 Days', description: 'Send automated email prompting customer to verify card funds.' },
      { name: 'SMS Backup Alert', channel: 'SMS', delay: '5 Days', description: 'Send SMS containing single-click payment option.' }
    ]
  },
  {
    id: 'c3',
    name: 'SaaS Subscription Retention',
    description: 'Optimized for recurring monthly and annual subscriptions. Offers a 14-day grace period to prevent immediate churn.',
    successRate: 0.682,
    activeCount: 34,
    recoveredRevenue: 185120.00,
    steps: [
      { name: 'AI Churn Assessment', channel: 'AI_DECISION', delay: 'Immediate', description: 'Classify risk of voluntary vs involuntary churn.' },
      { name: 'Grace Period Email', channel: 'EMAIL', delay: '12 Hours', description: 'Notify customer of payment failure and activate 14-day grace access.' },
      { name: 'Middle-cycle Retry', channel: 'RETRY', delay: '7 Days', description: 'Schedule quiet background card retry.' },
      { name: 'Final Notice & Block', channel: 'ESCALATE', delay: '14 Days', description: 'Suspend subscription access and move account to offline recovery.' }
    ]
  }
];

export const CampaignsPage: React.FC = () => {
  const { user } = useAuth();

  const getPersonalizedCampaigns = () => {
    if (!user) return mockCampaigns;
    
    let hash = 0;
    const email = user.email;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const scale = 0.35 + (seed % 160) / 100;
    
    return mockCampaigns.map(camp => ({
      ...camp,
      successRate: Math.min(0.98, Math.max(0.25, camp.successRate + ((seed % 10 - 5) / 100))),
      activeCount: Math.round(camp.activeCount * scale) || 3,
      recoveredRevenue: Math.round(camp.recoveredRevenue * scale * 100) / 100
    })) as Campaign[];
  };

  const personalizedCampaigns = getPersonalizedCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('c1');
  const selectedCampaign = personalizedCampaigns.find(c => c.id === selectedCampaignId) || personalizedCampaigns[0];

  const getStepIcon = (channel: string) => {
    switch (channel) {
      case 'AI_DECISION':
        return <Activity className="w-4 h-4 text-indigo-400" />;
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'SMS':
        return <PhoneCall className="w-4 h-4 text-purple-400" />;
      case 'RETRY':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'ESCALATE':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top statistics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Campaigns</CardTitle>
            <Layers className="h-4.5 w-4.5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3 Active</div>
            <p className="text-[10px] text-slate-500 mt-1">Driving automatic recovery routes</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Campaign Revenue</CardTitle>
            <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹6,26,480.50</div>
            <p className="text-[10px] text-slate-500 mt-1">Directly attributed to dunning</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Conversion</CardTitle>
            <CheckCircle className="h-4.5 w-4.5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">61.5%</div>
            <p className="text-[10px] text-slate-500 mt-1">Combined flow efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Campaign Management Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Campaign list */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider pl-1">Dunning Campaigns</h3>
          {personalizedCampaigns.map((camp) => (
            <div
              key={camp.id}
              onClick={() => setSelectedCampaignId(camp.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCampaign.id === camp.id
                  ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-slate-100">{camp.name}</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 font-mono">
                  {(camp.successRate * 100).toFixed(1)}% Rec.
                </Badge>
              </div>
              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                {camp.description}
              </p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2.5 border-t border-slate-800/60 font-mono">
                <span>{camp.activeCount} Active Runs</span>
                <span className="font-semibold text-slate-300">₹{camp.recoveredRevenue.toLocaleString('en-IN')} recovered</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Detailed flow diagram */}
        <div className="lg:col-span-8">
          <Card className="glass-card h-full">
            <CardHeader className="border-b border-slate-900 pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold text-white">{selectedCampaign.name}</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Visual representation of recovery sequence steps</p>
                </div>
                <div className="flex space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded">
                    ID: {selectedCampaign.id.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="py-6">
              {/* Campaign Flow Visualization */}
              <div className="relative border-l-2 border-slate-800 pl-6 ml-4 space-y-6">
                {selectedCampaign.steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Pin */}
                    <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow">
                      {getStepIcon(step.channel)}
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-200">{step.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({step.channel})</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                          {step.delay}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action bar simulating run */}
              <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center">
                <span className="text-xs text-slate-500">Configure trigger webhooks inside developer settings.</span>
                <button className="flex items-center space-x-2 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  <Play className="w-3.5 h-3.5 fill-indigo-400" />
                  <span>Test Flow</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
