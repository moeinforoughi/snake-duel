/**
 * Core Snake Game Logic
 * Separated for testability and reusability
 */

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'passthrough' | 'walls';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  mode: GameMode;
  gridSize: number;
  speed: number;
}

export const INITIAL_SNAKE_LENGTH = 3;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

export function createInitialState(gridSize: number = 20, mode: GameMode = 'passthrough'): GameState {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  
  const snake: Position[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: centerX - i, y: centerY });
  }
  
  return {
    snake,
    food: generateFood(snake, gridSize),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    isGameOver: false,
    isPaused: false,
    mode,
    gridSize,
    speed: INITIAL_SPEED,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  const snakeSet = new Set(snake.map(p => `${p.x},${p.y}`));
  
  let food: Position;
  let attempts = 0;
  const maxAttempts = gridSize * gridSize;
  
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    attempts++;
  } while (snakeSet.has(`${food.x},${food.y}`) && attempts < maxAttempts);
  
  return food;
}

export function getOppositeDirection(direction: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[direction];
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return next !== getOppositeDirection(current);
}

export function moveSnake(state: GameState): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }
  
  const { snake, food, nextDirection, mode, gridSize } = state;
  const head = snake[0];
  
  // Calculate new head position
  let newHead: Position = { ...head };
  
  switch (nextDirection) {
    case 'UP':
      newHead.y -= 1;
      break;
    case 'DOWN':
      newHead.y += 1;
      break;
    case 'LEFT':
      newHead.x -= 1;
      break;
    case 'RIGHT':
      newHead.x += 1;
      break;
  }
  
  // Handle boundaries based on mode
  if (mode === 'passthrough') {
    newHead.x = (newHead.x + gridSize) % gridSize;
    newHead.y = (newHead.y + gridSize) % gridSize;
  } else {
    // Walls mode - check for collision with walls
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
      return { ...state, isGameOver: true, direction: nextDirection };
    }
  }
  
  // Check for self collision (exclude tail as it will move)
  const bodyWithoutTail = snake.slice(0, -1);
  if (checkCollision(newHead, bodyWithoutTail)) {
    return { ...state, isGameOver: true, direction: nextDirection };
  }
  
  // Check if eating food
  const ateFood = newHead.x === food.x && newHead.y === food.y;
  
  let newSnake: Position[];
  let newScore = state.score;
  let newFood = food;
  let newSpeed = state.speed;
  
  if (ateFood) {
    // Grow snake
    newSnake = [newHead, ...snake];
    newScore += 10;
    newFood = generateFood(newSnake, gridSize);
    
    // Increase speed
    newSpeed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);
  } else {
    // Move snake (remove tail)
    newSnake = [newHead, ...snake.slice(0, -1)];
  }
  
  return {
    ...state,
    snake: newSnake,
    food: newFood,
    score: newScore,
    direction: nextDirection,
    speed: newSpeed,
  };
}

export function checkCollision(position: Position, snake: Position[]): boolean {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

export function setDirection(state: GameState, newDirection: Direction): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }
  
  if (!isValidDirectionChange(state.direction, newDirection)) {
    return state;
  }
  
  return { ...state, nextDirection: newDirection };
}

export function togglePause(state: GameState): GameState {
  if (state.isGameOver) {
    return state;
  }
  
  return { ...state, isPaused: !state.isPaused };
}

export function resetGame(state: GameState): GameState {
  return createInitialState(state.gridSize, state.mode);
}

export function getDirectionFromKey(key: string): Direction | null {
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP',
    W: 'UP',
    s: 'DOWN',
    S: 'DOWN',
    a: 'LEFT',
    A: 'LEFT',
    d: 'RIGHT',
    D: 'RIGHT',
  };
  
  return keyMap[key] || null;
}

export function calculateScore(snakeLength: number): number {
  return (snakeLength - INITIAL_SNAKE_LENGTH) * 10;
}
