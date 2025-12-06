import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  getOppositeDirection,
  isValidDirectionChange,
  moveSnake,
  checkCollision,
  setDirection,
  togglePause,
  resetGame,
  getDirectionFromKey,
  calculateScore,
  INITIAL_SNAKE_LENGTH,
  type GameState,
  type Position,
} from './game-logic';

describe('createInitialState', () => {
  it('should create a valid initial state with default values', () => {
    const state = createInitialState();
    
    expect(state.gridSize).toBe(20);
    expect(state.mode).toBe('passthrough');
    expect(state.snake.length).toBe(INITIAL_SNAKE_LENGTH);
    expect(state.direction).toBe('RIGHT');
    expect(state.nextDirection).toBe('RIGHT');
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.isPaused).toBe(false);
  });

  it('should create state with custom grid size and mode', () => {
    const state = createInitialState(30, 'walls');
    
    expect(state.gridSize).toBe(30);
    expect(state.mode).toBe('walls');
  });

  it('should place snake in the center of the grid', () => {
    const gridSize = 20;
    const state = createInitialState(gridSize);
    const centerY = Math.floor(gridSize / 2);
    
    expect(state.snake[0].y).toBe(centerY);
  });
});

describe('generateFood', () => {
  it('should generate food position within grid bounds', () => {
    const gridSize = 20;
    const snake: Position[] = [{ x: 10, y: 10 }];
    
    for (let i = 0; i < 100; i++) {
      const food = generateFood(snake, gridSize);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(gridSize);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(gridSize);
    }
  });

  it('should not place food on snake', () => {
    const gridSize = 20;
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    
    for (let i = 0; i < 50; i++) {
      const food = generateFood(snake, gridSize);
      const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
      expect(onSnake).toBe(false);
    }
  });
});

describe('getOppositeDirection', () => {
  it('should return correct opposite directions', () => {
    expect(getOppositeDirection('UP')).toBe('DOWN');
    expect(getOppositeDirection('DOWN')).toBe('UP');
    expect(getOppositeDirection('LEFT')).toBe('RIGHT');
    expect(getOppositeDirection('RIGHT')).toBe('LEFT');
  });
});

describe('isValidDirectionChange', () => {
  it('should allow perpendicular direction changes', () => {
    expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
  });

  it('should not allow opposite direction changes', () => {
    expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
    expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
  });

  it('should allow same direction', () => {
    expect(isValidDirectionChange('UP', 'UP')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
  });
});

describe('moveSnake', () => {
  it('should move snake in current direction', () => {
    const state = createInitialState(20, 'passthrough');
    const initialHead = state.snake[0];
    
    const newState = moveSnake(state);
    
    expect(newState.snake[0].x).toBe(initialHead.x + 1);
    expect(newState.snake[0].y).toBe(initialHead.y);
  });

  it('should wrap around in passthrough mode', () => {
    const state = createInitialState(20, 'passthrough');
    state.snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }];
    state.direction = 'RIGHT';
    state.nextDirection = 'RIGHT';
    
    const newState = moveSnake(state);
    
    expect(newState.snake[0].x).toBe(0);
    expect(newState.isGameOver).toBe(false);
  });

  it('should end game on wall collision in walls mode', () => {
    const state = createInitialState(20, 'walls');
    state.snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }];
    state.direction = 'RIGHT';
    state.nextDirection = 'RIGHT';
    
    const newState = moveSnake(state);
    
    expect(newState.isGameOver).toBe(true);
  });

  it('should end game on self collision', () => {
    const state = createInitialState(20, 'passthrough');
    state.snake = [
      { x: 10, y: 10 },
      { x: 11, y: 10 },
      { x: 11, y: 11 },
      { x: 10, y: 11 },
      { x: 9, y: 11 },
    ];
    state.direction = 'DOWN';
    state.nextDirection = 'DOWN';
    
    const newState = moveSnake(state);
    
    expect(newState.isGameOver).toBe(true);
  });

  it('should grow snake when eating food', () => {
    const state = createInitialState(20, 'passthrough');
    const initialLength = state.snake.length;
    state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
    
    const newState = moveSnake(state);
    
    expect(newState.snake.length).toBe(initialLength + 1);
    expect(newState.score).toBe(10);
  });

  it('should not move when paused', () => {
    const state = createInitialState(20, 'passthrough');
    state.isPaused = true;
    const initialSnake = [...state.snake];
    
    const newState = moveSnake(state);
    
    expect(newState.snake).toEqual(initialSnake);
  });

  it('should not move when game over', () => {
    const state = createInitialState(20, 'passthrough');
    state.isGameOver = true;
    const initialSnake = [...state.snake];
    
    const newState = moveSnake(state);
    
    expect(newState.snake).toEqual(initialSnake);
  });
});

