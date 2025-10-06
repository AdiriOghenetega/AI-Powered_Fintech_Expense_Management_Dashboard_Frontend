export interface Budget {
  id: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  status: 'good' | 'caution' | 'critical' | 'exceeded';
  transactions: number;
  averageTransaction: number;
  projection: {
    estimatedTotal: number;
    daysRemaining: number;
    dailyAverage: number;
    onTrack: boolean;
  };
}

export interface CreateBudgetData {
  categoryId: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate?: string;
}

export interface BudgetAlert {
  budgetId: string;
  categoryName: string;
  type: 'approaching' | 'exceeded' | 'projection';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface BudgetStats {
  totalBudgets: number;
  totalBudgetAmount: number;
  totalSpent: number;
  onTrackBudgets: number;
  exceededBudgets: number;
}