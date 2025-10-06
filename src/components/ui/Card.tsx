import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true,
  variant = 'default',
  hover = false,
  onClick
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-lg hover:bg-white/80',
    elevated: 'bg-white/80 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20',
    bordered: 'bg-white border-2 border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md',
  };

  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : '';
  const paddingClasses = padding ? 'p-6' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${paddingClasses} ${clickableClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};