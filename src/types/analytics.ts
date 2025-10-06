export interface DashboardOverview {
  overview: {
    currentMonth: {
      total: number;
      count: number;
      average: number;
    };
    lastMonth: {
      total: number;
      count: number;
      average: number;
    };
    trends: {
      totalChange: number;
      countChange: number;
      avgChange: number;
      velocityChange: number;
    };
    velocity?: {
      recent7Days: number;
      previous7Days: number;
    };
  };
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    total: number;
    count: number;
    average: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    description: string;
    merchant?: string;
    transactionDate: string;
    category: {
      name: string;
      color: string;
      icon: string;
    };
  }>;
  budgetStatus: Array<{
    id: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    category: {
      name: string;
      color: string;
    };
    status: 'good' | 'caution' | 'critical' | 'exceeded';
  }>;
}

export interface TrendsData {
  trends: Array<{
    key: string;
    value: number;
    count: number;
    average?: number;
    color?: string;
    icon?: string;
  }>;
  groupBy: string;
  period: string;
  dateRange?: {
    gte: string;
    lte: string;
  };
}

export interface CategoryAnalysis {
  analysis: Array<{
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
    };
    currentMonth: {
      total: number;
      count: number;
      average: number;
      min: number;
      max: number;
    };
    historical: {
      total: number;
      count: number;
      average: number;
      monthlyAverage: number;
    };
    trends: {
      totalChange: number;
      isIncreasing: boolean;
      monthlyData: Array<{
        month: string;
        total: number;
        count: number;
      }>;
    };
    insights: string[];
  }>;
}

export interface BudgetPerformance {
  budgetPerformance: Array<{
    budget: {
      id: string;
      amount: number;
      period: string;
      startDate: string;
      endDate: string;
    };
    category: {
      name: string;
      color: string;
    };
    performance: {
      spent: number;
      remaining: number;
      percentage: number;
      transactionCount: number;
      averageTransaction: number;
    };
    timeline: {
      daysPassed: number;
      daysRemaining: number;
      totalDays: number;
      progressPercentage: number;
    };
    projection: {
      avgDailySpending: number;
      projectedTotal: number;
      projectedOverage: number;
      onTrack: boolean;
    };
    status: 'good' | 'caution' | 'critical' | 'exceeded';
  }>;
}

export interface SpendingInsights {
  insights: {
    period: {
      current: {
        total: number;
        count: number;
        average: number;
      };
      previous: {
        total: number;
        count: number;
        average: number;
      };
      change: {
        total: number;
        count: number;
        average: number;
      };
    };
    weekdayVsWeekend: {
      weekday: number;
      weekend: number;
      ratio: number;
    };
    topMerchants: Array<{
      merchant: string;
      total: number;
      count: number;
    }>;
    unusual: Array<{
      type: string;
      description: string;
      amount?: number;
      category?: string;
    }>;
  };
}