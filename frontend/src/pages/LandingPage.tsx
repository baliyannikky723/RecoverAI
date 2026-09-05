import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  Cpu, 
  Layers, 
  RefreshCw, 
  Mail, 
  Check, 
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { contactApi, DemoResponse } from '@/services/api/contactApi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Interactive Simulator State
  const [selectedReason, setSelectedReason] = useState<string>('NETWORK_ERROR');
  const [selectedLTV, setSelectedLTV] = useState<string>('HIGH');
  const [selectedAttempts, setSelectedAttempts] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<string>('');
  const [simResult, setSimResult] = useState<any>(null);

  // Contact / Demo Form State
  const [contactEmail, setContactEmail] = useState<string>('');
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<DemoResponse | null>(null);
  const [contactError, setContactError] = useState<string>('');

  // Run Simulation
  const handleSimulate = () => {
    setIsSimulating(true);
    setSimResult(null);
    
    // Simulate steps
    const steps = [
      'Loading transaction from PostgreSQL...',
      'Analyzing customer success history...',
      'Invoking AIRecoveryService pipeline...',
      'Formulating optimal retry window...'
    ];

    let currentStep = 0;
    setSimStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSimStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimStep('');
        
        // Calculate mock results based on selections
        let action = 'RETRY_PAYMENT';
        let confidence = 0.95;
        let riskLevel = 'LOW';
        let retryWindow = '1 Hour';
        let reason = '';

        if (selectedReason === 'NETWORK_ERROR') {
          action = 'RETRY_PAYMENT';
          confidence = selectedAttempts === 1 ? 0.98 : 0.82;
          riskLevel = 'LOW';
          retryWindow = '1 Hour';
          reason = `Transient gateway network error detected. Customer's historical success rate (88%) indicates a high chance of auto-recovery on retry.`;
        } else if (selectedReason === 'CARD_EXPIRED') {
          action = 'REQUEST_PAYMENT_METHOD_UPDATE';
          confidence = 0.92;
          riskLevel = 'LOW';
          retryWindow = 'Immediate';
          reason = `Expired card decline. System recommends triggering personalized email/SMS updates for this high-value (${selectedLTV} LTV) customer.`;
        } else if (selectedReason === 'INSUFFICIENT_FUNDS') {
          if (selectedAttempts >= 3) {
            action = 'SEND_PAYMENT_LINK';
            confidence = 0.65;
            riskLevel = 'MEDIUM';
            retryWindow = '24 Hours';
            reason = `Multiple insufficient funds events. Switched to sending a direct checkout link to avoid cardholder fee friction.`;
          } else {
            action = 'RETRY_PAYMENT';
            confidence = 0.75;
            riskLevel = 'LOW';
            retryWindow = '24 Hours';
            reason = `Temporary insufficient funds. Scheduling next attempt in 24 hours to align with standard payroll cycles.`;
          }
        } else if (selectedReason === 'BANK_DECLINED') {
          if (selectedAttempts >= 2) {
            action = 'STOP_RECOVERY';
            confidence = 0.90;
            riskLevel = 'HIGH';
            retryWindow = 'Never';
            reason = `Repeated hard decline by the bank. Stopped recovery immediately to safeguard merchant reputation and avoid card network penalties.`;
          } else {
            action = 'ESCALATE_TO_HUMAN';
            confidence = 0.70;
            riskLevel = 'HIGH';
            retryWindow = 'Immediate';
            reason = `General bank restriction. Escalating to account management for direct outreach with customer VIP preferences.`;
          }
        }

        setSimResult({
          action,
          confidence,
          riskLevel,
          retryWindow,
          reason,
          amount: selectedLTV === 'HIGH' ? 1250.00 : selectedLTV === 'MEDIUM' ? 180.00 : 25.00,
          expectedRecovery: ((selectedLTV === 'HIGH' ? 1250.00 : selectedLTV === 'MEDIUM' ? 180.00 : 25.00) * confidence).toFixed(2)
        });
      }
    }, 600); // Shorter step delay for snappier demo feel
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden relative bg-grid-pattern selection:bg-indigo-500/30">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">RecoverAI</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#simulator" className="hover:text-white transition-colors">AI Simulator</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 justify-between">
        <div className="flex-1 text-left max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-400 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Autonomous Revenue Recovery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Stop losing subscription revenue to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">failed payments</span>
          </h1>
          <p className="text-base text-slate-400 mb-8 leading-relaxed">
            RecoverAI integrates with your payment processor and database context to automate intelligent, personalized recovery schedules for card declines, replacing rigid time-based templates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs uppercase tracking-wider font-bold rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#simulator"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs uppercase tracking-wider font-bold rounded-lg flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
            >
              <span>Try Sandbox Simulator</span>
            </a>
          </div>
        </div>

        {/* Dashboard Mockup - Floating Layer Stack Design (Not stretched, high premium look) */}
        <div className="flex-1 w-full max-w-lg relative h-[360px] md:h-[400px]">
          {/* Backcard: Customer Profile Card */}
          <div className="absolute top-4 left-4 w-72 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl z-10 transition-transform hover:scale-102">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                SP
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Siddharth Patel</div>
                <div className="text-[10px] text-slate-500">siddharth.patel19@gmail.com</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-850 pt-3">
              <div>
                <span className="text-slate-500 block">LTV Segment</span>
                <span className="font-bold text-white">High Value (₹22,066)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method</span>
                <span className="font-bold text-white">Visa •••• 9821</span>
              </div>
            </div>
          </div>

          {/* Foreground: AI Decision Result Panel (Floating, Offset) */}
          <div className="absolute bottom-6 right-4 w-80 bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-2xl z-20 transition-transform hover:scale-102">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-bold uppercase">Decision Generated</span>
              </div>
              <Badge className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-[9px] px-2 font-mono">
                98% CONFIDENCE
              </Badge>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Action:</span>
                <span className="font-bold text-emerald-400">RETRY_PAYMENT</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Expected Recovery:</span>
                <span className="font-bold text-white">₹4,355.03</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Reasoning:</span>
                <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-950 p-2 rounded border border-slate-850">
                  Transient network error detected during processing. Customer profile is healthy with a 98% historic conversion rate. Automated retry recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Floating background graphic element */}
          <div className="absolute top-24 right-12 w-48 h-48 rounded-full bg-indigo-600/15 blur-3xl -z-10" />
        </div>
      </section>

      {/* 2. METRICS / STATS SECTION */}
      <section className="border-y border-slate-900 bg-slate-900/10 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-white mb-1.5">34.8%</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Avg Recovery Rate</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-white mb-1.5">₹14.2M+</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Revenue Saved</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-white mb-1.5">24/7</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Automated Runs</div>
          </div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-white mb-1.5">&lt;100ms</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Response Speed</div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto scroll-mt-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Enterprise-Grade Payment Recovery</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto">
            Traditional tools retry on rigid daily calendars. RecoverAI dynamically configures optimal windows for every transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Rich Customer Context</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Connects directly to PostgreSQL to analyze previous successful checkouts, decline history, and aggregate customer value before running tasks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">OpenRouter LLM Mapping</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Powered by Spring AI, compiling structured prompt metrics into reliable strategies and strategic justifications.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-xl hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Flexible Action Sequences</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Triggers localized card retries, emails secure checkout payment links, notifies channels, or flags customer support accounts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SIMULATOR PLAYGROUND */}
      <section id="simulator" className="py-16 border-t border-slate-900 bg-slate-900/10 px-6 scroll-mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Simulator Inputs */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Simulator Playground</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1.5 mb-3">Test the Decision Engine</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Configure payment parameters on the fly to see how the recovery engine analyzes variables to produce decisions.
                </p>
              </div>

              {/* Input 1: Decline Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Decline Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'NETWORK_ERROR', label: 'Network Error' },
                    { id: 'CARD_EXPIRED', label: 'Card Expired' },
                    { id: 'INSUFFICIENT_FUNDS', label: 'Insufficient Funds' },
                    { id: 'BANK_DECLINED', label: 'Bank Declined' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      className={`px-3 py-2 text-xs rounded-lg border text-center transition-all ${
                        selectedReason === r.id 
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold shadow' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 2: Customer LTV */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Customer Lifetime Value (LTV)</label>
                <div className="flex space-x-2">
                  {[
                    { id: 'LOW', label: 'Low (₹250)' },
                    { id: 'MEDIUM', label: 'Medium (₹1,800)' },
                    { id: 'HIGH', label: 'High (₹12,500)' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLTV(l.id)}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border text-center transition-all ${
                        selectedLTV === l.id 
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold shadow' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 3: Previous Attempts */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Previous Retries</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((a) => (
                    <button
                      key={a}
                      onClick={() => setSelectedAttempts(a)}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border text-center transition-all ${
                        selectedAttempts === a 
                          ? 'bg-indigo-600/15 border-indigo-500 text-white font-semibold shadow' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {a === 1 ? '1st Attempt' : `${a} Attempts`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulate Button */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>
            </div>

            {/* Simulator Output Screen */}
            <div className="lg:col-span-7 h-80 relative flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between overflow-y-auto">
                <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Strategy output Console</span>
                  </div>
                </div>

                {/* Normal State */}
                {!isSimulating && !simResult && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Cpu className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 text-xs font-semibold">Select parameters and click "Run Simulation"</p>
                  </div>
                )}

                {/* Loading State */}
                {isSimulating && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 rounded-full border-3 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    </div>
                    <p className="text-indigo-400 text-[10px] font-mono animate-pulse">{simStep}</p>
                  </div>
                )}

                {/* Simulation Output Result */}
                {simResult && !isSimulating && (
                  <div className="flex-1 py-3 space-y-3 text-left text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Recommended Action</div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                          {simResult.action}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Confidence Score</div>
                        <div className="text-xs font-bold text-white">{(simResult.confidence * 100).toFixed(0)}% Probability</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-slate-850 py-2.5">
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase">Risk Level</div>
                        <div className={`text-xs font-bold ${simResult.riskLevel === 'HIGH' ? 'text-red-400' : simResult.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {simResult.riskLevel}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold">Retry Window</div>
                        <div className="text-xs font-semibold text-slate-200">{simResult.retryWindow}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold">Expected Recovery</div>
                        <div className="text-xs font-semibold text-emerald-400">₹{simResult.expectedRecovery}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Strategic Reasoning</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850">
                        {simResult.reason}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>Input: {selectedReason} | {selectedLTV} LTV</span>
                  <span>Spring AI Integration Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING PLANS */}
      <section id="pricing" className="py-16 border-t border-slate-900 px-6 max-w-6xl mx-auto scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Simple Plans</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">
            Deploy recovery configurations suited to your transaction volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-xl flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="text-lg font-bold text-white mb-2">Free Developer</div>
              <p className="text-slate-400 text-xs mb-5">Perfect for staging sandbox accounts.</p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-extrabold text-white">₹0</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>100 transactions / mo</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>Mock engine triggers</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/signup?plan=developer')}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold rounded border border-slate-800 transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Plan 2: Pro */}
          <div className="bg-slate-900 border border-indigo-500/30 p-6 md:p-8 rounded-xl flex flex-col justify-between min-h-[380px] relative shadow-lg">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <div>
              <div className="text-lg font-bold text-white mb-2">Growth Pro</div>
              <p className="text-slate-400 text-xs mb-5">Designed for active online businesses.</p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-extrabold text-white">₹6,200</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>5,000 transactions / mo</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>Live OpenRouter models</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>LTV contextual analysis</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => navigate('/signup?plan=pro')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors shadow-md shadow-indigo-500/10"
            >
              Start Free Trial
            </button>
          </div>

          {/* Plan 3 */}
          <div className="bg-slate-900 border border-slate-850 p-6 md:p-8 rounded-xl flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="text-lg font-bold text-white mb-2">Enterprise</div>
              <p className="text-slate-400 text-xs mb-5">Custom configurations for high volumes.</p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-extrabold text-white">Custom</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>Unlimited processing</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-indigo-400" />
                  <span>SLA uptime guarantees</span>
                </li>
              </ul>
            </div>
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                const emailInput = document.querySelector<HTMLInputElement>('#contact input[type="email"]');
                emailInput?.focus();
              }}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold rounded border border-slate-800 transition-colors text-center block"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* 6. CONTACT / FOOTER SECTION (Removed massive padding heights, snug fit) */}
      <section id="contact" className="py-12 border-t border-slate-900 px-6 max-w-5xl mx-auto scroll-mt-12">
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden">
          <div className="space-y-3.5">
            <h2 className="text-xl md:text-2xl font-bold text-white">Ready to recover your revenue?</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Submit your email to connect with our dunning experts and configure a custom integration.
            </p>
            <div className="flex items-center space-x-2.5 text-xs text-slate-400 pt-1">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>sales@recoverai.com</span>
            </div>
          </div>
          
          {contactSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 text-left space-y-3 shadow-xl">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-sm">Demo Request Confirmed!</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Confirmation sent to <strong className="text-white">{contactSuccess.recipient}</strong>.
              </p>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                <span>Dispatch Mode:</span>
                <Badge className={contactSuccess.isLiveSent ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"}>
                  {contactSuccess.isLiveSent ? "LIVE SMTP DELIVERED" : "SANDBOX CONFIRMED"}
                </Badge>
              </div>
              <button
                onClick={() => {
                  setContactSuccess(null);
                  setContactEmail('');
                  setContactError('');
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-semibold rounded border border-slate-800 transition-colors"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form 
              className="space-y-3" 
              onSubmit={async (e) => { 
                e.preventDefault();
                if (!contactEmail || !contactEmail.includes('@')) {
                  setContactError('Please enter a valid email address.');
                  return;
                }
                setContactError('');
                setIsSubmittingContact(true);
                try {
                  const res = await contactApi.submitDemoRequest({ email: contactEmail.trim() });
                  setContactSuccess(res);
                } catch (err: any) {
                  setContactError(err?.message || 'Failed to submit demo request. Please try again.');
                } finally {
                  setIsSubmittingContact(false);
                }
              }}
            >
              {contactError && (
                <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Business Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@company.com" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingContact}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-indigo-500/10 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmittingContact ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Demo Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Get Custom Demo</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 space-y-3 sm:space-y-0">
          <div>
            <span>© {new Date().getFullYear()} RecoverAI Technologies, Inc. All rights reserved.</span>
          </div>
          <div className="flex space-x-5">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Status</a>
          </div>
        </div>
      </section>
    </div>
  );
};
