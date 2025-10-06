import { apiRequest } from './api';
import type { Budget, CreateBudgetData, BudgetAlert, BudgetStats } from '@/types/budget';

export interface BudgetFilters {
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export const budgetService = {
  async getBudgets(filters: BudgetFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return await apiRequest<{ budgets: Budget[] }>('GET', `/budgets?${params}`);
  },

  async getBudget(id: string) {
    return await apiRequest<{ budget: Budget }>('GET', `/budgets/${id}`);
  },

  async createBudget(data: CreateBudgetData) {
    return await apiRequest<{ budget: Budget }>('POST', '/budgets', data);
  },

  async updateBudget(id: string, data: Partial<CreateBudgetData>) {
    return await apiRequest<{ budget: Budget }>('PUT', `/budgets/${id}`, data);
  },

  async deleteBudget(id: string) {
    return await apiRequest('DELETE', `/budgets/${id}`);
  },

  async getBudgetAlerts() {
    return await apiRequest<{ alerts: BudgetAlert[] }>('GET', '/budgets/alerts');
  },

  async getBudgetStats() {
    return await apiRequest<{ stats: BudgetStats }>('GET', '/budgets/stats');
  },

  async getBudgetPerformance(period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY') {
    return await apiRequest<{ budgetPerformance: any[] }>('GET', `/budgets/performance?period=${period}`);
  },
};