import React, { useState, useMemo, useEffect } from 'react';
import facultyService from '@/services/facultyService';
import { toast } from 'sonner';
import FacultyForm from '@/components/dashboard/FacultyForm';
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
import { Plus, Pencil, Trash2, CalendarRange, Filter } from 'lucide-react';
import SearchFilter from '@/components/SearchFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockFaculty = [
  { id: 1, name: 'Dr. Ramesh Kumar', department: 'IT', specialization: 'Operating Systems', loads: '14 hrs/week', status: 'Available' },
  { id: 2, name: 'Prof. Anitha Reddy', department: 'IT', specialization: 'Compiler Design', loads: '12 hrs/week', status: 'Full' },
  { id: 3, name: 'Dr. Suresh Varma', department: 'IT', specialization: 'Database Systems', loads: '16 hrs/week', status: 'Conflict' },
  { id: 4, name: 'Ms. Shruthi Singh', department: 'CSE', specialization: 'Web Technologies', loads: '10 hrs/week', status: 'Available' },
  { id: 5, name: 'Prof. Naveen Kumar', department: 'IT', specialization: 'Full Stack Development', loads: '18 hrs/week', status: 'Full' },
  { id: 6, name: 'Dr. Lakshmi Sharma', department: 'CSE', specialization: 'AI & ML', loads: '8 hrs/week', status: 'Available' },
];

const statusColors = {
  'Available': 'bg-green-100 text-green-800',
  'Full': 'bg-yellow-100 text-yellow-800',
  'Conflict': 'bg-red-100 text-red-800',
};

const FacultyPage = () => {
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const response = await facultyService.getAll();
      setFaculties(response.data);
    } catch (error) {
      toast.error("Failed to load faculty data from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFaculty(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faculty) => {
    setEditingFaculty(faculty);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty._id || editingFaculty.id, data);
        toast.success("Faculty updated successfully!");
      } else {
        await facultyService.create(data);
        toast.success("Faculty added successfully!");
      }
      setIsModalOpen(false);
      fetchFaculty();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const filteredFaculty = useMemo(() => {
    return faculties.filter(faculty => {
      const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (faculty.specialization && Array.isArray(faculty.specialization) 
                            ? faculty.specialization.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
                            : faculty.specialization?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = departmentFilter === 'all' || faculty.department === departmentFilter;
      
      // Map backend status or use a default since backend might have different logic
      const status = faculty.status || 'Available'; 
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [faculties, searchTerm, departmentFilter, statusFilter]);

  const departments = [...new Set(faculties.map(f => f.department))];
  const statuses = [...new Set(faculties.map(f => f.status || 'Available'))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground">Manage faculty members and their teaching assignments.</p>
        </div>
        <Button className="font-semibold px-4 flex gap-2" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" /> Add Faculty
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold">{faculties.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-600">{faculties.filter(f => (f.status || 'Available') === 'Available').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">At Capacity</p>
              <p className="text-2xl font-bold text-yellow-600">{faculties.filter(f => f.status === 'Full').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">With Conflicts</p>
              <p className="text-2xl font-bold text-red-600">{faculties.filter(f => f.status === 'Conflict').length}</p>
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
            placeholder="Search by name or specialization..."
            onSearch={setSearchTerm}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
            Showing {filteredFaculty.length} of {faculties.length} faculty members
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card className="border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Qualifications</TableHead>
                <TableHead>Load</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.length > 0 ? (
                filteredFaculty.map((faculty) => (
                  <TableRow key={faculty._id || faculty.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground text-xs font-mono">{faculty.employeeId || '—'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-xs text-muted-foreground">{faculty.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        faculty.designation === 'Professor & HOD' ? 'border-amber-400 text-amber-700 bg-amber-50' :
                        faculty.designation === 'Professor' ? 'border-blue-400 text-blue-700 bg-blue-50' :
                        faculty.designation === 'Associate Professor' ? 'border-purple-400 text-purple-700 bg-purple-50' :
                        'border-gray-300'
                      }>
                        {faculty.designation || 'Assistant Professor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                      {Array.isArray(faculty.specialization) ? faculty.specialization.join(', ') : faculty.specialization}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{faculty.qualifications || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{faculty.maxWeeklyLoad || 16} hrs</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(faculty)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No faculty members found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <FacultyForm 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleFormSubmit}
        faculty={editingFaculty}
      />
    </div>
  );
};

export default FacultyPage;
