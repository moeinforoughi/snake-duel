import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Direction, GameMode } from '@/lib/game-logic';

interface GameControlsProps {
  isPaused: boolean;
  isGameOver: boolean;
  mode: GameMode;
  onTogglePause: () => void;
  onReset: () => void;
  onDirectionChange: (direction: Direction) => void;
  onModeChange: (mode: GameMode) => void;
}

export default function GameControls({
  isPaused,
  isGameOver,
  mode,
  onTogglePause,
  onReset,
  onDirectionChange,
  onModeChange,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'passthrough' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => onModeChange('passthrough')}
          className="flex-1"
        >
          Pass-Through
        </Button>
        <Button
          variant={mode === 'walls' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          className="flex-1"
        >
          Walls
        </Button>
      </div>
      
      {/* Game Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="game"
          size="lg"
          onClick={onTogglePause}
          disabled={isGameOver}
        >
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          {isPaused ? 'Play' : 'Pause'}
        </Button>
        <Button
          variant="neon-outline"
          size="lg"
          onClick={onReset}
        >
          <RotateCcw className="h-5 w-5" />
          Reset
        </Button>
      </div>
      
      {/* Mobile Direction Controls */}
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto md:hidden">
        <div />
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onDirectionChange('UP')}
          className="h-12 w-12"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        <div />
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onDirectionChange('LEFT')}
          className="h-12 w-12"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onDirectionChange('DOWN')}
          className="h-12 w-12"
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onDirectionChange('RIGHT')}
          className="h-12 w-12"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Desktop Controls Hint */}
      <p className="text-center text-muted-foreground text-sm hidden md:block">
        Use arrow keys or WASD to move • Space to pause
      </p>
    </div>
  );
}
