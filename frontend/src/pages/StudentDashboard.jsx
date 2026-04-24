import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import scheduleService from '@/services/timetableService';
import TimetableGrid from '@/components/dashboard/TimetableGrid';

const StudentDashboard = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchActiveSchedule();
  }, []);

  const fetchActiveSchedule = async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getVersions('IT');
      const activeVersions = res.data?.filter(v => v.status === 'approved') || [];
      if (activeVersions.length > 0) {
        // Take the latest approved version
        const latest = activeVersions[0];
        setSchedule(latest);
        
        // Set default section if available
        const sections = Object.keys(latest.result || {});
        if (sections.length > 0) {
          setSelectedSection(sections[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading timetable...</div>;
  if (!schedule) return (
    <div className="p-12 text-center">
      <h2 className="text-2xl font-bold text-muted-foreground">No Official Schedule Published</h2>
      <p className="mt-2 text-muted-foreground">Please check back later once the HOD has approved the department timetable.</p>
    </div>
  );

  const sections = Object.keys(schedule.result || {});
  const courses = schedule.result?.[selectedSection] || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Timetable</h1>
          <p className="text-muted-foreground">Viewing official department schedule</p>
        </div>
        <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-sm font-bold">OFFICIAL</Badge>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Select Section</CardTitle>
          <CardDescription>Click on a section to view its weekly timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sections.sort().map(sec => (
              <Button 
                key={sec} 
                variant={selectedSection === sec ? 'default' : 'outline'}
                onClick={() => setSelectedSection(sec)}
                className="min-w-[80px]"
              >
                {sec}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          {courses.length > 0 ? (
            <TimetableGrid 
              courses={courses} 
              readOnly={true}
              title={`Academic Timetable - Section: ${selectedSection}`}
            />
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              Select a section above to see the timetable.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
