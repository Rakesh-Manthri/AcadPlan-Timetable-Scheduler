import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

import { Printer, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TimetableGrid = ({ courses = [] }) => {
  const handlePrint = () => {
    window.print();
  };

  // Logic to find if a slot has a course
  const getSlotCourse = (day, timeIdx) => {
    return courses.find(c => {
      const matchDay = c.day === day || c.day.startsWith(day);
      const sIdx = c.startTimeIdx !== undefined ? c.startTimeIdx : c.slot_idx;
      return matchDay && sIdx === timeIdx;
    });
  };

  // Logic to check if an index is part of a spanning course (Lab etc)
  const isPartOfSpan = (day, timeIdx) => {
    return courses.some(c => {
      const matchDay = c.day === day || c.day.startsWith(day);
      const sIdx = c.startTimeIdx !== undefined ? c.startTimeIdx : c.slot_idx;
      return matchDay && timeIdx > sIdx && timeIdx < sIdx + (c.span || 1);
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Timetable</h1>
          <p className="text-muted-foreground">Information Technology - Section B</p>
        </div>
        <div className="flex gap-4 no-print">
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Badge variant="outline" className="px-3 py-1 bg-secondary border-border">
            Academic Year: 2025-26
          </Badge>
          <Badge className="px-3 py-1 bg-primary text-primary-foreground">
            Semester: V
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <div className="min-w-[1000px] grid grid-cols-7 border-b border-border bg-muted/50">
          <div className="p-4 text-sm font-bold text-center border-r border-border">Time Slot</div>
          {DAYS.map((day) => (
            <div key={day} className="p-4 text-sm font-bold text-center border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="min-w-[1000px] grid grid-cols-7 relative">
          {TIME_SLOTS.map((slot, timeIdx) => (
            <React.Fragment key={slot}>
              {/* Time Column */}
              <div className="p-4 text-xs font-medium text-center bg-muted/30 border-r border-b border-border flex items-center justify-center">
                {slot}
              </div>

              {/* Day Columns */}
              {DAYS.map((day) => {
                const course = getSlotCourse(day, timeIdx);
                const spans = isPartOfSpan(day, timeIdx);
                const isLunch = timeIdx === 3;

                if (isLunch) {
                  return day === 'Mon' ? (
                    <div 
                      key={`${day}-${timeIdx}`} 
                      className="col-span-6 bg-secondary/30 p-4 border-b border-border flex items-center justify-center italic text-muted-foreground text-sm tracking-widest uppercase"
                    >
                      Lunch Break
                    </div>
                  ) : null;
                }

                if (spans) return null; // Skip rendering cells that are covered by a rowSpan-like logic

                return (
                  <div 
                    key={`${day}-${timeIdx}`} 
                    className={cn(
                      "group relative p-1 border-r border-b border-border last:border-r-0 min-h-[80px] transition-colors hover:bg-muted/10",
                      course?.span > 1 && `row-span-${course.span}`
                    )}
                    style={course?.span > 1 ? { gridRow: `span ${course.span} / span ${course.span}` } : {}}
                  >
                    {course ? (
                      <Card className={cn(
                        "h-full p-2 text-xs flex flex-col justify-between border shadow-sm transition-transform group-hover:scale-[1.02]",
                        course.isConflict 
                          ? "border-destructive bg-destructive/5 text-destructive-foreground ring-1 ring-destructive" 
                          : "border-border bg-card"
                      )}>
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-bold underline decoration-primary/30 underline-offset-2">
                              {course.subject}
                            </span>
                            {course.isConflict && (
                              <Badge variant="destructive" className="h-4 px-1 text-[8px] uppercase">
                                Conflict
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground font-medium">{course.faculty}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between opacity-80">
                          <span className="flex items-center gap-1 font-mono uppercase bg-secondary px-1 rounded">
                            {course.room}
                          </span>
                          <span className="italic">{course.type}</span>
                        </div>
                      </Card>
                    ) : (
                      <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-muted-foreground">
                        Empty Slot
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive shadow-sm" />
          <span>Constraint Violation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-card border shadow-sm" />
          <span>Normal Lecture</span>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
