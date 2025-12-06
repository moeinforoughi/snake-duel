import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import ScoreDisplay from './ScoreDisplay';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  createInitialState,
  moveSnake,
  setDirection,
  togglePause,
  resetGame,
  getDirectionFromKey,
  type GameState,
  type GameMode,
  type Direction,
} from '@/lib/game-logic';

const GRID_SIZE = 20;

export default function SnakeGame() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(() => 
    createInitialState(GRID_SIZE, 'passthrough')
  );
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        setGameState(prev => togglePause(prev));
        return;
      }
      
      const direction = getDirectionFromKey(e.key);
      if (direction) {
        e.preventDefault();
        setGameState(prev => setDirection(prev, direction));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Game loop
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    let lastTime = 0;
    
    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTime >= gameState.speed) {
        setGameState(prev => moveSnake(prev));
        lastTime = currentTime;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, gameState.speed]);
  
  // Submit score on game over
  useEffect(() => {
    if (gameState.isGameOver && !hasSubmittedScore && user && gameState.score > 0) {
      setHasSubmittedScore(true);
      api.leaderboard.submitScore(gameState.score, gameState.mode).then(result => {
        if (result.success && result.rank) {
          toast.success(`Score submitted! Rank #${result.rank}`);
        }
      });
    }
  }, [gameState.isGameOver, gameState.score, gameState.mode, hasSubmittedScore, user]);
  
  const handleTogglePause = useCallback(() => {
    setGameState(prev => togglePause(prev));
  }, []);
  
  const handleReset = useCallback(() => {
    setGameState(prev => resetGame(prev));
    setHasSubmittedScore(false);
  }, []);
  
  const handleDirectionChange = useCallback((direction: Direction) => {
    setGameState(prev => setDirection(prev, direction));
  }, []);
  
  const handleModeChange = useCallback((mode: GameMode) => {
    setGameState(createInitialState(GRID_SIZE, mode));
    setHasSubmittedScore(false);
  }, []);
  
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <Card variant="game" className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-glow">
            SNAKE
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              {gameState.mode === 'passthrough' ? 'Pass-Through Mode' : 'Walls Mode'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <ScoreDisplay 
              score={gameState.score} 
              highScore={user?.highScore}
              isGameOver={gameState.isGameOver}
            />
          </div>
          
          <GameBoard
            snake={gameState.snake}
            food={gameState.food}
            gridSize={gameState.gridSize}
            mode={gameState.mode}
            isGameOver={gameState.isGameOver}
          />
          
          <GameControls
            isPaused={gameState.isPaused}
            isGameOver={gameState.isGameOver}
            mode={gameState.mode}
            onTogglePause={handleTogglePause}
            onReset={handleReset}
            onDirectionChange={handleDirectionChange}
            onModeChange={handleModeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
