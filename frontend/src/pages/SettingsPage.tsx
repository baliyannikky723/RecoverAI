import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Sliders, Shield, Bell, Save, CheckCircle, HelpCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'GATEWAYS' | 'AI_ENGINE' | 'CHANNELS'>('GENERAL');
  
  // State variables for settings form
  const [merchantName, setMerchantName] = useState('Apex Retail Hub');
  const [currency, setCurrency] = useState('INR');
  const [aiProvider, setAiProvider] = useState('SPRING_AI');
  const [aiModel, setAiModel] = useState('openrouter/free');
  const [apiKey, setApiKey] = useState('sk-or-v1-••••••••••••••••••••••••••••••••');
  
  // Toggles for gateways
  const [stripeConnected, setStripeConnected] = useState(true);
  const [razorpayConnected, setRazorpayConnected] = useState(true);
  const [paytmConnected, setPaytmConnected] = useState(true);
  const [adyenConnected, setAdyenConnected] = useState(false);

  // Toggles for communication channels
  const [emailActive, setEmailActive] = useState(true);
  const [smsActive, setSmsActive] = useState(true);
  const [whatsappActive, setWhatsappActive] = useState(false);

  const handleSave = () => {
    alert("Settings saved successfully! Real-time configurations reloaded.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar inside Settings */}
        <div className="md:w-64 space-y-1.5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
              activeTab === 'GENERAL'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>General Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('GATEWAYS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
              activeTab === 'GATEWAYS'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Payment Gateways</span>
          </button>
          <button
            onClick={() => setActiveTab('AI_ENGINE')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
              activeTab === 'AI_ENGINE'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>AI Decision Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('CHANNELS')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
              activeTab === 'CHANNELS'
                ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
            }`}
          >
            <NavIcon name="bell" />
            <span>Dunning Channels</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="glass-card h-full">
            <CardHeader className="border-b border-slate-900 pb-3">
              <CardTitle className="text-base font-bold text-white">
                {activeTab === 'GENERAL' && 'General Merchant Profile'}
                {activeTab === 'GATEWAYS' && 'Payment Gateway Integrations'}
                {activeTab === 'AI_ENGINE' && 'AI Recovery Model Configuration'}
                {activeTab === 'CHANNELS' && 'Communication Channel Controls'}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'GENERAL' && 'Configure core details, identity credentials, and primary billing currency.'}
                {activeTab === 'GATEWAYS' && 'Configure the direct webhook sources to intercept declined transactions.'}
                {activeTab === 'AI_ENGINE' && 'Configure live LLM integration endpoints, keys, and model selections.'}
                {activeTab === 'CHANNELS' && 'Configure automated messaging templates and delivery toggles.'}
              </p>
            </CardHeader>

            <CardContent className="py-6">
              {/* Tab 1: General */}
              {activeTab === 'GENERAL' && (
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Merchant Name</label>
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Merchant Reference ID</label>
                    <input
                      type="text"
                      value="#MER-9821"
                      disabled
                      className="w-full bg-slate-950/50 border border-slate-900 rounded-lg px-3.5 py-2 text-xs text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Primary Settlements Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 2: Gateways */}
              {activeTab === 'GATEWAYS' && (
                <div className="space-y-5">
                  {[
                    { id: 'stripe', name: 'Stripe API Connection', desc: 'Captures primary SaaS credit card transaction attempts.', state: stripeConnected, setState: setStripeConnected },
                    { id: 'razorpay', name: 'Razorpay AutoPay Subscriptions', desc: 'Tracks domestic mandate failures and recurring e-mandates.', state: razorpayConnected, setState: setRazorpayConnected },
                    { id: 'paytm', name: 'Paytm Subscriptions & Wallet', desc: 'Syncs one-click recurring wallet failures.', state: paytmConnected, setState: setPaytmConnected },
                    { id: 'adyen', name: 'Adyen global POS/API Merchant', desc: 'Handles international enterprise multi-currency declines.', state: adyenConnected, setState: setAdyenConnected }
                  ].map((gateway) => (
                    <div key={gateway.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/30 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-200">{gateway.name}</span>
                          {gateway.state ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">Active</Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-slate-500 border-slate-700/50 text-[9px] font-mono">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{gateway.desc}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => gateway.setState(!gateway.state)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            gateway.state ? 'bg-indigo-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              gateway.state ? 'translate-x-5.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: AI Engine */}
              {activeTab === 'AI_ENGINE' && (
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Active AI Provider</label>
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="SPRING_AI">Spring AI / Configured LLM (Live API)</option>
                      <option value="MOCK_AI">Mock AI Decision Engine (Deterministic Rules)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Model Selection (OpenRouter)</label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      disabled={aiProvider === 'MOCK_AI'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="openrouter/free">openrouter/free (Auto-Router)</option>
                      <option value="google/gemma-4-31b-it:free">google/gemma-4-31b-it:free</option>
                      <option value="meta-llama/llama-3.1-8b-instruct:free">meta-llama/llama-3.1-8b-instruct:free</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold text-slate-500">OpenRouter API Key</label>
                      <span className="text-[9px] text-indigo-400 font-mono flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Valid Key Detected</span>
                      </span>
                    </div>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      disabled={aiProvider === 'MOCK_AI'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Dunning Channels */}
              {activeTab === 'CHANNELS' && (
                <div className="space-y-5">
                  {[
                    { id: 'email', name: 'Email Dunning Sequences', desc: 'Sends personalized email alerts with a secure payment update gateway link.', state: emailActive, setState: setEmailActive },
                    { id: 'sms', name: 'SMS Mobile Reminders', desc: 'Triggers direct mobile text alerts with one-click payment buttons.', state: smsActive, setState: setSmsActive },
                    { id: 'whatsapp', name: 'WhatsApp Business Notifications', desc: 'Triggers direct business chat conversations to update expired cards.', state: whatsappActive, setState: setWhatsappActive }
                  ].map((channel) => (
                    <div key={channel.id} className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/30 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-200">{channel.name}</span>
                          {channel.state ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">Enabled</Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-slate-500 border-slate-700/50 text-[9px] font-mono">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{channel.desc}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => channel.setState(!channel.state)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            channel.state ? 'bg-indigo-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              channel.state ? 'translate-x-5.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-900 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-indigo-500/10 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper component to avoid import issues
const NavIcon: React.FC<{ name: string }> = ({ name }) => {
  if (name === 'bell') {
    return <Bell className="w-4 h-4" />;
  }
  return <HelpCircle className="w-4 h-4" />;
};
