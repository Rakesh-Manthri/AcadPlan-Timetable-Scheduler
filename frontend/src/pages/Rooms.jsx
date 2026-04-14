import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Monitor, Users, MoreVertical } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const mockRooms = [
  { id: 'IT-201', type: 'Lecture Hall', capacity: 60, facilities: ['Projector', 'AC'], status: 'Allotted' },
  { id: 'IT-202', type: 'Lecture Hall', capacity: 60, facilities: ['Projector'], status: 'Available' },
  { id: 'Lab-1', type: 'Computer Lab', capacity: 35, facilities: ['60 PCs', 'High-Speed Internet'], status: 'Full' },
  { id: 'Lab-3', type: 'Specialized Lab', capacity: 30, facilities: ['IoT Kits', 'Server Access'], status: 'Maintenance' },
  { id: 'Auditorium', type: 'Large Hall', capacity: 250, facilities: ['Audio System', 'Stage'], status: 'Available' },
];

const RoomsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Allocation</h1>
          <p className="text-muted-foreground">Manage physical resources and room constraints for scheduling.</p>
        </div>
        <Button className="flex gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms', value: '42', icon: MapPin },
          { label: 'Lecture Halls', value: '28', icon: Users },
          { label: 'Equipped Labs', value: '14', icon: Monitor },
          { label: 'Active Conflicts', value: '2', icon: MoreVertical, color: 'text-destructive' },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground/30" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Resource Inventory</CardTitle>
          <CardDescription>Filtering by block and facility requirements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Room ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-bold flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {room.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{room.type}</Badge>
                  </TableCell>
                  <TableCell>{room.capacity} Seats</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.map((f) => (
                        <span key={f} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border/50 font-medium whitespace-nowrap">
                          {f}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "font-semibold",
                      room.status === 'Available' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                      room.status === 'Maintenance' ? "bg-orange-100 text-orange-700 hover:bg-orange-100" :
                      room.status === 'Full' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                      "bg-blue-100 text-blue-700 hover:bg-blue-100"
                    )}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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

import { cn } from '@/lib/utils';
export default RoomsPage;
