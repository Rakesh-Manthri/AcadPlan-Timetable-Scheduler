import React, { useState, useEffect } from 'react';
import timetableService from '@/services/timetableService';
import { toast } from 'sonner';
import { Calendar, Users, BookOpen, AlertCircle, Download } from 'lucide-react';
import TimetableGrid from '@/components/dashboard/TimetableGrid';
import StatsCard from '@/components/dashboard/StatsCard';
import ConflictAlert from '@/components/dashboard/ConflictAlert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const dummyData = [
  { day: 'Mon', startTimeIdx: 0, subject: 'Operating Systems', faculty: 'Dr. Ramesh K', room: 'IT-201', type: 'Lecture' },
  { day: 'Mon', startTimeIdx: 1, subject: 'Compiler Design', faculty: 'Prof. Anitha', room: 'IT-201', type: 'Lecture' },
  { day: 'Mon', startTimeIdx: 5, subject: 'Database Systems', faculty: 'Dr. Suresh V', room: 'IT-202', type: 'Lecture', isConflict: true },
  
  { day: 'Tue', startTimeIdx: 0, subject: 'Network Security Lab', faculty: 'Prof. Kiran', room: 'Lab-1', type: 'Lab', span: 3 },
  
  { day: 'Wed', startTimeIdx: 2, subject: 'Web Technologies', faculty: 'Ms. Shruthi', room: 'IT-201', type: 'Lecture' },
  { day: 'Wed', startTimeIdx: 5, subject: 'Software Engineering', faculty: 'Dr. Mallesh', room: 'IT-202', type: 'Lecture' },

  { day: 'Thu', startTimeIdx: 0, subject: 'Full Stack Lab', faculty: 'Prof. Naveen', room: 'Lab-3', type: 'Lab', span: 3 },
  
  { day: 'Fri', startTimeIdx: 0, subject: 'AI & ML', faculty: 'Dr. Lakshmi', room: 'IT-201', type: 'Lecture' },
  { day: 'Fri', startTimeIdx: 1, subject: 'Mobile App Dev', faculty: 'Mr. Varun', room: 'IT-202', type: 'Lecture' },
];

const conflicts = [
  { subject: 'Database Systems', day: 'Mon', faculty: 'Dr. Suresh V', room: 'IT-202', time: '02:20 - 03:20' }
];

const DashboardPage = () => {
  const [timetable, setTimetable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchLatestTimetable();
  }, []);

  const fetchLatestTimetable = async () => {
    try {
      const response = await timetableService.getLatest();
      if (response.data) {
        setTimetable(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch latest timetable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast.promise(timetableService.generate(), {
      loading: 'Running CSP Backtracking Algorithm...',
      success: (response) => {
        setTimetable(response.data);
        return 'Timetable successfully generated!';
      },
      error: (err) => err.response?.data?.error || "Generation failed",
      finally: () => setIsGenerating(false)
    });
  };

  const scheduleData = timetable?.schedule || [];
  const lectureCount = scheduleData.filter(d => d.type === 'Lecture').length;
  const labCount = scheduleData.filter(d => d.type === 'Lab').length / 2; // Labs take 2 slots
  const totalHours = (lectureCount * 1) + (labCount * 2);
  const conflicts = []; // Backend currently generates conflict-free schedules or errors

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage and generate institutional schedules.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="border-primary text-primary hover:bg-primary/5"
          >
            {isGenerating ? 'Generating...' : 'Regenerate Schedule'}
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <StatsCard
          title="Scheduled Hours"
          value={totalHours}
          description="Total weekly hours"
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Lectures"
          value={lectureCount}
          description="Regular sessions"
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Lab Sessions"
          value={labCount}
          description="Practical sessions"
          icon={Calendar}
          trend={'+5%'}
        />
        <StatsCard
          title="Total Hours"
          value={totalHours}
          description="Weekly load"
          icon={BookOpen}
          variant="warning"
        />
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg">Scheduling Alerts</CardTitle>
              <Badge className="ml-auto bg-destructive text-destructive-foreground">
                {conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <CardDescription>Review and resolve scheduling conflicts</CardDescription>
          </CardHeader>
          <CardContent>
            <ConflictAlert conflicts={conflicts} />
          </CardContent>
        </Card>
      )}

      {/* Timetable Grid */}
      <div>
        {scheduleData.length > 0 ? (
          <TimetableGrid courses={scheduleData} />
        ) : (
          <Card className="border-dashed py-20 bg-muted/20">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-semibold mb-2">No Schedule Generated</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Define your Faculty and Room resources, then click generate to create an AI-optimized schedule.
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                Run Solver Engine
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Stats Footer */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 no-print">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{scheduleData.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Slots Filled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">--</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Rooms Free</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">--</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Faculty Load</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
