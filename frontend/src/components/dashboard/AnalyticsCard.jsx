import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AnalyticsCard = ({ 
  title, 
  current, 
  previous, 
  unit = '',
  icon: Icon,
}) => {
  const change = current - previous;
  const changePercent = previous !== 0 ? ((change / previous) * 100).toFixed(1) : 0;
  const isPositive = change >= 0;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold">{current}{unit}</p>
            <p className="text-xs text-muted-foreground mt-1">
              vs {previous}{unit} last period
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <Badge variant="outline" className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '↑' : '↓'} {Math.abs(changePercent)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