describe('checkCollision', () => {
  it('should detect collision with snake body', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    
    expect(checkCollision({ x: 9, y: 10 }, snake)).toBe(true);
    expect(checkCollision({ x: 5, y: 5 }, snake)).toBe(false);
  });
});

describe('setDirection', () => {
  it('should update direction when valid', () => {
    const state = createInitialState();
    
    const newState = setDirection(state, 'UP');
    
    expect(newState.nextDirection).toBe('UP');
  });

  it('should not update to opposite direction', () => {
    const state = createInitialState();
    state.direction = 'RIGHT';
    
    const newState = setDirection(state, 'LEFT');
    
    expect(newState.nextDirection).toBe('RIGHT');
  });

  it('should not update when paused', () => {
    const state = createInitialState();
    state.isPaused = true;
    
    const newState = setDirection(state, 'UP');
    
    expect(newState.nextDirection).toBe('RIGHT');
  });
});

describe('togglePause', () => {
  it('should toggle pause state', () => {
    const state = createInitialState();
    
    const pausedState = togglePause(state);
    expect(pausedState.isPaused).toBe(true);
    
    const unpausedState = togglePause(pausedState);
    expect(unpausedState.isPaused).toBe(false);
  });

  it('should not toggle when game over', () => {
    const state = createInitialState();
    state.isGameOver = true;
    
    const newState = togglePause(state);
    
    expect(newState.isPaused).toBe(false);
  });
});

describe('resetGame', () => {
  it('should reset to initial state with same settings', () => {
    const state = createInitialState(25, 'walls');
    state.score = 100;
    state.isGameOver = true;
    
    const newState = resetGame(state);
    
    expect(newState.score).toBe(0);
    expect(newState.isGameOver).toBe(false);
    expect(newState.gridSize).toBe(25);
    expect(newState.mode).toBe('walls');
  });
});

describe('getDirectionFromKey', () => {
  it('should return direction for arrow keys', () => {
    expect(getDirectionFromKey('ArrowUp')).toBe('UP');
    expect(getDirectionFromKey('ArrowDown')).toBe('DOWN');
    expect(getDirectionFromKey('ArrowLeft')).toBe('LEFT');
    expect(getDirectionFromKey('ArrowRight')).toBe('RIGHT');
  });

  it('should return direction for WASD keys', () => {
    expect(getDirectionFromKey('w')).toBe('UP');
    expect(getDirectionFromKey('W')).toBe('UP');
    expect(getDirectionFromKey('s')).toBe('DOWN');
    expect(getDirectionFromKey('a')).toBe('LEFT');
    expect(getDirectionFromKey('d')).toBe('RIGHT');
  });

  it('should return null for invalid keys', () => {
    expect(getDirectionFromKey('x')).toBe(null);
    expect(getDirectionFromKey('Enter')).toBe(null);
  });
});

describe('calculateScore', () => {
  it('should calculate correct score based on snake length', () => {
    expect(calculateScore(3)).toBe(0);
    expect(calculateScore(4)).toBe(10);
    expect(calculateScore(8)).toBe(50);
  });
});
