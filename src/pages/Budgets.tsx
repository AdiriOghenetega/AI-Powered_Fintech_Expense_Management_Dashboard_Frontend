import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useBudgets, useBudgetStats, useBudgetAlerts, useDeleteBudget } from '@/hooks/useBudgets';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import type { Budget } from '@/types/budget';

export const BudgetsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const { data: budgetsData, isLoading } = useBudgets();
  const { data: statsData } = useBudgetStats();
  const { data: alertsData } = useBudgetAlerts();
  const deleteBudget = useDeleteBudget();

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const budgets = budgetsData?.data?.budgets || [];
  const stats = statsData?.data?.stats;
  const alerts = alertsData?.data?.alerts || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600 mt-1">Manage your spending limits and track progress</p>
          </div>
          <Button variant='gradient' onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBudgets}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="px-4 py-2 rounded-lg bg-green-50 text-green-600 mr-4 text-3xl">
                  ₦
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₦{stats.totalBudgetAmount.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₦{stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-50 text-orange-600 mr-4">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">On Track</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.onTrackBudgets}/{stats.totalBudgets}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Budget Alerts</h3>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'error' ? 'bg-red-50 border-red-400' :
                    alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.categoryName}</h4>
                      <p className={`text-sm ${
                        alert.severity === 'error' ? 'text-red-700' :
                        alert.severity === 'warning' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'error' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Budgets Grid */}
        {budgets.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first budget to start tracking your spending limits.
              </p>
              <Button variant='gradient' onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Budget Form Modal */}
        {showForm && (
          <BudgetForm
            budget={editingBudget || undefined}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
};