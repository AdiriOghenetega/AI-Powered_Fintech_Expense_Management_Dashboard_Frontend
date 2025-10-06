import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, type ExpenseFilters } from '@/services/expenseService';
import type { CreateExpenseData } from '@/types/expense';

export const useExpenses = (filters: ExpenseFilters = {}) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expenseService.getExpenses(filters),
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => expenseService.getExpense(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => expenseService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseData) => expenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData> }) =>
      expenseService.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
};

export const useCategorizeExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseService.categorizeWithAI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
    },
  });
};
