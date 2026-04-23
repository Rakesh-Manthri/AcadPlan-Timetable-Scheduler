import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

const ROOM_TYPES = ['Lecture Hall', 'Computer Lab', 'Specialized Lab', 'Auditorium'];

const RoomForm = ({ open, onOpenChange, onSubmit, room = null }) => {
  const [formData, setFormData] = useState({
    roomId: '',
    type: 'Lecture Hall',
    capacity: 60,
    facilities: ''
  });

  useEffect(() => {
    if (room) {
      setFormData({
        roomId: room.roomId || '',
        type: room.type || 'Lecture Hall',
        capacity: room.capacity || 60,
        facilities: Array.isArray(room.facilities) ? room.facilities.join(', ') : room.facilities || ''
      });
    }
  }, [room]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f !== '')
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>
            Enter details about the physical space. The AI uses capacity and type to assign classes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room Identifier (e.g. IT-201)</Label>
            <Input 
              id="roomId" 
              value={formData.roomId} 
              onChange={(e) => setFormData({...formData, roomId: e.target.value})}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Room Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(val) => setFormData({...formData, type: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Seating Capacity</Label>
            <Input 
              id="capacity" 
              type="number"
              value={formData.capacity} 
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilities">Facilities (comma separated)</Label>
            <Input 
              id="facilities" 
              placeholder="e.g. Projector, AC, smart board"
              value={formData.facilities} 
              onChange={(e) => setFormData({...formData, facilities: e.target.value})}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomForm;
