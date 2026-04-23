import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, X } from 'lucide-react';

const SettingsPage = () => {
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState({
    maxDailyLoad: 6,
    minStudentFatigue: true,
    noFacultyOverlaps: true,
    semester: 'odd',
  });

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    // TODO: Save to backend
  };

  const handleDiscard = () => {
    setHasChanges(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure global scheduling constraints and institution preferences.</p>
        </div>
        {hasChanges && (
          <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Unsaved Changes
          </Badge>
        )}
      </div>

      <div className="grid gap-6">
        {/* Academic Calendar Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Academic Calendar</CardTitle>
            <CardDescription>Define the operational hours and days for the scheduler.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Working Days</Label>
                <div className="flex gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <button 
                      key={d}
                      className="h-10 w-10 rounded font-semibold transition-colors bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {d}
                    </button>
                  ))}
                  <button className="h-10 w-10 rounded font-semibold transition-colors bg-muted text-muted-foreground hover:bg-muted/80">S</button>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="semester" className="text-sm font-semibold">Current Semester</Label>
                <Select defaultValue={settings.semester} onValueChange={(value) => {
                  setSettings({ ...settings, semester: value });
                  handleChange();
                }}>
                  <SelectTrigger id="semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odd">Odd (I, III, V, VII)</SelectItem>
                    <SelectItem value="even">Even (II, IV, VI, VIII)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" defaultValue="09:40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" defaultValue="16:20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Constraints Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Scheduling Constraints</CardTitle>
            <CardDescription>Configure hard and soft constraints for the scheduling algorithm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hard Constraint */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-500/5 border border-blue-200">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white text-xs">Hard</Badge>
                    No Faculty Overlaps
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce: No faculty member can be scheduled in two places simultaneously.
                  </p>
                </div>
                <Switch checked={settings.noFacultyOverlaps} disabled />
              </div>

              {/* Soft Constraints */}
              <Separator />
              <div className="space-y-4 mt-6">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Badge className="bg-green-600 text-white text-xs">Soft</Badge>
                  Optimization Preferences
                </h4>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base">Max Daily Faculty Load</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit faculty teaching to max hours per day to prevent fatigue.
                    </p>
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      min="1" 
                      max="12"
                      defaultValue={settings.maxDailyLoad}
                      onChange={(e) => {
                        setSettings({ ...settings, maxDailyLoad: parseInt(e.target.value) });
                        handleChange();
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base">Minimize Student Fatigue</Label>
                    <p className="text-sm text-muted-foreground">
                      Avoid scheduling complex subjects after lunch breaks.
                    </p>
                  </div>
                  <Switch 
                    checked={settings.minStudentFatigue}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, minStudentFatigue: checked });
                      handleChange();
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Algorithm Settings</CardTitle>
            <CardDescription>Configure the automated scheduling algorithm parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iterations">Max Iterations</Label>
                <Input id="iterations" type="number" defaultValue={1000} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input id="timeout" type="number" defaultValue={60} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm Type</Label>
              <Select defaultValue="backtracking">
                <SelectTrigger id="algorithm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backtracking">Backtracking with Heuristics</SelectItem>
                  <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                  <SelectItem value="simulated">Simulated Annealing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification */}
        <div className="flex gap-2 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Note</p>
            <p className="text-amber-800 text-xs mt-1">
              Changes to scheduling constraints will affect all future timetable generation. Existing schedules will not be automatically updated.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Discard Changes
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2 font-semibold px-8"
          >
            <Save className="h-4 w-4" />
            Save Configurations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
