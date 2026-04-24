import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, 
  Plus, 
  Save, 
  BookOpen, 
  GraduationCap, 
  Presentation, 
  User as UserIcon,
  Briefcase,
  MapPin,
  Mail,
  Award
} from 'lucide-react';
import facultyService from '@/services/facultyService';
import authService from '@/services/authService';
import { cn } from '@/lib/utils';

const Profile = () => {
  const user = authService.getCurrentUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [education, setEducation] = useState([]);
  const [publications, setPublications] = useState([]);
  const [conferences, setConferences] = useState({ attended: 0, presented: 0 });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await facultyService.getProfile();
      if (res.data) {
        setProfile(res.data);
        setEducation(res.data.education || []);
        setPublications(res.data.publications || []);
        setConferences(res.data.conferences || { attended: 0, presented: 0 });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await facultyService.updateProfile({ education, publications, conferences });
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  // Handlers
  const addEducation = () => setEducation([...education, { level: '', university: '', year: new Date().getFullYear(), specialization: '' }]);
  const removeEducation = (idx) => setEducation(education.filter((_, i) => i !== idx));
  const updateEducation = (idx, field, value) => {
    const newEdu = [...education];
    newEdu[idx][field] = value;
    setEducation(newEdu);
  };

  const addPublication = () => setPublications([...publications, { title: '', journal: '', date: new Date().toISOString().split('T')[0], category: 'Article' }]);
  const removePublication = (idx) => setPublications(publications.filter((_, i) => i !== idx));
  const updatePublication = (idx, field, value) => {
    const newPub = [...publications];
    newPub[idx][field] = value;
    setPublications(newPub);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm font-medium text-muted-foreground">Syncing academic profile...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full rounded-2xl border-dashed border-2 p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <UserIcon className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">No Profile Linked</CardTitle>
          <CardDescription>
            Your faculty record hasn't been initialized yet. Click below to create your academic profile.
          </CardDescription>
        </div>
        <Button 
          onClick={() => setProfile({ 
            name: user?.name || 'Faculty Member', 
            designation: 'Assistant Professor', 
            department: 'IT',
            education: [],
            publications: [],
            conferences: { attended: 0, presented: 0 }
          })} 
          className="w-full h-12 rounded-xl font-bold"
        >
          Initialize My Profile
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-primary/10 border border-primary/20 p-8 md:p-12">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-2xl ring-4 ring-background">
            {profile.name?.[0] || 'F'}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{profile.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {profile.designation}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.department}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {profile.email || 'faculty@vce.ac.in'}</span>
            </div>
          </div>
          <div className="md:ml-auto">
            <Button onClick={handleSave} className="rounded-xl px-8 py-6 text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all gap-2 group">
              <Save className="h-5 w-5 group-hover:scale-110 transition-transform" /> Save Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar: Stats & Info */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border/40 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Achievements</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{publications.length}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Publications</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{education.length}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold mt-1">Degrees</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2"><Presentation className="h-4 w-4" /> Conf. Attended</span>
                  <span className="font-bold">{conferences.attended}</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2"><BookOpen className="h-4 w-4" /> Papers Presented</span>
                  <span className="font-bold">{conferences.presented}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Main Area: Detailed Records */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* EDUCATION SECTION */}
          <section className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold tracking-tight">Education</h3>
            </div>
              {education.length === 0 && (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                   <GraduationCap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                   <p className="text-sm text-muted-foreground">No academic records added yet.</p>
                </div>
              )}
              {education.map((edu, idx) => (
                <Card key={idx} className="relative overflow-hidden rounded-2xl border-border/40 bg-card/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/60 to-primary/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-border/40 pb-4">
                       <h4 className="font-semibold flex items-center gap-2 text-foreground/80"><GraduationCap className="h-4 w-4 text-primary" /> Record #{idx + 1}</h4>
                       <Button variant="ghost" size="sm" onClick={() => removeEducation(idx)} className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 px-2 gap-1 transition-colors">
                         <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline text-xs font-medium">Remove</span>
                       </Button>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                           Degree Level
                        </Label>
                        <Input placeholder="e.g. Ph.D" value={edu.level} onChange={e => updateEducation(idx, 'level', e.target.value)} className="bg-muted/40 border-border/50 focus:border-primary/40 focus:ring-primary/20 shadow-none transition-all h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                           Specialization
                        </Label>
                        <Input placeholder="e.g. Artificial Intelligence" value={edu.specialization} onChange={e => updateEducation(idx, 'specialization', e.target.value)} className="bg-muted/40 border-border/50 focus:border-primary/40 focus:ring-primary/20 shadow-none transition-all h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                           University
                        </Label>
                        <Input placeholder="e.g. Osmania University" value={edu.university} onChange={e => updateEducation(idx, 'university', e.target.value)} className="bg-muted/40 border-border/50 focus:border-primary/40 focus:ring-primary/20 shadow-none transition-all h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                           Graduation Year
                        </Label>
                        <Input type="number" value={edu.year} onChange={e => updateEducation(idx, 'year', e.target.value)} className="bg-muted/40 border-border/50 focus:border-primary/40 focus:ring-primary/20 shadow-none transition-all h-10 font-mono" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full h-16 border-dashed border-2 rounded-2xl hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all duration-300 gap-2 text-muted-foreground font-medium shadow-sm hover:shadow">
                <Plus className="h-5 w-5" /> Add Academic Record
              </Button>
            </section>

            {/* PUBLICATIONS SECTION */}
            <section className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <h3 className="text-2xl font-bold tracking-tight">Publications</h3>
              </div>
              {publications.length === 0 && (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                   <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                   <p className="text-sm text-muted-foreground">No publications added yet.</p>
                </div>
              )}
              {publications.map((pub, idx) => (
                <Card key={idx} className="relative overflow-hidden rounded-2xl border-border/40 bg-card/50 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500/60 to-blue-500/20 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-border/40 pb-4">
                       <h4 className="font-semibold flex items-center gap-2 text-foreground/80"><BookOpen className="h-4 w-4 text-blue-500" /> Publication #{idx + 1}</h4>
                       <Button variant="ghost" size="sm" onClick={() => removePublication(idx)} className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 px-2 gap-1 transition-colors">
                         <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline text-xs font-medium">Remove</span>
                       </Button>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Paper Title</Label>
                        <Input placeholder="Optimized Scheduling using Backtracking..." value={pub.title} onChange={e => updatePublication(idx, 'title', e.target.value)} className="bg-muted/40 border-border/50 focus:border-blue-500/40 focus:ring-blue-500/20 shadow-none transition-all h-10 font-medium" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6">
                        <div className="space-y-2 md:col-span-6">
                          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Journal / Conference Name</Label>
                          <Input placeholder="e.g. IEEE Access" value={pub.journal} onChange={e => updatePublication(idx, 'journal', e.target.value)} className="bg-muted/40 border-border/50 focus:border-blue-500/40 focus:ring-blue-500/20 shadow-none transition-all h-10" />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Category</Label>
                          <Select value={pub.category} onValueChange={v => updatePublication(idx, 'category', v)}>
                            <SelectTrigger className="bg-muted/40 border-border/50 focus:ring-blue-500/20 shadow-none transition-all h-10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Article">Article</SelectItem>
                              <SelectItem value="Conference">Conference</SelectItem>
                              <SelectItem value="Journal">Journal</SelectItem>
                              <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Date</Label>
                          <Input type="date" value={pub.date ? new Date(pub.date).toISOString().split('T')[0] : ''} onChange={e => updatePublication(idx, 'date', e.target.value)} className="bg-muted/40 border-border/50 focus:border-blue-500/40 focus:ring-blue-500/20 shadow-none transition-all h-10 font-mono text-sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addPublication} className="w-full h-16 border-dashed border-2 rounded-2xl hover:bg-blue-500/5 hover:border-blue-500/40 hover:text-blue-600 transition-all duration-300 gap-2 text-muted-foreground font-medium shadow-sm hover:shadow">
                <Plus className="h-5 w-5" /> Add Research Paper
              </Button>
            </section>


        </div>
      </div>
    </div>
  );
};

export default Profile;
