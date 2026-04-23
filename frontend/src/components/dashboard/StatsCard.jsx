import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'default',
  trend,
  trendDirection = 'up'
}) => {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-green-500/5 border-green-500/20',
    warning: 'bg-yellow-500/5 border-yellow-500/20',
    destructive: 'bg-red-500/5 border-red-500/20',
  };

  return (
    <Card className={cn("border", variants[variant])}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <Badge variant="outline" className={cn(
                  "text-xs",
                  trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {trendDirection === 'up' ? '↑' : '↓'} {trend}
                </Badge>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {Icon && (
            <div className="p-3 rounded-lg bg-muted/50">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
