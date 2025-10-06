import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/useExpenses';
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets';
import type { Budget, CreateBudgetData } from '@/types/budget';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onClose: () => void;
  onSuccess: () => void;
}

const periods = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categoriesData } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget ? {
      categoryId: budget.category.id,
      amount: budget.budgetAmount,
      period: budget.period,
      startDate: budget.startDate.split('T')[0],
    } : {
      categoryId: '',
      amount: 0,
      period: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    
    try {
      const budgetData: CreateBudgetData = {
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period,
        startDate: data.startDate,
      };

      if (budget) {
        await updateBudget.mutateAsync({
          id: budget.id,
          data: budgetData,
        });
      } else {
        await createBudget.mutateAsync(budgetData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save budget:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {budget ? 'Edit Budget' : 'Create New Budget'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="form-label">Category</label>
            <select
              {...register('categoryId')}
              className="form-input"
              disabled={!!budget} // Don't allow changing category when editing
            >
              <option value="">Select a category</option>
              {categoriesData?.data?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Budget Amount */}
          <Input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            label="Budget Amount"
            error={errors.amount?.message}
            placeholder="500.00"
          />

          {/* Period */}
          <div>
            <label className="form-label">Budget Period</label>
            <div className="grid grid-cols-3 gap-3">
              {periods.map((period) => (
                <label key={period.value} className="relative">
                  <input
                    type="radio"
                    {...register('period')}
                    value={period.value}
                    className="sr-only peer"
                  />
                  <div className="p-3 border border-gray-300 rounded-lg text-center cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 hover:border-gray-400 transition-colors">
                    <div className="text-sm font-medium">{period.label}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.period && (
              <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
            )}
          </div>

          {/* Start Date (Optional) */}
          <Input
            {...register('startDate')}
            type="date"
            label="Start Date (Optional)"
            error={errors.startDate?.message}
          />

          {/* Budget Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Budget Preview</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Daily limit:</span>
                <span className="font-medium">
                  ₦{(() => {
                    const amount = parseFloat(document.querySelector<HTMLInputElement>('input[name="amount"]')?.value || '0');
                    const period = (document.querySelector<HTMLInputElement>('input[name="period"]:checked')?.value || 'MONTHLY') as 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
                    const days = period === 'MONTHLY' ? 30 : period === 'QUARTERLY' ? 90 : 365;
                    return (amount / days).toFixed(2);
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Weekly limit:</span>
                <span className="font-medium">
                  ₦{(() => {
                    const amount = parseFloat(document.querySelector<HTMLInputElement>('input[name="amount"]')?.value || '0');
                    const period = (document.querySelector<HTMLInputElement>('input[name="period"]:checked')?.value || 'MONTHLY') as 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
                    const weeks = period === 'MONTHLY' ? 4.3 : period === 'QUARTERLY' ? 13 : 52;
                    return (amount / weeks).toFixed(2);
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
            variant='gradient'
              type="submit"
              loading={isSubmitting}
              className="flex-1"
            >
              {budget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};