import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure global scheduling constraints and institution preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Academic Calendar</CardTitle>
            <CardDescription>Define the operational hours and days for the scheduler.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="flex gap-2 text-xs font-medium">
                  {['M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center">
                      {d}
                    </div>
                  ))}
                  <div className="h-8 w-8 rounded bg-muted text-muted-foreground flex items-center justify-center">S</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select defaultValue="odd">
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odd">Odd (I, III, V, VII)</SelectItem>
                    <SelectItem value="even">Even (II, IV, VI, VIII)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>CSP Algorithm Constraints</CardTitle>
            <CardDescription>Configure hard and soft constraints for the heuristic engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">No Faculty Overlaps</Label>
                <p className="text-sm text-muted-foreground">Force hard constraint: No faculty member can be in two places at once.</p>
              </div>
              <Switch checked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Max Daily Load</Label>
                <p className="text-sm text-muted-foreground">Soft constraint: Limit faculty teaching to 6 hours per day.</p>
              </div>
              <div className="w-24">
                <Input type="number" defaultValue={6} />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Min Student Fatigue</Label>
                <p className="text-sm text-muted-foreground">Weighted preference: Avoid scheduling complex subjects after lunch.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Discard Changes</Button>
          <Button className="px-8 font-semibold">Save Configurations</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
