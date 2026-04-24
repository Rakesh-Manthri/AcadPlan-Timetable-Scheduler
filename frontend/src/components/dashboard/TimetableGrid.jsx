import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Printer, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
  '09:40 - 10:40',
  '10:40 - 11:40',
  '11:40 - 12:40',
  '12:40 - 01:20', // Lunch
  '01:20 - 02:20',
  '02:20 - 03:20',
  '03:20 - 04:20',
];

const TimetableGrid = ({ courses = [], readOnly = false, highlightBatch = null, title = null }) => {
  const handlePrint = () => {
    window.print();
  };

  // Map grid timeIdx (0-6, with 3=lunch) to solver slot_idx (0-5, no lunch)
  const gridToSolverIdx = (timeIdx) => {
    if (timeIdx < 3) return timeIdx;       // First half: 0,1,2
    if (timeIdx === 3) return -1;           // Lunch break
    return timeIdx - 1;                     // Second half: 4->3, 5->4, 6->5
  };

  // Logic to find if a slot has a course
  const getSlotCourse = (day, timeIdx) => {
    const solverIdx = gridToSolverIdx(timeIdx);
    if (solverIdx === -1) return null;
    return courses.find(c => {
      const matchDay = c.day === day || c.day.startsWith(day);
      const sIdx = c.startTimeIdx !== undefined ? c.startTimeIdx : c.slot_idx;
      return matchDay && sIdx === solverIdx;
    });
  };

  // Logic to check if an index is part of a spanning course (Lab etc)
  const isPartOfSpan = (day, timeIdx) => {
    const solverIdx = gridToSolverIdx(timeIdx);
    if (solverIdx === -1) return false;
    return courses.some(c => {
      const matchDay = c.day === day || c.day.startsWith(day);
      const sIdx = c.startTimeIdx !== undefined ? c.startTimeIdx : c.slot_idx;
      return matchDay && solverIdx > sIdx && solverIdx < sIdx + (c.span || 1);
    });
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      {title && (
        <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-widest">{title}</h1>
        </div>
      )}
      <div className="mb-6 flex items-center justify-between no-print">
        <div>
          <h2 className="text-xl font-bold text-foreground">Weekly Grid</h2>
          <p className="text-sm text-muted-foreground">Orientation: Days (Vertical) × Time (Horizontal)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-lg" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-lg print:border-none print:shadow-none">
        <div className="min-w-[1200px]">
          {/* Header Row: Time Slots */}
          <div className="grid grid-cols-8 border-b border-border bg-muted/40">
            <div className="p-4 text-xs font-bold uppercase tracking-wider text-center border-r border-border bg-muted/50">
              Day / Time
            </div>
            {TIME_SLOTS.map((slot, idx) => (
              <div 
                key={slot} 
                className={cn(
                  "p-4 text-[10px] font-bold text-center border-r border-border last:border-r-0 flex flex-col items-center justify-center gap-1",
                  idx === 3 && "bg-secondary/20 text-secondary-foreground"
                )}
              >
                <span className="text-muted-foreground uppercase text-[8px] font-black">Slot {idx + 1}</span>
                {slot}
              </div>
            ))}
          </div>

          {/* Data Rows: Days */}
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-8 border-b border-border last:border-b-0">
              {/* Day Name Column */}
              <div className="p-4 bg-muted/30 border-r border-border flex items-center justify-center">
                <span className="text-sm font-black uppercase tracking-widest rotate-0 lg:-rotate-90 lg:whitespace-nowrap">
                  {day}
                </span>
              </div>

              {/* Time Slots for the Day */}
              {TIME_SLOTS.map((slot, timeIdx) => {
                const isLunch = timeIdx === 3;
                const course = getSlotCourse(day, timeIdx);
                const spans = isPartOfSpan(day, timeIdx);

                if (isLunch) {
                  return (
                    <div 
                      key={`${day}-${timeIdx}`} 
                      className="bg-secondary/10 border-r border-border last:border-r-0 p-4 flex items-center justify-center overflow-hidden"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 whitespace-nowrap rotate-0">
                        LUNCH
                      </div>
                    </div>
                  );
                }

                if (spans) return null;

                return (
                  <div 
                    key={`${day}-${timeIdx}`} 
                    className={cn(
                      "relative p-1 border-r border-border last:border-r-0 min-h-[100px] transition-colors hover:bg-muted/5 group",
                      course?.span > 1 && `col-span-${course.span}`
                    )}
                    style={course?.span > 1 ? { gridColumn: `span ${course.span} / span ${course.span}` } : {}}
                  >
                    {course ? (
                      <Card className={cn(
                        "h-full p-2.5 text-[11px] flex flex-col justify-between border-2 shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30",
                        course.isConflict 
                          ? "border-destructive bg-destructive/5 text-destructive ring-1 ring-destructive/20" 
                          : "border-border/50 bg-card",
                        highlightBatch && course.subject?.includes(highlightBatch) && "border-primary bg-primary/5 ring-1 ring-primary",
                        highlightBatch && (course.subject?.includes('B1') || course.subject?.includes('B2')) && !course.subject?.includes(highlightBatch) && "opacity-30 grayscale"
                      )}>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-extrabold leading-tight">
                              {course.subject}
                            </span>
                            {course.isConflict && (
                              <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-semibold line-clamp-1">{course.faculty}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between gap-1">
                          <Badge variant="secondary" className="h-4 px-1 text-[9px] font-mono rounded-sm">
                            {course.room}
                          </Badge>
                          <span className="text-[9px] italic text-muted-foreground font-medium uppercase tracking-tighter">
                            {course.type}
                          </span>
                        </div>
                      </Card>
                    ) : (
                      <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-muted-foreground uppercase font-black tracking-widest transition-opacity">
                        FREE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground no-print">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/10 border-2 border-destructive" />
          <span>Constraint Conflict</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border-2 border-border" />
          <span>Lecture / Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary/10 border border-border" />
          <span>Recess / Lunch</span>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
