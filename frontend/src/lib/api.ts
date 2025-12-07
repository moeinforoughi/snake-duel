/**
 * API client using the backend HTTP endpoints.
 *
 * Uses `import.meta.env.VITE_API_BASE` if available, otherwise defaults to
 * `http://localhost:4000` (matches `openapi.yaml` server for local development).
 */

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  highScore: number;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  mode: 'passthrough' | 'walls';
  date: Date;
}

export interface ActivePlayer {
  id: string;
  username: string;
  currentScore: number;
  mode: 'passthrough' | 'walls';
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  isPlaying: boolean;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
const TOKEN_KEY = 'sd_token';

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'same-origin',
    ...opts,
    headers,
  });

  if (res.status === 204) {
    // No content
    return (null as unknown) as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Try to extract error message
    const err = body?.error || body?.detail || res.statusText || 'Request failed';
    throw new Error(err);
  }

  return body as T;
}

function mapUser(u: any): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    createdAt: new Date(u.created_at ?? u.createdAt),
    highScore: u.high_score ?? u.highScore ?? 0,
  };
}

function mapLeaderboardEntry(e: any): LeaderboardEntry {
  return {
    id: e.id,
    userId: e.user_id ?? e.userId,
    username: e.username,
    score: e.score,
    mode: e.mode,
    date: new Date(e.date),
  };
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      try {
        const body = await request<{ success: boolean; user?: any; error?: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        // If backend returns token in the future, store it
        if ((body as any).token) {
          localStorage.setItem(TOKEN_KEY, (body as any).token);
        }

        return { success: body.success, user: body.user ? mapUser(body.user) : undefined, error: body.error };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    async signup(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      try {
        const body = await request<{ success: boolean; user?: any; error?: string }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        });

        if ((body as any).token) {
          localStorage.setItem(TOKEN_KEY, (body as any).token);
        }

        return { success: body.success, user: body.user ? mapUser(body.user) : undefined, error: body.error };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },

    async logout(): Promise<void> {
      try {
        await request<void>('/auth/logout', { method: 'POST' });
      } finally {
        localStorage.removeItem(TOKEN_KEY);
      }
    },

    async getCurrentUser(): Promise<User | null> {
      try {
        const body = await request<any>('/auth/me', { method: 'GET' });
        return mapUser(body);
      } catch (_) {
        return null;
      }
    },
  },

  leaderboard: {
    async getTop(limit: number = 10, mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
      const params = new URLSearchParams();
      if (limit) params.set('limit', String(limit));
      if (mode) params.set('mode', mode);

      const body = await request<any>(`/leaderboard?${params.toString()}`, { method: 'GET' });
      return (body as any[]).map(mapLeaderboardEntry);
    },

    async submitScore(score: number, mode: 'passthrough' | 'walls'): Promise<{ success: boolean; rank?: number }> {
      try {
        const body = await request<{ success: boolean; rank?: number }>('/leaderboard/score', {
          method: 'POST',
          body: JSON.stringify({ score, mode }),
        });
        return { success: body.success, rank: body.rank };
      } catch (err: any) {
        return { success: false };
      }
    },
  },

  players: {
    async getActivePlayers(): Promise<ActivePlayer[]> {
      const body = await request<any>('/players/active', { method: 'GET' });
      return (body as any[]).map((p) => ({
        id: p.id,
        username: p.username,
        currentScore: p.current_score ?? p.currentScore,
        mode: p.mode,
        snake: p.snake.map((s: any) => ({ x: s.x, y: s.y })),
        food: { x: p.food.x, y: p.food.y },
        direction: p.direction,
        isPlaying: p.is_playing ?? p.isPlaying,
      }));
    },

    async getPlayerState(playerId: string): Promise<ActivePlayer | null> {
      try {
        const body = await request<any>(`/players/${playerId}`, { method: 'GET' });
        return {
          id: body.id,
          username: body.username,
          currentScore: body.current_score ?? body.currentScore,
          mode: body.mode,
          snake: body.snake.map((s: any) => ({ x: s.x, y: s.y })),
          food: { x: body.food.x, y: body.food.y },
          direction: body.direction,
          isPlaying: body.is_playing ?? body.isPlaying,
        };
      } catch (_) {
        return null;
      }
    },
    // Client-side simulation helper (keeps previous behavior)
    simulatePlayerMove(player: ActivePlayer, gridSize: number): ActivePlayer {
      const newPlayer = { ...player } as ActivePlayer;
      const head = { ...player.snake[0] };

      // Randomly change direction occasionally
      if (Math.random() < 0.1) {
        const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const opposite: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        const validDirections = directions.filter(d => d !== (opposite as any)[player.direction]);
        newPlayer.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
      }

      // Move head
      switch (newPlayer.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Wrap around
      head.x = (head.x + gridSize) % gridSize;
      head.y = (head.y + gridSize) % gridSize;

      newPlayer.snake = [head, ...player.snake.slice(0, -1)];

      // Check if ate food
      if (head.x === player.food.x && head.y === player.food.y) {
        newPlayer.snake = [head, ...player.snake];
        newPlayer.food = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        };
        newPlayer.currentScore += 10;
      }

      return newPlayer;
    },
  },
};

export default api;
