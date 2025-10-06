import React, { useState, useEffect, useRef } from 'react';
import { Plus, AlertCircle, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseFilters } from './ExpenseFilters';
import { 
  useExpenses, 
  useDeleteExpense, 
  useCategorizeExpense 
} from '@/hooks/useExpenses';
import type { Expense } from '@/types/expense';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { ExpenseFilters as ExpenseFiltersType } from '@/services/expenseService';

// Define the expected response structure
interface ExpensesListData {
  expenses: Expense[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export const ExpenseList: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFiltersType>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Add state for search input value (separate from filters)
  const [searchInput, setSearchInput] = useState<string>('');
  
  // Add ref for debounce timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: expensesResponse, isLoading, error } = useExpenses(filters);
  const deleteExpense = useDeleteExpense();
  const categorizeExpense = useCategorizeExpense();

  // Type guard to check if response has 'data' property
  const hasDataProperty = (response: any): response is ApiResponse<ExpensesListData> => {
    return response && typeof response === 'object' && 'data' in response && response.data;
  };

  // Type guard to check if response has paginated structure
  const isPaginatedResponse = (response: any): response is PaginatedResponse<Expense> => {
    return response && typeof response === 'object' && 'items' in response && 'pagination' in response;
  };

  // Type guard to check if response is direct expenses data
  const isExpensesListData = (response: any): response is ExpensesListData => {
    return response && typeof response === 'object' && 'expenses' in response && Array.isArray(response.expenses);
  };

  // Extract expenses data using type guards
  const expensesData: ExpensesListData | null = React.useMemo(() => {
    if (!expensesResponse) return null;

    // Handle ApiResponse<ExpensesListData> format
    if (hasDataProperty(expensesResponse)) {
      return expensesResponse.data || null;
    }

    // Handle PaginatedResponse format
    if (isPaginatedResponse(expensesResponse)) {
      return {
        expenses: expensesResponse.items,
        pagination: expensesResponse.pagination
      };
    }

    // Handle direct ExpensesListData format
    if (isExpensesListData(expensesResponse)) {
      return expensesResponse;
    }

    return null;
  }, [expensesResponse]);

  // Listen for floating action button events
  useEffect(() => {
    const handleOpenForm = () => setShowForm(true);
    window.addEventListener('openExpenseForm', handleOpenForm);
    return () => window.removeEventListener('openExpenseForm', handleOpenForm);
  }, []);

  // Debounce effect for search
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ 
        ...prev, 
        search: searchInput || undefined, // Use undefined if empty to remove the filter
        page: 1 // Reset to first page when searching
      }));
    }, 500); // 500ms delay - you can adjust this value

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const handleEdit = (expense: Expense): void => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleCategorize = async (id: string): Promise<void> => {
    try {
      await categorizeExpense.mutateAsync(id);
    } catch (error) {
      console.error('Failed to categorize expense:', error);
    }
  };

  const handleCloseForm = (): void => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handlePageChange = (newPage: number): void => {
    setFilters({ ...filters, page: newPage });
  };

  const clearFilters = (): void => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    // Also clear search input
    setSearchInput('');
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchInput(e.target.value);
  };

  const handleFilterToggle = (): void => {
    setSearchInput("")
    setShowFilters(!showFilters)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="mb-8 slide-in-from-left">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2 skeleton"></div>
            <div className="h-4 w-72 bg-gray-200 rounded skeleton"></div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="mb-6">
            <Card>
              <div className="h-24 skeleton rounded-xl"></div>
            </Card>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i: number) => (
              <Card key={i} className="stagger-item">
                <div className="h-32 skeleton rounded-xl"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center scale-in">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading expenses</h2>
          <p className="text-gray-600 mb-6">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const expenses: Expense[] = expensesData?.expenses || [];
  const pagination = expensesData?.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Enhanced Header */}
        <div className="slide-in-from-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                <p className="text-gray-600 mt-1">Manage and track your expenses</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="secondary" 
                onClick={handleFilterToggle}
                icon={<Filter className="h-4 w-4" />}
                className="flex"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button 
               variant='gradient'
                onClick={() => setShowForm(true)}
                icon={<Plus className="h-4 w-4" />}
                className="flex"
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        <div className={`transition-all duration-500 ease-in-out ${
          showFilters ? 'opacity-100 max-h-96 mb-[600px] md:mb-18' : 'opacity-0 max-h-0 overflow-hidden'
        }`}>
          <div className="slide-in-from-top">
            <ExpenseFilters 
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="slide-in-from-right">
          <Card variant="glass" className="backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
                  <p className="text-sm text-gray-600">Showing</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{pagination?.totalCount || 0}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                {pagination && pagination.totalCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ₦{expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Current Page Total</p>
                  </div>
                )}
              </div>
              
              {/* Quick search on mobile */}
              <div className="mt-4 sm:mt-0 sm:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                    value={searchInput}
                    onChange={handleSearchChange}
                  />
                  {/* Optional: Show loading indicator while debouncing */}
                  {searchInput !== (filters.search || '') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Expense List */}
        {expenses.length === 0 ? (
          <div className="scale-in">
            <Card variant="elevated" className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No expenses found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {Object.keys(filters).length > 2 
                  ? "Try adjusting your filters or add your first expense." 
                  : "Get started by adding your first expense to track your spending."
                }
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                icon={<Plus className="h-4 w-4" />}
                variant="gradient"
                size="lg"
              >
                Add Your First Expense
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense: Expense, index: number) => (
              <div 
                key={expense.id} 
                className="stagger-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ExpenseCard
                  expense={expense}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCategorize={handleCategorize}
                />
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="slide-in-from-bottom">
            <Card variant="glass" className="backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages} 
                  <span className="hidden sm:inline"> • {pagination.totalCount} total expenses</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="hidden sm:flex"
                  >
                    First
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="hidden sm:flex items-center space-x-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i: number) => {
                      const page = Math.max(1, pagination.currentPage - 2) + i;
                      if (page > pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-gray-600 hover:bg-white/60'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="hidden sm:flex"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Loading states for mutations */}
        {(deleteExpense.isPending || categorizeExpense.isPending) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <Card variant="elevated" className="p-8">
              <div className="flex items-center space-x-4">
                <LoadingSpinner variant="gradient" />
                <span className="font-medium text-gray-900">
                  {deleteExpense.isPending ? 'Deleting expense...' : 'Categorizing expense...'}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense || undefined}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}
    </div>
  );
};