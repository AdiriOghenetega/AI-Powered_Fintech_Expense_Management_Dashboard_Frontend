import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Bot, 
  MapPin, 
  Calendar, 
  CreditCard,
  Tag,
  MoreHorizontal,
  Receipt,
  Repeat,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Expense } from '@/types/expense';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onCategorize: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ 
  expense, 
  onEdit, 
  onDelete, 
  onCategorize 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    onEdit(expense);
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDelete(expense.id);
    }
    setShowActions(false);
  };

  const handleCategorize = () => {
    onCategorize(expense.id);
    setShowActions(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryIcon = () => {
    return '📁';
  };

  const getAmountColor = (amount: number) => {
    if (amount > 1000) return 'text-red-600';
    if (amount > 500) return 'text-orange-600';
    if (amount > 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card 
      variant="elevated" 
      className="hover-lift relative overflow-hidden group transition-all duration-300"
      onClick={() => setShowActions(false)}
    >
      {/* Gradient overlay for high amounts */}
      {expense.amount > 1000 && (
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-bl from-red-500/5 to-transparent rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16" />
      )}
      
      {/* Mobile-first Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div 
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
            style={{ backgroundColor: expense.category.color + '20' }}
          >
            <span className="text-lg sm:text-2xl">
              {getCategoryIcon()}
            </span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title and amount on mobile */}
            <div className="flex items-start justify-between mb-1 sm:block">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate flex-1 mr-2 sm:mr-0">
                {expense.description}
              </h3>
              {/* Amount moved to top on mobile */}
              <div className={`text-lg sm:text-xl font-bold ${getAmountColor(expense.amount)} sm:hidden flex-shrink-0`}>
                ₦{expense.amount.toFixed(2)}
              </div>
            </div>
            
            {/* Category and badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm mb-1 sm:mb-0">
              <span 
                className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold border"
                style={{ 
                  backgroundColor: expense.category.color + '15',
                  color: expense.category.color,
                  borderColor: expense.category.color + '30'
                }}
              >
                {expense.category.name}
              </span>
              
              {expense.isRecurring && (
                <span className="flex items-center text-blue-600 bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                  <Repeat className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Recurring</span>
                  <span className="sm:hidden">Rec</span>
                </span>
              )}
              
              {expense.aiConfidence && (
                <span className="flex items-center text-purple-600 bg-purple-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">AI: {(expense.aiConfidence * 100).toFixed(0)}%</span>
                  <span className="sm:hidden">{(expense.aiConfidence * 100).toFixed(0)}%</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop amount and actions */}
        <div className="hidden sm:flex text-right flex-col items-end space-y-2">
          <div className={`text-xl font-bold ${getAmountColor(expense.amount)}`}>
            ₦{expense.amount.toFixed(2)}
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl py-2 z-20 min-w-[140px] scale-in">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-3 text-blue-600" />
                  Edit
                </button>
                <button
                  onClick={handleCategorize}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors duration-200"
                >
                  <Bot className="h-4 w-4 mr-3 text-purple-600" />
                  Re-categorize
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile actions button */}
        <div className="sm:hidden relative flex-shrink-0 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1.5 h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl py-2 z-20 min-w-[140px] scale-in">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-3 text-blue-600" />
                Edit
              </button>
              <button
                onClick={handleCategorize}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition-colors duration-200"
              >
                <Bot className="h-4 w-4 mr-3 text-purple-600" />
                Re-categorize
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-optimized Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm mb-3 sm:mb-4">
        {/* Primary details - always visible */}
        <div className="flex items-center text-gray-600 space-x-2">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm">{formatDate(expense.transactionDate)}</span>
        </div>
        
        <div className="flex items-center text-gray-600 space-x-2">
          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm">{formatPaymentMethod(expense.paymentMethod)}</span>
        </div>

        {/* Secondary details - more space efficient on mobile */}
        {expense.merchant && (
          <div className="flex items-center text-gray-600 space-x-2 sm:col-span-1">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium text-xs sm:text-sm">{expense.merchant}</span>
          </div>
        )}

        {expense.receiptUrl && (
          <div className="flex items-center text-gray-600 space-x-2">
            <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            <a 
              href={expense.receiptUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors duration-200 text-xs sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Receipt</span>
              <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Tags - mobile optimized */}
      {expense.tags && expense.tags.length > 0 && (
        <div className="flex items-start space-x-2 mb-3 sm:mb-4">
          <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {expense.tags.map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes - mobile optimized */}
      {expense.notes && (
        <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-50/80 rounded-xl border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">{expense.notes}</p>
        </div>
      )}

      {/* Footer - mobile optimized */}
      <div className="pt-3 sm:pt-4 border-t border-gray-100">
        {/* Mobile: Stack vertically */}
        <div className="flex flex-col space-y-1 sm:hidden text-xs text-gray-400">
          <span>Created {formatDate(expense.createdAt)}</span>
          {expense.updatedAt && (
            <span className="flex items-center space-x-1">
              <Edit className="h-2.5 w-2.5" />
              <span>Updated {formatDate(expense.updatedAt)}</span>
            </span>
          )}
        </div>
        
        {/* Desktop: Side by side */}
        <div className="hidden sm:flex justify-between items-center text-xs text-gray-400">
          <span>Created {formatDate(expense.createdAt)}</span>
          {expense.updatedAt && (
            <span className="flex items-center space-x-1">
              <Edit className="h-3 w-3" />
              <span>Updated {formatDate(expense.updatedAt)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Click overlay to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActions(false)}
        />
      )}
    </Card>
  );
};