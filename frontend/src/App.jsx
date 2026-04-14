import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import FacultyPage from '@/pages/Faculty';
import RoomsPage from '@/pages/Rooms';
import SettingsPage from '@/pages/Settings';

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
