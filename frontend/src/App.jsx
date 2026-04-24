import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoginPage from '@/pages/Login';
import FacultyPage from '@/pages/Faculty';
import RoomsPage from '@/pages/Rooms';
import GenerateWizard from '@/pages/GenerateWizard';
import ScheduleVersions from '@/pages/ScheduleVersions';
import Profile from '@/pages/Profile';
import StudentDashboard from '@/pages/StudentDashboard';

import ProtectedRoute from '@/components/ProtectedRoute';
import authService from '@/services/authService';

const DashboardIndex = () => {
  const user = authService.getCurrentUser();
  if (user?.role === 'student') return <StudentDashboard />;
  return <ScheduleVersions />;
};

function App() {
  return (
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardIndex />} />
              <Route element={<ProtectedRoute allowedRoles={['hod', 'faculty']} />}>
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin', 'hod']} />}>
                <Route path="faculty" element={<FacultyPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="rooms" element={<RoomsPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="generate" element={<GenerateWizard />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
