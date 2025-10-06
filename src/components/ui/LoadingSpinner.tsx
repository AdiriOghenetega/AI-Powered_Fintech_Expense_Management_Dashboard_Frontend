import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'gradient' | 'pulse' | 'dots';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '',
  variant = 'default',
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const containerClasses = `flex flex-col items-center justify-center ${className}`;

  const renderSpinner = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full animate-spin">
              <div className="absolute inset-1 bg-white rounded-full" />
            </div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-full" />
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} bg-blue-600 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      default:
        return (
         <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-full" />
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};