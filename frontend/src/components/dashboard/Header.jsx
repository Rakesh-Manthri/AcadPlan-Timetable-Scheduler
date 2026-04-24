import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import authService from '@/services/authService';

const Header = ({ onLogout }) => {
  const user = authService.getCurrentUser();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end h-16 px-8 bg-background/80 backdrop-blur-md border-b border-border/50 no-print">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-4 border-r border-border/50">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none">{user?.name || 'Faculty Member'}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-bold">{user?.role || 'Faculty'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-destructive transition-colors gap-2"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
