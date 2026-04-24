import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import scheduleService from '@/services/timetableService';
import facultyService from '@/services/facultyService';
import courseService from '@/services/courseService';
import roomsService from '@/services/roomsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Wand2, Plus, Trash2, Lock, RotateCcw, BookOpen, ChevronRight, ChevronLeft, Loader2, Download, RefreshCcw, ArrowRightLeft, Building2
} from 'lucide-react';
import TimetableGrid from '@/components/dashboard/TimetableGrid';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SLOT_LABELS = [
  '09:40-10:40', '10:40-11:40', '11:40-12:40',
  'LUNCH',
  '13:20-14:20', '14:20-15:20', '15:20-16:20'
];
const solverIdxFromGrid = (gridIdx) => {
  if (gridIdx < 3) return gridIdx;
  if (gridIdx === 3) return -1; // lunch
  return gridIdx - 1;
};

// For Fixed/Alternate class slot selectors (solver indices 0-5)
const SOLVER_SLOT_OPTIONS = [
  { label: '09:40-10:40', value: '0' },
  { label: '10:40-11:40', value: '1' },
  { label: '11:40-12:40', value: '2' },
  { label: '13:20-14:20', value: '3' },
  { label: '14:20-15:20', value: '4' },
  { label: '15:20-16:20', value: '5' },
];

const LOADING_QUOTES = [
  "Consulting the ancient scrolls of scheduling wisdom...",
  "Teaching the AI not to put labs on Saturday evening...",
  "Making sure no professor is in two places at once...",
  "Calculating optimal break-time nap schedules...",
  "Negotiating with the Backtracking Algorithm...",
  "Balancing the space-time continuum of classrooms...",
  "Ensuring Sports doesn't clash with Mentoring (again)...",
];

