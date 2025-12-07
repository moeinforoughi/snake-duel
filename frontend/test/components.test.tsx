import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock toast to avoid UI side-effects
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Provide a single, consistent Auth mock for all tests
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(async (email: string, password: string) => ({ success: email === 'ok@example.com' && password === 'pwd' })),
    signup: vi.fn(async (username: string, email: string, password: string) => ({ success: true })),
    user: { id: 'u1', username: 't', highScore: 0 },
    isLoading: false,
  }),
}));

// Mock API for leaderboard
vi.mock('@/lib/api', () => ({
  default: {
    leaderboard: {
      getTop: vi.fn(async (limit: number, mode?: any) => [
        { id: '1', username: 'top', score: 1000, mode: mode || 'passthrough', date: new Date().toISOString(), userId: 'u1' },
        { id: '2', username: 'second', score: 500, mode: mode || 'passthrough', date: new Date().toISOString(), userId: 'u2' },
      ]),
    },
  },
}));

// Mock game logic for SnakeGame tests
vi.mock('@/lib/game-logic', () => ({
  createInitialState: () => ({ snake: [{ x: 0, y: 0 }], food: { x: 5, y: 5 }, gridSize: 20, mode: 'passthrough', direction: 'RIGHT', nextDirection: 'RIGHT', score: 0, isGameOver: false, isPaused: false, speed: 100 }),
  moveSnake: () => ({}),
  setDirection: vi.fn((s, d) => ({ ...s, nextDirection: d })),
  togglePause: vi.fn((s) => ({ ...s, isPaused: !s.isPaused })),
  resetGame: vi.fn((s) => ({ ...s, score: 0, isGameOver: false })),
  getDirectionFromKey: (k: string) => {
    const map: Record<string, string> = { w: 'UP', W: 'UP', ArrowUp: 'UP', s: 'DOWN' };
    return (map as any)[k];
  },
}));

import LoginForm from '@/components/Auth/LoginForm';
import SignupForm from '@/components/Auth/SignupForm';
import Leaderboard from '@/components/Leaderboard/Leaderboard';
import SnakeGame from '@/components/Game/SnakeGame';

describe('Auth Forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onSuccess when login succeeds', async () => {
    const onSuccess = vi.fn();
    const onSwitch = vi.fn();

    render(<LoginForm onSwitchToSignup={onSwitch} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/player@snake.io/i), 'ok@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pwd');

    const btn = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(btn);

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('calls onSuccess when signup succeeds', async () => {
    const onSuccess = vi.fn();
    const onSwitch = vi.fn();

    render(<SignupForm onSwitchToLogin={onSwitch} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/NeonViper/i), 'newuser');
    await userEvent.type(screen.getByPlaceholderText(/player@snake.io/i), 'n@example.com');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await userEvent.type(passwordInputs[0], 'password');
    await userEvent.type(passwordInputs[1], 'password');

    const btn = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(btn);

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});

describe('Leaderboard', () => {
  it('renders entries from API', async () => {
    render(<Leaderboard />);
    expect(await screen.findByText(/top/i)).toBeTruthy();
    expect(await screen.findByText(/second/i)).toBeTruthy();
  });

  it('changes mode and fetches again', async () => {
    const api = (await import('@/lib/api')).default;
    render(<Leaderboard />);

    const passthroughBtn = screen.getByRole('button', { name: /pass-through/i });
    userEvent.click(passthroughBtn);

    await waitFor(() => expect(api.leaderboard.getTop).toHaveBeenCalled());
  });
});

describe('SnakeGame keyboard handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setDirection when modal is closed', async () => {
    render(<SnakeGame isModalOpen={false} />);
    fireEvent.keyDown(window, { key: 'w' });
    const gl = await import('@/lib/game-logic');
    await waitFor(() => expect(gl.setDirection).toHaveBeenCalled());
  });

  it('does not call setDirection when modal is open', async () => {
    render(<SnakeGame isModalOpen={true} />);
    fireEvent.keyDown(window, { key: 'w' });
    const gl = await import('@/lib/game-logic');
    await waitFor(() => expect(gl.setDirection).not.toHaveBeenCalled());
  });
});
