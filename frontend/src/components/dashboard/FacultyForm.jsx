import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FacultyForm = ({ open, onOpenChange, onSubmit, faculty = null }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    designation: 'Assistant Professor',
    qualifications: '',
    department: '',
    specialization: '',
    maxWeeklyLoad: 16,
    availability: {
      Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true
    }
  });

  useEffect(() => {
    if (faculty) {
      setFormData({
        employeeId: faculty.employeeId || '',
        name: faculty.name || '',
        email: faculty.email || '',
        designation: faculty.designation || 'Assistant Professor',
        qualifications: faculty.qualifications || '',
        department: faculty.department || '',
        specialization: Array.isArray(faculty.specialization) ? faculty.specialization.join(', ') : faculty.specialization || '',
        maxWeeklyLoad: faculty.maxWeeklyLoad || 16,
        availability: faculty.availability || { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true }
      });
    } else if (open) {
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        designation: 'Assistant Professor',
        qualifications: '',
        department: '',
        specialization: '',
        maxWeeklyLoad: 16,
        availability: {
          Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true
        }
      });
    }
  }, [faculty, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      specialization: formData.specialization.split(',').map(s => s.trim())
    };
    onSubmit(dataToSubmit);
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day]
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{faculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
          <DialogDescription>
            Configure teaching constraints and availability for {formData.name || 'this member'}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input 
                id="employeeId" 
                value={formData.employeeId} 
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                placeholder="e.g. EMP-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="faculty@college.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Select 
                value={formData.designation} 
                onValueChange={(v) => setFormData({...formData, designation: v})}
              >
                <SelectTrigger id="designation">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor & HOD">Professor & HOD</SelectItem>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                  <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept">Department</Label>
              <Input 
                id="dept" 
                value={formData.department} 
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input 
                id="qualifications" 
                value={formData.qualifications} 
                onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                placeholder="e.g. Ph.D, M.Tech"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spec">Specializations (comma separated)</Label>
            <Input 
              id="spec" 
              placeholder="e.g. Operating Systems, AI, Java"
              value={formData.specialization} 
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              required 
            />
          </div>

          <div className="space-y-4">
            <Label>Weekly Availability</Label>
            <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/30">
              {DAYS.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`day-${day}`} 
                    checked={formData.availability[day]} 
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <label 
                    htmlFor={`day-${day}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="load">Max Weekly Load (Hours)</Label>
            <Input 
              id="load" 
              type="number"
              value={formData.maxWeeklyLoad} 
              onChange={(e) => setFormData({...formData, maxWeeklyLoad: parseInt(e.target.value)})}
              required 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyForm;
