import { apiRequest } from './api';
import type { Expense, CreateExpenseData, Category } from '@/types/expense';
import type { PaginatedResponse } from '@/types/api';

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount' | 'merchant' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export const expenseService = {
  async getExpenses(filters: ExpenseFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return await apiRequest<PaginatedResponse<Expense>>('GET', `/expenses?${params}`);
  },

  async getExpense(id: string) {
    return await apiRequest<{ expense: Expense }>('GET', `/expenses/${id}`);
  },

  async createExpense(data: CreateExpenseData) {
    return await apiRequest<{ expense: Expense }>('POST', '/expenses', data);
  },

  async updateExpense(id: string, data: Partial<CreateExpenseData>) {
    return await apiRequest<{ expense: Expense }>('PUT', `/expenses/${id}`, data);
  },

  async deleteExpense(id: string) {
    return await apiRequest('DELETE', `/expenses/${id}`);
  },

  async categorizeWithAI(id: string) {
    return await apiRequest<{ expense: Expense; aiResult: any }>('POST', `/expenses/${id}/categorize`);
  },

  async bulkImport(expenses: CreateExpenseData[]) {
    return await apiRequest('POST', '/expenses/bulk', { expenses });
  },

  async getCategories() {
    return await apiRequest<{ categories: Category[] }>('GET', '/expenses/categories/list');
  },
};
