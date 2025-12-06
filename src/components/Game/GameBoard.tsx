import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { Position, GameMode } from '@/lib/game-logic';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  mode: GameMode;
  isGameOver: boolean;
}

const GameBoard = memo(function GameBoard({ snake, food, gridSize, mode, isGameOver }: GameBoardProps) {
  const snakeSet = new Set(snake.map(p => `${p.x},${p.y}`));
  const headKey = `${snake[0].x},${snake[0].y}`;
  
  const cells = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const key = `${x},${y}`;
      const isSnake = snakeSet.has(key);
      const isHead = key === headKey;
      const isFood = x === food.x && y === food.y;
      
      cells.push(
        <div
          key={key}
          className={cn(
            "game-grid-cell rounded-sm",
            isFood && "food-cell",
            isSnake && !isFood && "snake-segment",
            isHead && "relative z-10",
            !isSnake && !isFood && "bg-grid"
          )}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
          }}
        />
      );
    }
  }
  
  return (
    <div className="relative">
      <div
        className={cn(
          "grid gap-[1px] p-3 rounded-xl bg-grid-line",
          mode === 'walls' && "border-2 border-destructive/50",
          mode === 'passthrough' && "border-2 border-primary/30",
          isGameOver && "opacity-60"
        )}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1 / 1',
          width: '100%',
          maxWidth: '500px',
        }}
      >
        {cells}
      </div>
      
      {mode === 'walls' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-xl border-4 border-destructive/30 shadow-[inset_0_0_20px_hsl(var(--destructive)/0.2)]" />
        </div>
      )}
    </div>
  );
});

export default GameBoard;
