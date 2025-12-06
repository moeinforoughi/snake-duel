import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Users, Loader2, ArrowLeft } from 'lucide-react';
import api, { ActivePlayer } from '@/lib/api';
import GameBoard from '@/components/Game/GameBoard';
import { cn } from '@/lib/utils';

const GRID_SIZE = 20;
const SIMULATION_SPEED = 200;

export default function WatchMode() {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const simulationRef = useRef<number | null>(null);

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const data = await api.players.getActivePlayers();
      setPlayers(data);
      setIsLoading(false);
    };
    
    fetchPlayers();
    
    // Refresh player list periodically
    const interval = setInterval(fetchPlayers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simulate selected player's movement
  useEffect(() => {
    if (!selectedPlayer) {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
      return;
    }

    simulationRef.current = window.setInterval(() => {
      setSelectedPlayer(prev => {
        if (!prev) return null;
        return api.players.simulatePlayerMove(prev, GRID_SIZE);
      });
    }, SIMULATION_SPEED);

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, [selectedPlayer?.id]);

  const handleSelectPlayer = (player: ActivePlayer) => {
    setSelectedPlayer({ ...player });
  };

  const handleBackToList = () => {
    setSelectedPlayer(null);
  };

  if (isLoading) {
    return (
      <Card variant="neon" className="w-full max-w-lg mx-auto animate-fade-in">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (selectedPlayer) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto animate-fade-in">
        <Card variant="game" className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackToList}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <CardTitle className="text-glow flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary animate-pulse" />
                  Watching {selectedPlayer.username}
                </CardTitle>
                <p className="text-sm text-muted-foreground capitalize mt-1">
                  {selectedPlayer.mode} mode
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase">Score</p>
                <p className="text-2xl font-display font-bold text-glow-accent">
                  {selectedPlayer.currentScore}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <GameBoard
              snake={selectedPlayer.snake}
              food={selectedPlayer.food}
              gridSize={GRID_SIZE}
              mode={selectedPlayer.mode}
              isGameOver={false}
            />
            
            <p className="text-center text-muted-foreground text-sm mt-4">
              Live simulation • Updates every 200ms
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card variant="neon" className="w-full max-w-lg mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-glow flex items-center justify-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          Live Players
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {players.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No players currently online
          </p>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-lg transition-all",
                  "bg-secondary/30 hover:bg-secondary/50 border border-transparent",
                  "hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex-1 text-left">
                  <p className="font-medium">{player.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {player.mode} mode • Playing now
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-display font-bold text-lg text-accent">
                    {player.currentScore}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
                
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              </button>
            ))}
          </div>
        )}
        
        <p className="text-center text-muted-foreground text-sm mt-6">
          Click on a player to watch their game live
        </p>
      </CardContent>
    </Card>
  );
}
