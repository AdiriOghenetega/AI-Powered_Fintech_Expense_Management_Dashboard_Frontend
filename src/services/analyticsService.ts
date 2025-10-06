import { apiRequest } from './api';
import type { TrendsData, CategoryAnalysis, BudgetPerformance, SpendingInsights } from '@/types/analytics';

export const analyticsService = {
  async getOverview() {
    return await apiRequest<{ overview: any; categoryBreakdown: any[]; recentTransactions: any[]; budgetStatus: any[] }>('GET', '/analytics/overview');
  },

  async getTrends(params: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
    categories?: string[];
    groupBy?: 'day' | 'week' | 'month' | 'category' | 'paymentMethod';
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return await apiRequest<TrendsData>('GET', `/analytics/trends?${searchParams}`);
  },

  async getCategoryAnalysis() {
    return await apiRequest<CategoryAnalysis>('GET', '/analytics/categories');
  },

  async getBudgetPerformance(period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY') {
    return await apiRequest<BudgetPerformance>('GET', `/analytics/budget-performance?period=${period}`);
  },

  async getSpendingInsights() {
    return await apiRequest<SpendingInsights>('GET', '/analytics/insights');
  },
};