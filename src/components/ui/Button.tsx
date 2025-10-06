import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200 hover:border-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md backdrop-blur-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl',
    ghost: 'text-gray-700 hover:bg-white/60 focus:ring-gray-500 backdrop-blur-sm',
    gradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <span className={`${position === 'left' ? 'mr-2' : 'ml-2'}`}>
        {icon}
      </span>
    );
  };

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect for gradient buttons */}
      {(variant === 'primary' || variant === 'gradient') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      )}
      
      {loading && (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      
      {!loading && renderIcon('left')}
      
      <span className="relative z-10 flex items-center">{children}</span>
      
      {!loading && renderIcon('right')}
    </button>
  );
};