export interface Report {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  parameters: {
    startDate: string;
    endDate: string;
    categories?: string[];
    includeCharts?: boolean;
    groupBy?: string;
  };
  generatedAt: string;
  filePath?: string;
  isScheduled: boolean;
  scheduleConfig?: {
    frequency: 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  status: 'pending' | 'generating' | 'completed' | 'failed';
  fileSize?: number;
  downloadCount?: number;
}

export interface ReportData {
  summary: {
    totalExpenses: number;
    transactionCount: number;
    averageTransaction: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
  categoryBreakdown: Array<{
    categoryName: string;
    total: number;
    count: number;
    percentage: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    total: number;
    count: number;
  }>;
  topMerchants: Array<{
    merchant: string;
    total: number;
    count: number;
  }>;
  paymentMethods: Array<{
    method: string;
    total: number;
    count: number;
    percentage: number;
  }>;
}

export interface CreateReportRequest {
  name: string;
  type: Report['type'];
  parameters: Report['parameters'];
  isScheduled?: boolean;
  scheduleConfig?: Report['scheduleConfig'];
}