const GenerateWizard = () => {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState('');
  const [result, setResult] = useState(null);
  const [bottleneck, setBottleneck] = useState(null);
  const [dbFaculty, setDbFaculty] = useState([]);
  const [dbCourses, setDbCourses] = useState({});
  const [dbRooms, setDbRooms] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');

  // ---- STEP 1: Subject-Faculty Mapping ----
  const [subjectMappings, setSubjectMappings] = useState([
    { subject: '', faculty: '', weeklyHours: 3, type: 'Lecture', year: 3, section: 'A' }
  ]);

  // ---- STEP 2: Fixed Classes ----
  const [fixedClasses, setFixedClasses] = useState([]);

  // ---- STEP 3: Alternate Classes ----
  const [alternateClasses, setAlternateClasses] = useState([]);

  // ---- STEP 4: Resource Caps ----
  const [resourceCaps, setResourceCaps] = useState({ lectureHalls: 5, labs: 3 });
  const [department, setDepartment] = useState('IT');
  const [years, setYears] = useState([1, 2, 3, 4]);
  const [sections, setSections] = useState(['A', 'B', 'C']);

  // ---- Section → Lecture Hall Mapping ----
  const [sectionHalls, setSectionHalls] = useState({});

  // ---- Generation History (for picking sections from different runs) ----
  const [generationHistory, setGenerationHistory] = useState([]);
  const [previewSection, setPreviewSection] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, courseRes, roomsRes] = await Promise.all([
          facultyService.getAll(),
          courseService.getBySemester('IT'),
          roomsService.getAll()
        ]);
        setDbFaculty(facRes.data || []);
        setDbCourses(courseRes.data || {});
        setDbRooms(roomsRes.data || []);
      } catch (e) { /* ignore */ }
    };
    fetchData();
  }, []);

  // Rotate loading quotes
  useEffect(() => {
    if (!isGenerating) return;
    setLoadingQuote(LOADING_QUOTES[0]);
    const interval = setInterval(() => {
      setLoadingQuote(LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // ---- Subject Mapping Handlers ----
  const addSubjectRow = () => {
    setSubjectMappings([...subjectMappings, { subject: '', faculty: '', weeklyHours: 3, type: 'Lecture', year: 3, section: 'A' }]);
  };
  const removeSubjectRow = (idx) => {
    setSubjectMappings(subjectMappings.filter((_, i) => i !== idx));
  };
  const updateSubjectRow = (idx, field, value) => {
    const updated = [...subjectMappings];
    updated[idx][field] = field === 'weeklyHours' || field === 'year' ? parseInt(value) : value;
    setSubjectMappings(updated);
  };

  // ---- Auto-fill from Semester ----
  const handleSemesterAutoFill = (sem) => {
    setSelectedSemester(sem);
    const courses = dbCourses[sem];
    if (!courses || courses.length === 0) {
      toast.error(`No courses found for Semester ${sem}`);
      return;
    }
    // Map semester number to year: sem 1,2 -> year 1; sem 3,4 -> year 2; sem 5,6 -> year 3; sem 7,8 -> year 4
    const yearMap = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4 };
    const year = yearMap[sem] || 3;
    const mapped = [];
    ['A', 'B', 'C'].forEach(section => {
      courses.forEach(c => {
        mapped.push({
          subject: c.name,
          faculty: '',
          weeklyHours: c.weeklyHours,
          type: c.type,
          year,
          section
        });
      });
    });
    setSubjectMappings(prev => {
      // Remove placeholder if it's the only one and empty
      if (prev.length === 1 && prev[0].subject === '') return mapped;
      return [...prev, ...mapped];
    });
    toast.success(`Loaded ${mapped.length} courses from Semester ${sem} (Sections A, B, C)`);
  };

  const clearMappings = () => {
    setSubjectMappings([{ subject: '', faculty: '', weeklyHours: 3, type: 'Lecture', year: 3, section: 'A' }]);
    setSelectedSemester('');
  };

  // ---- Fixed Class Handlers ----
  const addFixedClass = () => {
    setFixedClasses([...fixedClasses, { subject: '', day: 'Monday', slot_idx: 0, years: [2, 3, 4], sections: ['ALL'], faculty: '', room: '' }]);
  };
  const removeFixedClass = (idx) => {
    setFixedClasses(fixedClasses.filter((_, i) => i !== idx));
  };
  const updateFixedClass = (idx, field, value) => {
    const updated = [...fixedClasses];
    if (field === 'slot_idx') value = parseInt(value);
    if (field === 'years') value = value.split(',').map(v => parseInt(v.trim()) || v);
    if (field === 'sections') value = value.split(',').map(v => v.trim());
    
    updated[idx][field] = value;
    
    // Auto-fill faculty, year, and section based on selected mapping
    if (field === 'subject') {
      const mapping = subjectMappings.find(m => m.subject === value);
      if (mapping) {
        updated[idx].faculty = mapping.faculty || '';
        updated[idx].years = [mapping.year];
        updated[idx].sections = ['ALL']; // Default to ALL sections so Open Electives apply globally
      }
    }
    
    setFixedClasses(updated);
  };

  // ---- Alternate Class Handlers ----
  const addAlternateClass = () => {
    setAlternateClasses([...alternateClasses, { subjectA: 'Sports', subjectB: 'Mentoring', day: 'Saturday', slot_idx: 5, sectionForA: 'A', sectionForB: 'B', years: [2, 3, 4] }]);
  };
  const removeAlternateClass = (idx) => {
    setAlternateClasses(alternateClasses.filter((_, i) => i !== idx));
  };
  const updateAlternateClass = (idx, field, value) => {
    const updated = [...alternateClasses];
    if (field === 'slot_idx') value = parseInt(value);
    if (field === 'years') value = value.split(',').map(v => parseInt(v.trim()));
    updated[idx][field] = value;
    setAlternateClasses(updated);
  };

  // ---- GENERATE ----
  const handleGenerate = async () => {
    // Validate
    const validMappings = subjectMappings.filter(m => m.subject && m.faculty);
    if (validMappings.length === 0) {
      toast.error('Add at least one subject-faculty mapping.');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setBottleneck(null);

    try {
      // Save constraints first
      await scheduleService.saveConstraints(department, { fixedClasses, alternateClasses, resourceCaps });

      // Generate
      const response = await scheduleService.generateBranch({
        department,
        academicYear: '2025-26',
        semester: 'Even',
        years,
        sections,
        subjectMappings: validMappings,
        sectionHalls,
      });

      if (response.success) {
        setResult(response.data);
        setGenerationHistory(prev => [
          ...prev,
          { id: Date.now(), label: `Run ${prev.length + 1}`, data: response.data, requestId: response.requestId }
        ]);
        setStep(4); // Jump to preview
        // Auto-select first section for preview
        const firstSec = Object.keys(response.data)[0] || '';
        setPreviewSection(firstSec);
        toast.success('Schedule generated successfully!');
      } else {
        setBottleneck(response.bottleneck);
        toast.error(response.error || 'Generation failed');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.bottleneck) {
        setBottleneck(errData.bottleneck);
      }
      toast.error(errData?.error || 'Generation failed. Check bottleneck analysis.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- REGENERATE (re-run with same config) ----
  const handleRegenerate = async () => {
    setIsGenerating(true);
    setBottleneck(null);
    try {
      const validMappings = subjectMappings.filter(m => m.subject && m.faculty);
      await scheduleService.saveConstraints(department, { fixedClasses, alternateClasses, resourceCaps });
      const response = await scheduleService.generateBranch({
        department,
        academicYear: '2025-26',
        semester: 'Even',
        years,
        sections,
        subjectMappings: validMappings,
      });
      if (response.success) {
        setResult(response.data);
        setGenerationHistory(prev => [
          ...prev,
          { id: Date.now(), label: `Run ${prev.length + 1}`, data: response.data, requestId: response.requestId }
        ]);
        const firstSec = Object.keys(response.data)[0] || '';
        setPreviewSection(firstSec);
        toast.success('Re-generated successfully! Compare and pick sections below.');
      } else {
        setBottleneck(response.bottleneck);
        toast.error(response.error || 'Regeneration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Regeneration failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Pick a section's timetable from a specific generation run ----
  const handlePickSection = (sectionKey, runId) => {
    const run = generationHistory.find(r => r.id === runId);
    if (!run || !run.data[sectionKey]) {
      toast.error('Section data not found in that run.');
      return;
    }
    setResult(prev => ({
      ...prev,
      [sectionKey]: run.data[sectionKey]
    }));
    toast.success(`Picked ${sectionKey} timetable from ${run.label}`);
  };

  // ---- Regenerate only the currently selected section ----
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);
  const handleRegenerateSection = async (sectionKey) => {
    setIsRegeneratingSection(true);
    try {
      const validMappings = subjectMappings.filter(m => m.subject && m.faculty);
      // Figure out which year this section belongs to
      const yearMatch = years.find(y => sectionKey.startsWith(`Y${y}-`));
      const secLetter = sectionKey.split('-')[1]; // e.g. "A" from "Y2-A"
      if (!yearMatch || !secLetter) {
        toast.error('Could not parse section identifier');
        return;
      }
      // Filter mappings to only this section
      const sectionMappings = validMappings.filter(m => m.year === yearMatch && m.section === secLetter);
      if (sectionMappings.length === 0) {
        toast.error(`No subject mappings found for ${sectionKey}`);
        return;
      }

      await scheduleService.saveConstraints(department, { fixedClasses, alternateClasses, resourceCaps });
      const response = await scheduleService.generateBranch({
        department,
        academicYear: '2025-26',
        semester: 'Even',
        years: [yearMatch],
        sections: { [yearMatch]: [secLetter] },
        subjectMappings: sectionMappings,
      });

      if (response.success && response.data[sectionKey]) {
        // Update only this section in the current result
        setResult(prev => ({
          ...prev,
          [sectionKey]: response.data[sectionKey]
        }));
        // Also log as a partial run in history
        setGenerationHistory(prev => [
          ...prev,
          { id: Date.now(), label: `Run ${prev.length + 1} (${sectionKey})`, data: { ...result, [sectionKey]: response.data[sectionKey] }, requestId: response.requestId }
        ]);
        toast.success(`${sectionKey} regenerated successfully!`);
      } else {
        toast.error(`Failed to regenerate ${sectionKey}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to regenerate ${sectionKey}`);
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  const stepTitles = ['Subject-Faculty Mapping', 'Fixed Classes', 'Alternate Classes', 'Resources & Generate', 'Preview'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Wizard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-primary" />
            Timetable Generator
          </h1>
          <p className="text-muted-foreground mt-1">Configure constraints and generate a complete branch schedule.</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {stepTitles.map((title, idx) => (
          <React.Fragment key={idx}>
            <button
              onClick={() => idx < 4 && setStep(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                step === idx
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : idx < step
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current">
                {idx + 1}
              </span>
              <span className="hidden md:inline">{title}</span>
            </button>
            {idx < stepTitles.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>

      {/* ================================================================ */}
      {/* STEP 1: Subject-Faculty Mapping */}
      {/* ================================================================ */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Subject-Faculty Mapping</CardTitle>
            <CardDescription>Pick a semester to auto-fill from the curriculum, then assign faculty.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Semester Quick-Fill */}
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm font-medium mr-2">Auto-fill from Semester:</Label>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <Button
                  key={sem}
                  variant={selectedSemester === String(sem) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSemesterAutoFill(String(sem))}
                >
                  Sem {sem}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={clearMappings} className="text-destructive hover:text-destructive ml-4">
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
              </Button>
            </div>
            <div className="space-y-6">
              {Object.entries(
                subjectMappings.reduce((acc, row, idx) => {
                  const key = `Year ${row.year || '?'} - Section ${row.section || '?'}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push({ ...row, originalIndex: idx });
                  return acc;
                }, {})
              ).map(([groupKey, rows]) => (
                <div key={groupKey} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-muted/60 px-4 py-2 font-semibold text-sm border-b text-primary">
                    {groupKey}
                  </div>
                  <div className="overflow-x-auto bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Faculty</TableHead>
                          <TableHead>Hours/Week</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => {
                          const idx = row.originalIndex;
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <Input placeholder="e.g. DBMS" value={row.subject} onChange={e => updateSubjectRow(idx, 'subject', e.target.value)} />
                              </TableCell>
                              <TableCell>
                                <Select value={row.faculty} onValueChange={v => updateSubjectRow(idx, 'faculty', v)}>
                                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select faculty" /></SelectTrigger>
                                  <SelectContent>
                                    {dbFaculty.map(f => <SelectItem key={f._id} value={f.name}>{f.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Input type="number" min={1} max={6} value={row.weeklyHours} onChange={e => updateSubjectRow(idx, 'weeklyHours', e.target.value)} className="w-20" /></TableCell>
                              <TableCell>
                                <Select value={row.type} onValueChange={v => updateSubjectRow(idx, 'type', v)}>
                                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Lecture">Lecture</SelectItem>
                                    <SelectItem value="Lab">Lab</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select value={String(row.year)} onValueChange={v => updateSubjectRow(idx, 'year', v)}>
                                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1st</SelectItem>
                                    <SelectItem value="2">2nd</SelectItem>
                                    <SelectItem value="3">3rd</SelectItem>
                                    <SelectItem value="4">4th</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input value={row.section} onChange={e => updateSubjectRow(idx, 'section', e.target.value)} className="w-16" />
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => removeSubjectRow(idx)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addSubjectRow} className="gap-2">
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* STEP 2: Fixed Classes */}
      {/* ================================================================ */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Fixed Classes</CardTitle>
            <CardDescription>Define slots that are locked across multiple years (e.g., Open Elective at 09:40 for 2nd, 3rd, 4th years).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixedClasses.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No fixed classes defined yet. Click below to add one.</p>
            )}
            {fixedClasses.map((fc, idx) => (
              <Card key={idx} className="border-dashed">
                <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Subject (From Step 1)</Label>
                    <Select value={fc.subject} onValueChange={v => updateFixedClass(idx, 'subject', v)}>
                      <SelectTrigger><SelectValue placeholder="Select mapped subject" /></SelectTrigger>
                      <SelectContent>
                        {Array.from(new Set(subjectMappings.filter(m => m.subject).map(m => m.subject))).map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Day</Label>
                    <Select value={fc.day} onValueChange={v => updateFixedClass(idx, 'day', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <Select value={String(fc.slot_idx)} onValueChange={v => updateFixedClass(idx, 'slot_idx', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SOLVER_SLOT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Years (comma-sep)</Label>
                    <Input value={fc.years.join(', ')} onChange={e => updateFixedClass(idx, 'years', e.target.value)} placeholder="2, 3, 4" />
                  </div>
                  <div className="col-span-2 md:col-span-4 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeFixedClass(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addFixedClass} className="gap-2">
              <Plus className="h-4 w-4" /> Add Fixed Class
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* STEP 3: Alternate Classes */}
      {/* ================================================================ */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Alternate / Rotation Classes</CardTitle>
            <CardDescription>Configure sessions that rotate between sections (e.g., IT-A has Sports while IT-B has Mentoring).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alternateClasses.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No alternate classes defined yet.</p>
            )}
            {alternateClasses.map((alt, idx) => (
              <Card key={idx} className="border-dashed">
                <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Activity A</Label>
                    <Input value={alt.subjectA} onChange={e => updateAlternateClass(idx, 'subjectA', e.target.value)} placeholder="e.g. Sports" />
                  </div>
                  <div>
                    <Label>Activity B</Label>
                    <Input value={alt.subjectB} onChange={e => updateAlternateClass(idx, 'subjectB', e.target.value)} placeholder="e.g. Mentoring" />
                  </div>
                  <div>
                    <Label>Day</Label>
                    <Select value={alt.day} onValueChange={v => updateAlternateClass(idx, 'day', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <Select value={String(alt.slot_idx)} onValueChange={v => updateAlternateClass(idx, 'slot_idx', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SOLVER_SLOT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section for A</Label>
                    <Input value={alt.sectionForA} onChange={e => updateAlternateClass(idx, 'sectionForA', e.target.value)} className="w-20" />
                  </div>
                  <div>
                    <Label>Section for B</Label>
                    <Input value={alt.sectionForB} onChange={e => updateAlternateClass(idx, 'sectionForB', e.target.value)} className="w-20" />
                  </div>
                  <div className="col-span-2 md:col-span-3 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeAlternateClass(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addAlternateClass} className="gap-2">
              <Plus className="h-4 w-4" /> Add Alternate Rule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* STEP 4: Resources & Generate */}
      {/* ================================================================ */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Resources & Configuration</CardTitle>
            <CardDescription>Set resource limits and review before generating.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={department} onChange={e => setDepartment(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Lecture Halls Available</Label>
                <Input type="number" value={resourceCaps.lectureHalls} onChange={e => setResourceCaps({ ...resourceCaps, lectureHalls: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Labs Available</Label>
                <Input type="number" value={resourceCaps.labs} onChange={e => setResourceCaps({ ...resourceCaps, labs: parseInt(e.target.value) })} />
              </div>
            </div>

            {/* Section → Lecture Hall Assignment */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Section → Lecture Hall</CardTitle>
                <CardDescription>Assign a fixed lecture hall for each section. This room will be used for all lectures of that section.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {years.flatMap(y =>
                    (Array.isArray(sections) ? sections : []).map(sec => {
                      const key = `Y${y}-${sec}`;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant="outline" className="w-16 justify-center shrink-0 font-mono">{key}</Badge>
                          <Select
                            value={sectionHalls[key] || ''}
                            onValueChange={v => setSectionHalls(prev => ({ ...prev, [key]: v }))}
                          >
                            <SelectTrigger className="h-9 flex-1">
                              <SelectValue placeholder="Select Hall" />
                            </SelectTrigger>
                            <SelectContent>
                              {dbRooms.filter(r => {
                                if (r.type !== 'Lecture Hall') return false;
                                // Hide if this room is already selected by another section
                                const isSelectedByOther = Object.entries(sectionHalls).some(([k, v]) => v === r.roomId && k !== key);
                                return !isSelectedByOther;
                              }).map(room => (
                                <SelectItem key={room.roomId} value={room.roomId}>
                                  {room.roomId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Generation Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Subjects</p>
                    <p className="text-xl font-bold">{subjectMappings.filter(m => m.subject).length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fixed Slots</p>
                    <p className="text-xl font-bold">{fixedClasses.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Alternate Rules</p>
                    <p className="text-xl font-bold">{alternateClasses.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Weekly Hours</p>
                    <p className="text-xl font-bold">{subjectMappings.reduce((sum, m) => sum + (m.weeklyHours || 0), 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full gap-3 text-lg py-6"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {loadingQuote}
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generate Branch Schedule
                </>
              )}
            </Button>

            {/* Bottleneck Analysis */}
            {bottleneck && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive text-lg">Bottleneck Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Placed:</strong> {bottleneck.placed} / {bottleneck.totalTasks}</p>
                  <p><strong>Unplaced:</strong> {bottleneck.unplaced}</p>
                  <p><strong>Stuck Subjects:</strong> {bottleneck.stuckSubjects?.join(', ') || 'N/A'}</p>
                  <p><strong>Stuck Faculty:</strong> {bottleneck.stuckFaculty?.join(', ') || 'N/A'}</p>
                  <p className="text-muted-foreground italic">{bottleneck.suggestion}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* STEP 5: Preview, Regenerate & Section Picker */}
      {/* ================================================================ */}
      {step === 4 && result && (
        <div className="space-y-6">
          {/* Header with regenerate */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Generated Schedule Preview</h2>
              <p className="text-muted-foreground text-sm">Review, regenerate, or pick sections from different runs.</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 px-3 py-1 self-center">
                {Object.keys(result).length} grids · {generationHistory.length} run{generationHistory.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Section Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(result).map(sec => (
                  <Button
                    key={sec}
                    variant={previewSection === sec ? 'default' : 'outline'}
                    onClick={() => setPreviewSection(sec)}
                    size="sm"
                  >
                    {sec}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Section Grid */}
          {previewSection && result[previewSection] && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{previewSection}</CardTitle>
                    <CardDescription>{result[previewSection].length} slots filled{sectionHalls[previewSection] ? ` · Hall: ${sectionHalls[previewSection]}` : ''}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleRegenerateSection(previewSection)}
                    disabled={isRegeneratingSection || isGenerating}
                  >
                    {isRegeneratingSection ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    {isRegeneratingSection ? 'Regenerating...' : `Regenerate ${previewSection}`}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 overflow-x-auto">
                <TimetableGrid courses={result[previewSection]} />
              </CardContent>
            </Card>
          )}

          {/* Section Picker from Multiple Runs */}
          {generationHistory.length > 1 && previewSection && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  Pick Section from Different Runs
                </CardTitle>
                <CardDescription>
                  You have {generationHistory.length} generation runs. Pick the best version of <strong>{previewSection}</strong> from any run.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {generationHistory.map(run => {
                  const secData = run.data[previewSection];
                  if (!secData) return null;
                  const isActive = JSON.stringify(result[previewSection]) === JSON.stringify(secData);
                  return (
                    <div
                      key={run.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={isActive ? 'default' : 'outline'} className="font-mono">{run.label}</Badge>
                        <span className="text-sm text-muted-foreground">{secData.length} slots filled</span>
                        {isActive && <Badge className="bg-green-100 text-green-800 border-green-300 text-[10px]">ACTIVE</Badge>}
                      </div>
                      {!isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePickSection(previewSection, run.id)}
                          className="gap-1"
                        >
                          <ArrowRightLeft className="h-3 w-3" /> Use This
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">Fixed</Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">Alternate</Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">Special</Badge>
            <Badge className="bg-green-100 text-green-800 border-green-300">Lab</Badge>
            <Badge className="bg-sky-50 text-sky-800 border-sky-300">Lecture</Badge>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <Button onClick={() => setStep(Math.min(3, step + 1))} disabled={step === 3}>
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default GenerateWizard;
