import React from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export type View = 'play' | 'leaderboard' | 'watch';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'play' as View, label: 'Play', icon: Gamepad2 },
    { id: 'leaderboard' as View, label: 'Leaderboard', icon: Trophy },
    { id: 'watch' as View, label: 'Watch', icon: Eye },
  ];

  return (
    <nav className="flex justify-center gap-2 p-4">
      {navItems.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={currentView === id ? 'neon' : 'ghost'}
          size="lg"
          onClick={() => onViewChange(id)}
          className={cn(
            "gap-2 transition-all duration-300",
            currentView === id && "animate-glow-pulse"
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </nav>
  );
}
