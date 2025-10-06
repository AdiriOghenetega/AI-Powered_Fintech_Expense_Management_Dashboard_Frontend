import React, { useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Calendar, 
  FileText,
  Settings,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/useExpenses';
import { useCreateReport } from '@/hooks/useReports';
import type { CreateReportRequest } from '@/types/report';

// Create a more flexible schema that matches react-hook-form expectations
const reportSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(100, 'Name too long'),
  type: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  categories: z.array(z.string()),
  includeCharts: z.boolean(),
  groupBy: z.enum(['day', 'week', 'month', 'category']),
  isScheduled: z.boolean(),
  scheduleFrequency: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
});

// Create a form-specific type that's more flexible
interface ReportFormData extends FieldValues {
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  categories: string[];
  includeCharts: boolean;
  groupBy: 'day' | 'week' | 'month' | 'category';
  isScheduled: boolean;
  scheduleFrequency?: 'weekly' | 'monthly' | 'quarterly';
}

interface ReportGeneratorProps {
  onClose: () => void;
  onSuccess?: (report: any) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onClose, onSuccess }) => {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const { data: categoriesData } = useCategories();
  const createReport = useCreateReport();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema) as any, // Type assertion to bypass resolver issue
    mode: 'onChange',
    defaultValues: {
      name: '',
      type: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      categories: [],
      includeCharts: true,
      groupBy: 'month',
      isScheduled: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

  const watchedType = watch('type');
  const watchedScheduled = watch('isScheduled');

  const onSubmit = async (data: ReportFormData): Promise<void> => {
    try {
      const reportRequest: CreateReportRequest = {
        name: data.name,
        type: data.type,
        parameters: {
          startDate: data.startDate,
          endDate: data.endDate,
          categories: data.categories,
          includeCharts: data.includeCharts,
          groupBy: data.groupBy,
        },
        isScheduled: data.isScheduled,
        scheduleConfig: data.isScheduled && data.scheduleFrequency ? {
          frequency: data.scheduleFrequency,
        } : undefined,
      };

      const result = await createReport.mutateAsync(reportRequest);
      onSuccess?.(result.data?.report);
      onClose();
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  // Auto-set date ranges based on report type
  const handleTypeChange = (type: ReportFormData['type']): void => {
    setValue('type', type);
    const now = new Date();
    
    switch (type) {
      case 'monthly':
        setValue('startDate', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
        setValue('endDate', new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
        break;
      case 'quarterly':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        setValue('startDate', quarterStart.toISOString().split('T')[0]);
        setValue('endDate', quarterEnd.toISOString().split('T')[0]);
        break;
      case 'yearly':
        setValue('startDate', new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
        setValue('endDate', new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Generate New Report</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Report Name */}
          <Input
            {...register('name')}
            label="Report Name"
            icon={<FileText />}
            error={errors.name?.message as string}
            placeholder="Monthly Expense Report - January 2024"
          />

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'monthly' as const, label: 'Monthly'},
                { value: 'quarterly' as const, label: 'Quarterly'},
                { value: 'yearly' as const, label: 'Yearly'},
                { value: 'custom' as const, label: 'Custom'},
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    watchedType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('startDate')}
              type="date"
              label="Start Date"
              icon={<Calendar />}
              error={errors.startDate?.message as string}
            />
            <Input
              {...register('endDate')}
              type="date"
              label="End Date"
              icon={<Calendar />}
              error={errors.endDate?.message as string}
            />
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Options</h3>
            <button
              type="button"
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Settings className="h-4 w-4 mr-1" />
              {isAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {/* Basic Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('includeCharts')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Include charts and visualizations
              </label>
            </div>
          </div>

          {/* Advanced Options */}
          {isAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Categories Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {categoriesData?.data?.categories?.map((category: any) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={category.id}
                        {...register('categories')}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                <select
                  {...register('groupBy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="category">Category</option>
                </select>
              </div>

              {/* Scheduling */}
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    {...register('isScheduled')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Schedule automatic generation
                  </label>
                </div>

                {watchedScheduled && (
                  <select
                    {...register('scheduleFrequency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                )}
              </div>
            </div>
          )}

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
              loading={createReport.isPending}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};