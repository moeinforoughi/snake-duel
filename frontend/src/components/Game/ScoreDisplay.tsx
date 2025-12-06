import React from 'react';
import { Trophy, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  highScore?: number;
  isGameOver: boolean;
}

export default function ScoreDisplay({ score, highScore = 0, isGameOver }: ScoreDisplayProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="text-2xl font-display font-bold text-glow-accent">{score}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neon-yellow/20">
          <Trophy className="w-5 h-5 text-neon-yellow" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Best</p>
          <p className="text-2xl font-display font-bold" style={{ textShadow: '0 0 10px hsl(50 100% 55% / 0.8)' }}>
            {Math.max(score, highScore)}
          </p>
        </div>
      </div>
      
      {isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="text-center animate-scale-in">
            <p className="text-3xl font-display font-bold text-destructive mb-2">GAME OVER</p>
            <p className="text-lg text-muted-foreground">Final Score: {score}</p>
          </div>
        </div>
      )}
    </div>
  );
}
