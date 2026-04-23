import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import FacultyPage from '@/pages/Faculty';
import RoomsPage from '@/pages/Rooms';
import SettingsPage from '@/pages/Settings';

import ProtectedRoute from '@/components/ProtectedRoute';

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
              <Route index element={<DashboardPage />} />
              <Route element={<ProtectedRoute allowedRoles={['admin', 'hod']} />}>
                <Route path="faculty" element={<FacultyPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="rooms" element={<RoomsPage />} />
              </Route>
              <Route path="settings" element={<SettingsPage />} />
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
