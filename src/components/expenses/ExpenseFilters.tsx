import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/useExpenses';
import type { ExpenseFilters as ExpenseFilterTypes } from '@/services/expenseService';

interface ExpenseFiltersProps {
  filters: ExpenseFilterTypes;
  onFiltersChange: (filters: ExpenseFilterTypes) => void;
  onClearFilters: () => void;
}

const paymentMethods = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
];

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { data: categoriesData } = useCategories();
  
  // Local state for form inputs
  const [localFilters, setLocalFilters] = useState<ExpenseFilterTypes>(filters);

  // Sync local state when filters prop changes (e.g., when clearing filters)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateLocalFilter = (key: keyof ExpenseFilterTypes, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const applyFilters = () => {
    onFiltersChange({
      ...localFilters,
      page: 1, // Reset to first page when applying filters
    });
  };

  const resetFilters = () => {
    const defaultFilters: ExpenseFilterTypes = {
      page: 1,
      limit: 20,
      sortBy: 'date',
      sortOrder: 'desc',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  // Check if local filters differ from applied filters
  const hasUnappliedChanges = JSON.stringify(localFilters) !== JSON.stringify(filters);

  const hasActiveFilters = Object.values(filters).some(
    (value, index) => {
      const keys = Object.keys(filters);
      // Ignore page and limit for "active filters" check
      if (keys[index] === 'page' || keys[index] === 'limit') return false;
      return value !== undefined && value !== '';
    }
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search descriptions, merchants..."
            value={localFilters.search || ''}
            onChange={(e) => updateLocalFilter('search', e.target.value)}
            icon={<Search />}
          />
        </div>

        {/* Date Range */}
        <div>
          <Input
            type="date"
            label="Start Date"
            value={localFilters.startDate || ''}
            onChange={(e) => updateLocalFilter('startDate', e.target.value)}
            icon={<Calendar />}
          />
        </div>

        <div>
          <Input
            type="date"
            label="End Date"
            value={localFilters.endDate || ''}
            onChange={(e) => updateLocalFilter('endDate', e.target.value)}
            icon={<Calendar />}
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="form-label">Category</label>
          <select
            value={localFilters.category || ''}
            onChange={(e) => updateLocalFilter('category', e.target.value)}
            className="form-input"
          >
            <option value="">All Categories</option>
            {categoriesData?.data?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="form-label">Payment Method</label>
          <select
            value={localFilters.paymentMethod || ''}
            onChange={(e) => updateLocalFilter('paymentMethod', e.target.value)}
            className="form-input"
          >
            <option value="">All Methods</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Range */}
        <div>
          <Input
            type="number"
            step="0.01"
            label="Min Amount"
            placeholder="0.00"
            value={localFilters.minAmount?.toString() || ''}
            onChange={(e) => updateLocalFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        <div>
          <Input
            type="number"
            step="0.01"
            label="Max Amount"
            placeholder="1000.00"
            value={localFilters.maxAmount?.toString() || ''}
            onChange={(e) => updateLocalFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="form-label">Sort By</label>
          <select
            value={localFilters.sortBy || 'date'}
            onChange={(e) => updateLocalFilter('sortBy', e.target.value)}
            className="form-input"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="merchant">Merchant</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div>
          <label className="form-label">Sort Order</label>
          <select
            value={localFilters.sortOrder || 'desc'}
            onChange={(e) => updateLocalFilter('sortOrder', e.target.value)}
            className="form-input"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {hasUnappliedChanges && (
            <span className="text-amber-600 font-medium">
              You have unsaved filter changes
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={applyFilters}
            disabled={!hasUnappliedChanges}
            className={hasUnappliedChanges ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};