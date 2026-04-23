import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  CalendarDays, 
  Users, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/dashboard/Header';

import authService from '@/services/authService';

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const role = user?.role || 'faculty';

  const navItems = [
    { title: 'Timetable Grid', icon: CalendarDays, href: '/dashboard' },
    { title: 'Faculty Management', icon: Users, href: '/dashboard/faculty', roles: ['admin', 'hod'] },
    { title: 'Room Allocation', icon: MapPin, href: '/dashboard/rooms', roles: ['admin'] },
    { title: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(role)
  );

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={cn("flex h-screen bg-background overflow-hidden", isDarkMode && 'dark')}>
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden absolute top-4 left-4 z-50 bg-card shadow-sm border"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 no-print",
        !isSidebarOpen && "-translate-x-full lg:hidden"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="rounded bg-primary p-1.5">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AcadPlan</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </NavLink>
            ))}
          </nav>

          {/* Theme and Profile Section */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Theme Toggle */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm"
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>

            {/* Profile Card */}
            <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate leading-none mb-1">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@acadplan.edu'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header for Desktop and Mobile */}
        <Header onLogout={handleLogout} />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
