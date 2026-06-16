import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-50 border-slate-200 text-slate-600',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  warning: 'bg-amber-50 border-amber-200 text-amber-600',
  error: 'bg-red-50 border-red-200 text-red-600',
  info: 'bg-sky-50 border-sky-200 text-sky-600',
};

const iconBgStyles = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-sky-100 text-sky-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  variant = 'default',
  subtitle,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-5 shadow-sm hover:shadow transition-shadow',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'mt-2 inline-flex items-center text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-red-600'
            )}>
              <TrendingUp size={14} className={cn('mr-1', !trend.isPositive && 'rotate-180')} />
              {trend.value}%
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          iconBgStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};
