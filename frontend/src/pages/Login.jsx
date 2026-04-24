import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Zap } from 'lucide-react';

import authService from '@/services/authService';
import { toast } from 'sonner';

const LoginPage = () => {
  const [role, setRole] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await authService.login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      localStorage.setItem('user_role', data.user.role); // Keep role for existing frontend logic
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = {
    admin: { email: 'admin@acadplan.edu', password: 'admin123' },
    hod: { email: 'hod@acadplan.edu', password: 'hod123' },
    faculty: { email: 'faculty@acadplan.edu', password: 'faculty123' },
    student: { email: '1602-24-737-001', password: 'Student#123' },
  };

  const handleDemoLogin = () => {
    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col items-center justify-center px-4 py-6">
      {/* Top Brand Section */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="rounded-lg bg-primary p-3 shadow-lg">
            <CalendarDays className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AcadPlan
          </span>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
          <Zap className="h-3 w-3 mr-1" />
          Intelligent Timetable Scheduler
        </Badge>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border-border shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Access the automated timetable scheduler system
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selection */}
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-sm font-medium">Account Type</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="hod">HOD (Department Head)</SelectItem>
                  <SelectItem value="faculty">Faculty Member</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Input */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {role === 'student' ? 'Roll Number' : 'Email Address'}
              </Label>
              <Input 
                id="email" 
                type="text" 
                placeholder={role === 'student' ? "1602-XX-737-XXX" : "name@college.edu"} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-background/50"
              />
            </div>

            {/* Password Input */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="bg-background/50"
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full mt-2 font-semibold py-5"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleDemoLogin}
          >
            Use {role.charAt(0).toUpperCase() + role.slice(1)} Demo Account
          </Button>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
          <div className="w-full text-sm text-muted-foreground text-center">
            <p className="mb-2">Forgot your password?</p>
            <Button variant="link" className="text-primary p-0 h-auto">
              Contact IT administration
            </Button>
          </div>
          <div className="w-full pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              © 2024 AcadPlan. All rights reserved.
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default LoginPage;
