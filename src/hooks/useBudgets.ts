import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, type BudgetFilters } from '@/services/budgetService';
import type { CreateBudgetData } from '@/types/budget';

export const useBudgets = (filters: BudgetFilters = {}) => {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetService.getBudgets(filters),
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetService.getBudget(id),
    enabled: !!id,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetData) => budgetService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['budget-alerts'] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBudgetData> }) =>
      budgetService.updateBudget(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
  });
};

export const useBudgetAlerts = () => {
  return useQuery({
    queryKey: ['budget-alerts'],
    queryFn: () => budgetService.getBudgetAlerts(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useBudgetStats = () => {
  return useQuery({
    queryKey: ['budget-stats'],
    queryFn: () => budgetService.getBudgetStats(),
  });
};

export const useBudgetPerformance = (period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY') => {
  return useQuery({
    queryKey: ['budget-performance', period],
    queryFn: () => budgetService.getBudgetPerformance(period),
  });
};