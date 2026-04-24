import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, X, Send, Eye, RefreshCcw, FileWarning, Layers, SplitSquareHorizontal, User, Trash2, Wand2 
} from 'lucide-react';
import scheduleService from '@/services/timetableService';
import authService from '@/services/authService';
import TimetableGrid from '@/components/dashboard/TimetableGrid';

const STATUS_COLORS = {
  draft: 'bg-muted text-muted-foreground border-border dark:bg-muted/20',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  approved: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  rejected: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  generated: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  failed: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const ScheduleVersions = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('IT'); // Hardcoded for demo/simplicity
  const [rejectingId, setRejectingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]); // Array of 2 version objects
  const [compareSection, setCompareSection] = useState('Y3-A'); // Default section to compare

  const [viewMode, setViewMode] = useState(false);
  const [viewSelection, setViewSelection] = useState(null); // Single version object
  const [viewSection, setViewSection] = useState('Y2-B'); // Default section to view
  const [viewType, setViewType] = useState('personal'); // 'personal' or 'master' for faculty

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'admin';
  const isHod = user?.role === 'hod';

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getVersions(department);
      setVersions(res.data || []);
    } catch (err) {
      toast.error('Failed to load schedule versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [department]);

  const handleSubmit = async (id) => {
    try {
      await scheduleService.submitVersion(id);
      toast.success('Version submitted to HOD for approval');
      fetchVersions();
    } catch (err) {
      toast.error('Failed to submit version');
    }
  };

  const handleApprove = async (id) => {
    try {
      await scheduleService.approveVersion(id);
      toast.success('Version approved and set as active schedule');
      fetchVersions();
    } catch (err) {
      toast.error('Failed to approve version');
    }
  };

  const handleReject = async (id) => {
    if (!feedbackText.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }
    try {
      await scheduleService.rejectVersion(id, feedbackText);
      toast.success('Version rejected');
      setRejectingId(null);
      setFeedbackText('');
      fetchVersions();
    } catch (err) {
      toast.error('Failed to reject version');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule version?')) return;
    try {
      await scheduleService.deleteVersion(id);
      toast.success('Version deleted');
      fetchVersions();
    } catch (err) {
      toast.error('Failed to delete version');
    }
  };

  const handleRegenerateSection = async (id, section) => {
    try {
      toast.loading(`Regenerating ${section}...`);
      const res = await scheduleService.regenerateSection(id, section);
      toast.dismiss();
      toast.success(`${section} regenerated successfully`);
      // Update the current view selection
      setViewSelection(prev => ({
        ...prev,
        result: res.data,
        status: 'draft' // It resets to draft in backend
      }));
      // Also update in the versions list
      setVersions(versions.map(v => v._id === id ? { ...v, result: res.data, status: 'draft' } : v));
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to regenerate section');
    }
  };

  const toggleCompare = (version) => {
    if (compareSelection.find(v => v._id === version._id)) {
      setCompareSelection(compareSelection.filter(v => v._id !== version._id));
    } else {
      if (compareSelection.length < 2) {
        setCompareSelection([...compareSelection, version]);
      } else {
        toast.error('You can only compare 2 versions at a time');
      }
    }
  };

  if (compareMode && compareSelection.length === 2) {
    const v1 = compareSelection[0];
    const v2 = compareSelection[1];
    const grids1 = v1.result || {};
    const grids2 = v2.result || {};
    const commonSections = Object.keys(grids1).filter(k => Object.keys(grids2).includes(k));

    return (
      <div className="space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Compare Versions</h1>
          <Button variant="outline" onClick={() => { setCompareMode(false); setCompareSelection([]); }}>
            <Layers className="h-4 w-4 mr-2" /> Back to Gallery
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Section to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {commonSections.map(sec => (
                <Button 
                  key={sec} 
                  variant={compareSection === sec ? 'default' : 'outline'}
                  onClick={() => setCompareSection(sec)}
                >
                  {sec}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex justify-between items-center">
                <span>{v1.versionName}</span>
                <Badge className={STATUS_COLORS[v1.status]}>{v1.status.toUpperCase()}</Badge>
              </CardTitle>
              <CardDescription>{new Date(v1.createdAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              {grids1[compareSection] ? (
                <TimetableGrid courses={grids1[compareSection]} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Section not found in this version.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex justify-between items-center">
                <span>{v2.versionName}</span>
                <Badge className={STATUS_COLORS[v2.status]}>{v2.status.toUpperCase()}</Badge>
              </CardTitle>
              <CardDescription>{new Date(v2.createdAt).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              {grids2[compareSection] ? (
                <TimetableGrid courses={grids2[compareSection]} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Section not found in this version.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (viewMode && viewSelection) {
    const grids = viewSelection.result || {};
    const sections = Object.keys(grids);

    if (!isAdmin && viewType === 'personal') {
      // Personalized Faculty View
      let myCourses = [];
      sections.forEach(sec => {
        const classes = grids[sec].filter(c => {
          if (!c.faculty || !user?.name) return false;
          const facultyName = c.faculty.toLowerCase();
          const authName = user.name.toLowerCase();
          return facultyName.includes(authName) || authName.includes(facultyName);
        }).map(c => ({
          ...c, 
          subject: `${c.subject} (${sec})`,
          // Add extra metadata for the grid if needed
        }));
        myCourses.push(...classes);
      });

      return (
        <div className="space-y-6 max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Personal Timetable</h1>
              <p className="text-muted-foreground">
                {isAdmin || isHod ? `Aggregated schedule from ${viewSelection.versionName}` : 'Aggregated personal schedule'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" onClick={() => setViewType('master')}>
                <Layers className="h-4 w-4 mr-2" /> View Master Schedule
              </Button>
              <Button variant="outline" onClick={() => { setViewMode(false); setViewSelection(null); }}>
                <X className="h-4 w-4 mr-2" /> Close
              </Button>
            </div>
          </div>
          <Card className="border-primary/20 shadow-xl shadow-primary/5">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex justify-between items-center">
                <CardTitle>Schedule for {user?.name}</CardTitle>
                <Badge variant="outline" className="bg-background text-primary border-primary/20">GENERATED RESULT</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 overflow-x-auto">
              <TimetableGrid courses={myCourses} />
            </CardContent>
          </Card>
        </div>
      );
    }

    // Admin / HOD / Faculty Master View
    const badgeText = viewSelection.status === 'approved' ? 'OFFICIAL' : viewSelection.status.toUpperCase();
    const badgeStyle = viewSelection.status === 'approved' ? 'bg-green-600 text-white hover:bg-green-700 text-lg px-4 py-1' : 'bg-yellow-500 text-white hover:bg-yellow-600 text-lg px-4 py-1';

    return (
      <div className="space-y-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Master Schedule{(isAdmin || isHod) ? `: ${viewSelection.versionName}` : ''}
            </h1>
            <Badge className={badgeStyle}>{badgeText}</Badge>
          </div>
          <div className="flex gap-2">
            {!isAdmin && !isHod && (
              <Button variant="default" onClick={() => setViewType('personal')}>
                <User className="h-4 w-4 mr-2" /> My Personal View
              </Button>
            )}
            <Button variant="outline" onClick={() => { setViewMode(false); setViewSelection(null); setViewType('personal'); }}>
              <Layers className="h-4 w-4 mr-2" /> Back to Gallery
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Select Section to View</span>
              {isHod && viewSelection.status === 'pending' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(viewSelection._id)}>
                  <Check className="h-4 w-4 mr-2" /> Approve Master Schedule
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap items-center">
              {sections.map(sec => (
                <Button 
                  key={sec} 
                  variant={viewSection === sec ? 'default' : 'outline'}
                  onClick={() => setViewSection(sec)}
                >
                  {sec}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            {grids[viewSection] ? (
              <TimetableGrid 
                courses={grids[viewSection]} 
                title={`Academic Timetable - Section: ${viewSection}`} 
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">Section not found in this version.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Gallery</h1>
          <p className="text-muted-foreground">Manage, review, and compare generated timetable versions.</p>
        </div>
        {(isAdmin || isHod) && (
          <div className="flex items-center gap-2">
            <Button 
              variant={compareMode ? 'default' : 'outline'} 
              onClick={() => {
                if (compareMode && compareSelection.length === 2) {
                  // Keep it in compare mode, it will trigger the if statement above
                } else if (compareMode) {
                  setCompareMode(false);
                  setCompareSelection([]);
                } else {
                  setCompareMode(true);
                  toast.info('Select exactly 2 versions to compare');
                }
              }}
            >
              <SplitSquareHorizontal className="h-4 w-4 mr-2" />
              {compareMode ? (compareSelection.length === 2 ? 'Compare Selected' : 'Cancel Comparison') : 'Compare Versions'}
            </Button>
            <Button variant="outline" size="icon" onClick={fetchVersions} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {isHod && versions.some(v => v.status === 'pending') && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
          <CardContent className="p-4 flex items-center gap-3 text-yellow-800 dark:text-yellow-400">
            <FileWarning className="h-5 w-5" />
            <div>
              <p className="font-semibold">Pending Approvals</p>
              <p className="text-sm">There are versions waiting for your review.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Loading versions...</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No generated schedules found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions
            .filter(v => (isAdmin || isHod) ? true : v.status === 'approved')
            .map(v => (
            <Card 
              key={v._id} 
              className={`transition-all ${compareMode && compareSelection.find(s => s._id === v._id) ? 'ring-2 ring-primary border-primary' : ''}`}
            >
              <CardHeader className="bg-muted/20 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {(isAdmin || isHod) ? v.versionName : 'Official Master Schedule'}
                    </CardTitle>
                    <CardDescription>{new Date(v.createdAt).toLocaleString()}</CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge className={STATUS_COLORS[v.status]}>{v.status.toUpperCase()}</Badge>
                    {(isAdmin || isHod) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDelete(v._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sem:</span> {v.semester}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span> {v.academicYear}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Grids:</span> {Object.keys(v.result || {}).length}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> {v.status}
                  </div>
                </div>

                {v.feedback && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-400">
                    <strong>HOD Feedback:</strong> {v.feedback}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {compareMode ? (
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => toggleCompare(v)}
                    >
                      {compareSelection.find(s => s._id === v._id) ? 'Deselect' : 'Select for Comparison'}
                    </Button>
                  ) : (
                    <>
                      {isAdmin && v.status === 'draft' && (
                        <Button size="sm" onClick={() => handleSubmit(v._id)} className="flex-1">
                          <Send className="h-4 w-4 mr-2" /> Submit
                        </Button>
                      )}
                      
                      {isHod && v.status === 'pending' && (
                        <>
                          <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => handleApprove(v._id)}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1" onClick={() => setRejectingId(v._id)}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}

                      {/* We could add an "Open" or "View" button here if there was a dedicated single view */}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => { 
                          const resultGrids = v.result || {};
                          setViewSelection(v); 
                          setViewMode(true); 
                          setViewSection(Object.keys(resultGrids)[0] || ''); 
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </>
                  )}
                </div>

                {/* Reject Feedback Form */}
                {rejectingId === v._id && (
                  <div className="pt-4 space-y-2 border-t mt-2">
                    <Label className="text-red-600 font-semibold">Reason for Rejection</Label>
                    <Textarea 
                      placeholder="e.g. Too many consecutive labs for Section A..." 
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(v._id)}>Confirm Reject</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleVersions;
