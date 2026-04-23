import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const ConflictAlert = ({ conflicts = [] }) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="font-medium text-sm">No scheduling conflicts detected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict, idx) => (
        <Card key={idx} className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">
                  Conflict {idx + 1}: {conflict.subject}
                </h4>
                <p className="text-xs text-muted-foreground space-y-1">
                  <div>Day: <span className="font-medium text-foreground">{conflict.day}</span></div>
                  <div>Faculty: <span className="font-medium text-foreground">{conflict.faculty}</span></div>
                  <div>Room: <span className="font-medium text-foreground">{conflict.room}</span></div>
                  <div>Time: <span className="font-medium text-foreground">{conflict.time}</span></div>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConflictAlert;
