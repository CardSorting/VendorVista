/**
 * Metrics Card Component - Apple-inspired card design
 * Emphasizes clarity, visual hierarchy, and meaningful data presentation
 */

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function MetricsCard({ title, value, icon, trend, className = '' }: MetricsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <TrendingUp className="h-3 w-3 text-emerald-600" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.value > 0) return 'text-emerald-600';
    if (trend.value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatTrendValue = () => {
    if (!trend) return '';
    
    const abs = Math.abs(trend.value);
    const sign = trend.value >= 0 ? '+' : '-';
    return `${sign}${abs.toFixed(1)}%`;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md border-gray-200/60 bg-white/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 tracking-wide">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <div className={`flex items-center space-x-1 text-xs font-medium ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{formatTrendValue()}</span>
                  <span className="text-gray-500">{trend.label}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50/80">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}