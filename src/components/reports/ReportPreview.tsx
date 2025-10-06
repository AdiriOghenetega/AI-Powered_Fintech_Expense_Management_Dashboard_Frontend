import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,  
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useReportData } from '@/hooks/useReports';
import type { Report } from '@/types/report';

interface ReportPreviewProps {
  parameters: Report['parameters'];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const ReportPreview: React.FC<ReportPreviewProps> = ({ parameters }) => {
  const { data, isLoading, error } = useReportData(parameters);

  if (isLoading) {
    return (
      <Card>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <div className="h-96 flex items-center justify-center text-gray-500">
          <p>Unable to load report preview</p>
        </div>
      </Card>
    );
  }

  const reportData = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(reportData.summary.totalExpenses)}
            </div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {reportData.summary.transactionCount}
            </div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(reportData.summary.averageTransaction)}
            </div>
            <div className="text-sm text-gray-600">Average Transaction</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {new Date(reportData.summary.dateRange.endDate).getDate() - 
               new Date(reportData.summary.dateRange.startDate).getDate() + 1}
            </div>
            <div className="text-sm text-gray-600">Days</div>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      {parameters.includeCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown Pie Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="total"
                    nameKey="categoryName"
                  >
                    {reportData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {reportData.categoryBreakdown.slice(0, 5).map((category) => (
                <div key={category.categoryName} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-600">{category.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Trends Line Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => formatDate(value)}
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                    labelFormatter={(value) => formatDate(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Top Merchants */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants</h3>
        <div className="space-y-3">
          {reportData.topMerchants.slice(0, 10).map((merchant, index) => (
            <div key={merchant.merchant} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{merchant.merchant}</div>
                  <div className="text-xs text-gray-500">{merchant.count} transactions</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(merchant.total)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-4">
          {reportData.paymentMethods.map((method) => (
            <div key={method.method} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{method.method}</span>
                <span className="text-sm text-gray-500">
                  {formatCurrency(method.total)} ({method.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${method.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
