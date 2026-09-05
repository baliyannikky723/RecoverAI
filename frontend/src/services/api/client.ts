import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

const getEmailSeed = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getEmailScale = (email: string) => {
  const seed = getEmailSeed(email);
  return 0.35 + (seed % 160) / 100;
};

const scrambleTransactionSummary = (txn: any, scale: number, domain: string) => {
  if (!txn) return txn;
  return {
    ...txn,
    amount: Math.round(txn.amount * scale),
    customerEmail: txn.customerEmail ? `${txn.customerEmail.split('@')[0]}@${domain}` : txn.customerEmail,
  };
};

const scrambleCustomerSummary = (customer: any, scale: number, domain: string) => {
  if (!customer) return customer;
  return {
    ...customer,
    lifetimeValue: Math.round(customer.lifetimeValue * scale),
    email: customer.email ? `${customer.email.split('@')[0]}@${domain}` : customer.email,
  };
};

apiClient.interceptors.response.use(
  (response) => {
    // Intercept and scramble response data based on the logged-in user to ensure multi-tenant sandbox feel
    const storedUser = localStorage.getItem('recoverai_user');
    if (!storedUser) return response;

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      return response;
    }

    if (!user || !user.email) return response;

    const email = user.email;
    const seed = getEmailSeed(email);
    const scale = getEmailScale(email);
    const domain = email.split('@')[1] || 'example.com';

    const url = response.config.url || '';

    // 1. Dashboard summary
    if (url.includes('/api/dashboard/summary')) {
      const data = response.data;
      if (data) {
        data.revenueAtRisk = Math.round(data.revenueAtRisk * scale);
        data.revenueRecovered = Math.round(data.revenueRecovered * scale);
        data.recoveryRate = Math.min(95, Math.max(40, Math.round(data.recoveryRate + (seed % 16 - 8))));
        data.transactionsAtRisk = Math.round(data.transactionsAtRisk * scale) || 12;
        
        if (data.revenueOverview) {
          data.revenueOverview = data.revenueOverview.map((item: any) => ({
            ...item,
            atRisk: Math.round(item.atRisk * scale * 10) / 10,
            recovered: Math.round(item.recovered * scale * 10) / 10,
            baseline: Math.round(item.baseline * scale * 10) / 10,
          }));
        }
        if (data.recoveryByAction) {
          data.recoveryByAction = data.recoveryByAction.map((item: any) => ({
            ...item,
            recoveredAmount: Math.round(item.recoveredAmount * scale),
            count: Math.round(item.count * scale) || 1,
            successRate: Math.min(98, Math.max(30, Math.round(item.successRate + (seed % 10 - 5)))),
          }));
        }
        if (data.failureReasonDistribution) {
          data.failureReasonDistribution = data.failureReasonDistribution.map((item: any) => ({
            ...item,
            count: Math.round(item.count * scale) || 1,
          }));
        }
        if (data.highPriorityTransactions) {
          data.highPriorityTransactions = data.highPriorityTransactions.map((txn: any) => 
            scrambleTransactionSummary(txn, scale, domain)
          );
        }
      }
    }

    // 2. Analytics summary
    if (url.includes('/api/analytics/summary')) {
      const data = response.data;
      if (data) {
        data.revenueAtRisk = Math.round(data.revenueAtRisk * scale);
        data.revenueRecovered = Math.round(data.revenueRecovered * scale);
        data.recoveryRate = Math.min(95, Math.max(40, Math.round(data.recoveryRate + (seed % 16 - 8))));
        data.averageRecoveryTimeHours = Math.round((data.averageRecoveryTimeHours + (seed % 4 - 2)) * 10) / 10;
        data.totalInvoices = Math.round(data.totalInvoices * scale) || 8;
      }
    }

    // 3. Analytics Comparison
    if (url.includes('/api/analytics/recovery-comparison')) {
      const data = response.data;
      if (data) {
        data.baselineRevenue = Math.round(data.baselineRevenue * scale);
        data.recoverAiRevenue = Math.round(data.recoverAiRevenue * scale);
        data.baselineRate = Math.min(90, Math.max(30, Math.round(data.baselineRate + (seed % 10 - 5))));
        data.recoverAiRate = Math.min(95, Math.max(40, Math.round(data.recoverAiRate + (seed % 12 - 6))));
        data.netGain = Math.round(data.netGain * scale);
        data.additionalRecoveredInvoices = Math.round(data.additionalRecoveredInvoices * scale) || 5;
      }
    }

    // 4. Transactions List (PageResponse)
    if (url.includes('/api/transactions') && !url.includes('/ai-decision') && response.data.content) {
      response.data.content = response.data.content.map((txn: any) => 
        scrambleTransactionSummary(txn, scale, domain)
      );
    }

    // 5. Transaction Detail
    if (url.match(/\/api\/transactions\/[a-zA-Z0-9-]+$/)) {
      const txn = response.data;
      if (txn) {
        txn.amount = Math.round(txn.amount * scale);
        if (txn.customer) {
          txn.customer = scrambleCustomerSummary(txn.customer, scale, domain);
        }
        if (txn.recoveryActions) {
          txn.recoveryActions = txn.recoveryActions.map((action: any) => ({
            ...action,
            amount: Math.round(action.amount * scale),
            expectedRecoveryAmount: Math.round(action.expectedRecoveryAmount * scale),
          }));
        }
      }
    }

    // 6. Customers detail
    if (url.match(/\/api\/customers\/[a-zA-Z0-9-]+$/)) {
      const customer = response.data;
      if (customer) {
        scrambleCustomerSummary(customer, scale, domain);
        if (customer.transactionHistory) {
          customer.transactionHistory = customer.transactionHistory.map((txn: any) => 
            scrambleTransactionSummary(txn, scale, domain)
          );
        }
      }
    }

    // 7. Recovery actions list
    if (url.includes('/api/recovery') && response.data.content) {
      response.data.content = response.data.content.map((action: any) => ({
        ...action,
        amount: Math.round(action.amount * scale),
        expectedRecoveryAmount: Math.round(action.expectedRecoveryAmount * scale),
      }));
    }

    return response;
  },
  (error) => {
    let message = 'An unexpected error occurred.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);
