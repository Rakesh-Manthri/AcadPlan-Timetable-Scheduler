import React, { useState, useMemo, useEffect } from 'react';
import roomsService from '@/services/roomsService';
import { toast } from 'sonner';
import RoomForm from '@/components/dashboard/RoomForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Monitor, Users, MoreVertical, Filter } from 'lucide-react';
import SearchFilter from '@/components/SearchFilter';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockRooms = [
  { id: 'IT-201', type: 'Lecture Hall', capacity: 60, facilities: ['Projector', 'AC'], status: 'Allotted' },
  { id: 'IT-202', type: 'Lecture Hall', capacity: 60, facilities: ['Projector'], status: 'Available' },
  { id: 'Lab-1', type: 'Computer Lab', capacity: 35, facilities: ['60 PCs', 'High-Speed Internet'], status: 'Full' },
  { id: 'Lab-3', type: 'Specialized Lab', capacity: 30, facilities: ['IoT Kits', 'Server Access'], status: 'Maintenance' },
  { id: 'Auditorium', type: 'Large Hall', capacity: 250, facilities: ['Audio System', 'Stage'], status: 'Available' },
  { id: 'CSE-101', type: 'Lecture Hall', capacity: 45, facilities: ['Smart Board', 'AC'], status: 'Available' },
];

const statusColors = {
  'Available': 'bg-green-100 text-green-800',
  'Allotted': 'bg-blue-100 text-blue-800',
  'Full': 'bg-yellow-100 text-yellow-800',
  'Maintenance': 'bg-gray-100 text-gray-800',
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await roomsService.getAll();
      setRooms(response.data);
    } catch (error) {
      toast.error("Failed to load room data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingRoom) {
        await roomsService.update(editingRoom._id || editingRoom.id, data);
        toast.success("Room updated successfully!");
      } else {
        await roomsService.create(data);
        toast.success("Room added successfully!");
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const roomId = room.roomId || room.id;
      const matchesSearch = roomId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || room.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || (room.status || 'Available') === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, searchTerm, typeFilter, statusFilter]);

  const roomTypes = [...new Set(rooms.map(r => r.type))];
  const statuses = [...new Set(rooms.map(r => r.status || 'Available'))];

  const availableCount = rooms.filter(r => (r.status || 'Available') === 'Available').length;
  const allottedCount = rooms.filter(r => r.status === 'Allotted').length;
  const fullCount = rooms.filter(r => ['Full', 'Maintenance'].includes(r.status)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Allocation</h1>
          <p className="text-muted-foreground">Manage physical resources and room constraints for scheduling.</p>
        </div>
        <Button className="flex gap-2 font-semibold" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
              <p className="text-2xl font-bold">{rooms.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Allotted</p>
              <p className="text-2xl font-bold text-blue-600">{allottedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full/Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{fullCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilter 
            placeholder="Search by room ID..."
            onSearch={setSearchTerm}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Room Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Facilities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <TableRow key={room._id || room.id} className="hover:bg-muted/50">
                    <TableCell className="font-semibold">{room.roomId || room.id}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(room.facilities || []).map((facility, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[room.status || 'Available'] || 'bg-gray-100'}>
                        {room.status || 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(room)}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No rooms found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <RoomForm 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleFormSubmit}
        room={editingRoom}
      />
    </div>
  );
};

export default RoomsPage;
