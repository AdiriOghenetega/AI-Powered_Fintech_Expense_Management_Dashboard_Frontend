import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface SummaryCardProps {
  title: string;
  amount: number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  isCount?: boolean;
  trend?: 'spending' | 'income' | 'neutral';
  showIcon?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  amount, 
  change, 
  icon, 
  color = 'blue',
  isCount = false,
  trend = 'neutral',
  showIcon = true
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
  };

  const getChangeColor = (): string => {
    if (change === undefined) return 'text-gray-500';
    if (trend === 'spending') {
      return change >= 0 ? 'text-red-600' : 'text-green-600';
    }
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    
    if (trend === 'spending') {
      return change >= 0 ? ArrowUpRight : ArrowDownRight;
    }
    return change >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  const ChangeIcon = getChangeIcon();

  return (
    <Card className="hover-lift relative overflow-hidden">
      <div 
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full -mr-16 -mt-16`}
      />
      
      <div className="relative flex items-center space-x-4">
        {showIcon && icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {isCount ? amount.toLocaleString() : `₦${amount.toFixed(2)}`}
          </p>
          {change !== undefined && (
            <div className={`flex items-center text-sm mt-2 ${getChangeColor()}`}>
              {ChangeIcon && <ChangeIcon className="h-4 w-4 mr-1" />}
              <span className="font-semibold">
                {change >= 0 ? '+' : ''}{Math.abs(change).toFixed(1)}% vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};