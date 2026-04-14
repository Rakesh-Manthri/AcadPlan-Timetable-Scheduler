import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Pencil, Trash2, CalendarRange } from 'lucide-react';

const mockFaculty = [
  { id: 1, name: 'Dr. Ramesh Kumar', department: 'IT', specialization: 'Operating Systems', loads: '14 hrs/week', status: 'Available' },
  { id: 2, name: 'Prof. Anitha Reddy', department: 'IT', specialization: 'Compiler Design', loads: '12 hrs/week', status: 'Full' },
  { id: 3, name: 'Dr. Suresh Varma', department: 'IT', specialization: 'Database Systems', loads: '16 hrs/week', status: 'Conflict' },
  { id: 4, name: 'Ms. Shruthi Singh', department: 'CSE', specialization: 'Web Technologies', loads: '10 hrs/week', status: 'Available' },
];

const FacultyPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground">Detailed list of faculty members and their teaching assignments.</p>
        </div>
        <Button className="font-semibold px-4 flex gap-2">
          <Plus className="h-4 w-4" /> Add Faculty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Faculty</CardTitle>
            <div className="text-2xl font-bold">24</div>
          </CardHeader>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Avg. Load</CardTitle>
            <div className="text-2xl font-bold">13.5 hrs</div>
          </CardHeader>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Constraint Matches</CardTitle>
            <div className="text-2xl font-bold text-green-600">92%</div>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Department Faculty</CardTitle>
          <CardDescription>Manage availability and specializations for the current semester.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/50 rounded-t-lg">
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Weekly Load</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFaculty.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{member.name}</TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{member.specialization}</Badge>
                  </TableCell>
                  <TableCell>{member.loads}</TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "px-2 py-0.5",
                        member.status === 'Available' ? "bg-green-100 text-green-800 hover:bg-green-100" :
                        member.status === 'Conflict' ? "bg-red-100 text-red-800 hover:bg-red-100" :
                        "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      )}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                        <CalendarRange className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper for cn in this file specifically if needed or import from utils
import { cn } from '@/lib/utils';

export default FacultyPage;
