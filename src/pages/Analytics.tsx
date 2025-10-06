import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { analyticsService } from '@/services/analyticsService';
import { useCategories } from '@/hooks/useExpenses';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

export const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedGroupBy, setSelectedGroupBy] = useState<'day' | 'week' | 'month' | 'category'>('month');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: categoriesData } = useCategories();
  
  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ['analytics-trends', selectedPeriod, selectedGroupBy, selectedCategories],
    queryFn: () => analyticsService.getTrends({
      period: selectedPeriod,
      groupBy: selectedGroupBy,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    }),
  });

  const { data: categoryData, isLoading: categoryLoading, refetch: refetchCategory } = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: () => analyticsService.getCategoryAnalysis(),
  });

  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: () => analyticsService.getSpendingInsights(),
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh all queries simultaneously
      await Promise.all([
        refetchTrends(),
        refetchCategory(),
        refetchInsights()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(value);
  };

  // Check if any initial loading is happening or refresh is in progress
  const isLoading = trendsLoading || categoryLoading || insightsLoading || isRefreshing;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Insights into your spending patterns and trends</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="form-input"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Group By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
              <select
                value={selectedGroupBy}
                onChange={(e) => setSelectedGroupBy(e.target.value as any)}
                className="form-input"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="category">Category</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {categoriesData?.data?.categories.map((category) => (
                  <label key={category.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trends Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            
            {trendsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : trendsData?.data?.trends ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedGroupBy === 'category' ? (
                    <BarChart data={trendsData.data.trends.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="key" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis tickFormatter={(value) => `${value.toFixed(0)}`} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  ) : (
                    <LineChart data={trendsData.data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="key" />
                      <YAxis tickFormatter={(value) => `${value.toFixed(0)}`} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No data available for the selected period</p>
              </div>
            )}
          </Card>

          {/* Category Analysis */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Category Analysis</h3>
              <PieChartIcon className="h-5 w-5 text-green-600" />
            </div>
            
            {categoryLoading ? (
              <div className="h-64 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : categoryData?.data?.analysis ? (
              <>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData.data.analysis.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="currentMonth.total"
                        nameKey="category.name"
                      >
                        {categoryData.data.analysis.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.category.color || COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {categoryData.data.analysis.slice(0, 4).map((category, index) => (
                    <div key={category.category.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.category.color || COLORS[index] }}
                        />
                        <span className="text-sm text-gray-600">{category.category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(category.currentMonth.total)}
                        </div>
                        <div className={`text-xs flex items-center ${
                          category.trends.totalChange >= 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {category.trends.totalChange >= 0 ? '↑' : '↓'} 
                          {Math.abs(category.trends.totalChange).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No category data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Insights Section */}
        {insightsData?.data?.insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Insights */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Period Comparison</h4>
                  <div className="text-sm text-blue-700">
                    <p>Current period: {formatCurrency(insightsData.data.insights.period.current.total)}</p>
                    <p>Previous period: {formatCurrency(insightsData.data.insights.period.previous.total)}</p>
                    <p className={`font-medium ${
                      insightsData.data.insights.period.change.total >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Change: {insightsData.data.insights.period.change.total >= 0 ? '+' : ''}
                      {insightsData.data.insights.period.change.total.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Weekday vs Weekend</h4>
                  <div className="text-sm text-green-700">
                    <p>Weekday spending: {formatCurrency(insightsData.data.insights.weekdayVsWeekend.weekday)}</p>
                    <p>Weekend spending: {formatCurrency(insightsData.data.insights.weekdayVsWeekend.weekend)}</p>
                    <p>Weekend ratio: {(insightsData.data.insights.weekdayVsWeekend.ratio * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Merchants & Unusual Spending */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants & Alerts</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Top Merchants</h4>
                  <div className="space-y-2">
                    {insightsData.data.insights.topMerchants.slice(0, 5).map((merchant, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{merchant.merchant}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(merchant.total)}</div>
                          <div className="text-xs text-gray-500">{merchant.count} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {insightsData.data.insights.unusual.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Unusual Activity</h4>
                    <div className="space-y-2">
                      {insightsData.data.insights.unusual.slice(0, 3).map((item, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="text-sm text-yellow-800">
                            <span className="font-medium">{item.type.replace('_', ' ')}</span>
                            <p>{item.description}</p>
                            {item.amount && (
                              <p className="font-medium">{formatCurrency(item.amount)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};