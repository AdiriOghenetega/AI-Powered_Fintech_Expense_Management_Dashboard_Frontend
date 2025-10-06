import React from 'react';
import { Plus, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useExpenses } from '@/hooks/useExpenses';
import { useNavigate } from 'react-router-dom';

// Define TypeScript interfaces for our data structures
interface Category {
  id: string;
  name: string;
  color: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  category: Category;
}

interface ExpensesData {
  expenses: Expense[];
  total: number;
  page: number;
  totalPages: number;
}

// Type for the API response - handling both possible formats
interface ExpensesApiResponse {
  data: ExpensesData;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const ExpenseSummary: React.FC = () => {
  const navigate = useNavigate();
  const { data: expensesResponse, isLoading } = useExpenses({
    limit: 5,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Type guard to check if response has 'data' property
  const hasDataProperty = (response: any): response is ExpensesApiResponse => {
    return response && typeof response === 'object' && 'data' in response && response.data;
  };

  // Type guard to check if response is direct expenses data
  const isExpensesData = (response: any): response is ExpensesData => {
    return response && typeof response === 'object' && 'expenses' in response && Array.isArray(response.expenses);
  };

  // Extract expenses data using type guards
  const expensesData: ExpensesData | null = React.useMemo(() => {
    if (!expensesResponse) return null;

    if (hasDataProperty(expensesResponse)) {
      return expensesResponse.data;
    }

    if (isExpensesData(expensesResponse)) {
      return expensesResponse;
    }

    return null;
  }, [expensesResponse]);

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i: number) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const expenses: Expense[] = expensesData?.expenses || [];
  const totalAmount: number = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/expenses')}
        >
          View All
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">No expenses yet</p>
          <Button size="sm" onClick={() => navigate('/expenses')}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last 5 transactions</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Recent transactions */}
          {expenses.map((expense: Expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: expense.category.color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {expense.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(expense.transactionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate('/expenses')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Manage All Expenses
          </Button>
        </div>
      )}
    </Card>
  );
};