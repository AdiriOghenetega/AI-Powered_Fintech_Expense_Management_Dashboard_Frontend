import React from 'react';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Budget } from '@/types/budget';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'caution': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'exceeded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'critical': return 'bg-orange-500';
      case 'exceeded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPeriod = (period: string) => {
    return period.charAt(0) + period.slice(1).toLowerCase();
  };

  const getCategoryIcon = (): string => {
    return '📁';
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: budget.category.color + '20' }}
          >
            <span style={{ color: budget.category.color }}>
              {getCategoryIcon()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{budget.category.name}</h3>
            <p className="text-sm text-gray-500">{formatPeriod(budget.period)} Budget</p>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(budget.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Budget Amount */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">
            ₦{budget.spent.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            / ₦{budget.budgetAmount.toFixed(2)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(budget.status)}`}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
            {budget.percentage.toFixed(1)}% used
          </span>
          <span className="text-gray-600">
            ₦{budget.remaining.toFixed(2)} remaining
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Transactions</p>
          <p className="font-semibold text-gray-900">{budget.transactions}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average</p>
          <p className="font-semibold text-gray-900">
            ₦{budget.averageTransaction.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Projection */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Projected total:</span>
          <span className={`font-medium ${
            budget.projection.onTrack ? 'text-green-600' : 'text-red-600'
          }`}>
            ₦{budget.projection.estimatedTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{budget.projection.daysRemaining} days remaining</span>
        </div>
      </div>
    </Card>
  );
};