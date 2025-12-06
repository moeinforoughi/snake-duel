import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import api, { LeaderboardEntry } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { GameMode } from '@/lib/game-logic';

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const data = await api.leaderboard.getTop(10, mode === 'all' ? undefined : mode);
      setEntries(data);
      setIsLoading(false);
    };
    
    fetchLeaderboard();
  }, [mode]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-mono text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <Card variant="neon" className="w-full max-w-lg mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-glow flex items-center justify-center gap-3">
          <Trophy className="w-6 h-6 text-neon-yellow" />
          Leaderboard
        </CardTitle>
        
        {/* Mode Filter */}
        <div className="flex gap-2 justify-center pt-2">
          <Button
            variant={mode === 'all' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setMode('all')}
          >
            All
          </Button>
          <Button
            variant={mode === 'passthrough' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setMode('passthrough')}
          >
            Pass-Through
          </Button>
          <Button
            variant={mode === 'walls' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setMode('walls')}
          >
            Walls
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No scores yet. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-colors",
                  index === 0 && "bg-neon-yellow/10 border border-neon-yellow/30",
                  index === 1 && "bg-muted/50",
                  index === 2 && "bg-orange-500/10 border border-orange-500/20",
                  index > 2 && "bg-secondary/30 hover:bg-secondary/50"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    index === 0 && "text-neon-yellow font-display"
                  )}>
                    {entry.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entry.mode} • {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className={cn(
                  "font-display font-bold text-lg",
                  index === 0 && "text-glow"
                )}>
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
