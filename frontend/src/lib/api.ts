/**
 * Centralized Mock API Module
 * All backend calls go through this module for future multiplayer support
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

// Simulated delay for realistic async behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let currentUser: User | null = null;

const mockUsers: Map<string, User & { password: string }> = new Map([
  ['user1', { id: 'user1', username: 'NeonViper', email: 'neon@snake.io', password: 'pass123', createdAt: new Date('2024-01-15'), highScore: 1250 }],
  ['user2', { id: 'user2', username: 'PixelHunter', email: 'pixel@snake.io', password: 'pass123', createdAt: new Date('2024-02-20'), highScore: 890 }],
  ['user3', { id: 'user3', username: 'ByteSlayer', email: 'byte@snake.io', password: 'pass123', createdAt: new Date('2024-03-10'), highScore: 2100 }],
]);

const mockLeaderboard: LeaderboardEntry[] = [
  { id: 'l1', userId: 'user3', username: 'ByteSlayer', score: 2100, mode: 'walls', date: new Date('2024-11-28') },
  { id: 'l2', userId: 'user4', username: 'CodeNinja', score: 1850, mode: 'passthrough', date: new Date('2024-11-30') },
  { id: 'l3', userId: 'user5', username: 'GlitchMaster', score: 1720, mode: 'walls', date: new Date('2024-12-01') },
  { id: 'l4', userId: 'user1', username: 'NeonViper', score: 1250, mode: 'passthrough', date: new Date('2024-12-02') },
  { id: 'l5', userId: 'user6', username: 'DataStorm', score: 1180, mode: 'walls', date: new Date('2024-12-03') },
  { id: 'l6', userId: 'user7', username: 'CyberPunk', score: 1050, mode: 'passthrough', date: new Date('2024-12-04') },
  { id: 'l7', userId: 'user2', username: 'PixelHunter', score: 890, mode: 'walls', date: new Date('2024-12-05') },
  { id: 'l8', userId: 'user8', username: 'QuantumFlux', score: 780, mode: 'passthrough', date: new Date('2024-12-05') },
  { id: 'l9', userId: 'user9', username: 'VectorShift', score: 650, mode: 'walls', date: new Date('2024-12-06') },
  { id: 'l10', userId: 'user10', username: 'MatrixRunner', score: 520, mode: 'passthrough', date: new Date('2024-12-06') },
];

// Simulated active players for watch mode
const createMockActivePlayers = (): ActivePlayer[] => [
  {
    id: 'active1',
    username: 'NeonViper',
    currentScore: Math.floor(Math.random() * 500) + 100,
    mode: 'passthrough',
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 12 },
    direction: 'RIGHT',
    isPlaying: true,
  },
  {
    id: 'active2',
    username: 'GlitchMaster',
    currentScore: Math.floor(Math.random() * 800) + 200,
    mode: 'walls',
    snake: [{ x: 5, y: 15 }, { x: 5, y: 14 }, { x: 5, y: 13 }],
    food: { x: 12, y: 8 },
    direction: 'DOWN',
    isPlaying: true,
  },
  {
    id: 'active3',
    username: 'ByteSlayer',
    currentScore: Math.floor(Math.random() * 1200) + 300,
    mode: 'passthrough',
    snake: [{ x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }],
    food: { x: 3, y: 5 },
    direction: 'UP',
    isPlaying: true,
  },
];

// Auth API
export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      await delay(500);
      
      const user = Array.from(mockUsers.values()).find(u => u.email === email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      if (user.password !== password) {
        return { success: false, error: 'Invalid password' };
      }
      
      currentUser = { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt, highScore: user.highScore };
      return { success: true, user: currentUser };
    },

    async signup(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
      await delay(600);
      
      const existingEmail = Array.from(mockUsers.values()).find(u => u.email === email);
      if (existingEmail) {
        return { success: false, error: 'Email already exists' };
      }
      
      const existingUsername = Array.from(mockUsers.values()).find(u => u.username === username);
      if (existingUsername) {
        return { success: false, error: 'Username already taken' };
      }
      
      const newUser: User & { password: string } = {
        id: `user${Date.now()}`,
        username,
        email,
        password,
        createdAt: new Date(),
        highScore: 0,
      };
      
      mockUsers.set(newUser.id, newUser);
      currentUser = { id: newUser.id, username: newUser.username, email: newUser.email, createdAt: newUser.createdAt, highScore: newUser.highScore };
      
      return { success: true, user: currentUser };
    },

    async logout(): Promise<void> {
      await delay(200);
      currentUser = null;
    },

    async getCurrentUser(): Promise<User | null> {
      await delay(100);
      return currentUser;
    },
  },

  leaderboard: {
    async getTop(limit: number = 10, mode?: 'passthrough' | 'walls'): Promise<LeaderboardEntry[]> {
      await delay(300);
      
      let entries = [...mockLeaderboard];
      
      if (mode) {
        entries = entries.filter(e => e.mode === mode);
      }
      
      return entries.sort((a, b) => b.score - a.score).slice(0, limit);
    },

    async submitScore(score: number, mode: 'passthrough' | 'walls'): Promise<{ success: boolean; rank?: number }> {
      await delay(400);
      
      if (!currentUser) {
        return { success: false };
      }
      
      const entry: LeaderboardEntry = {
        id: `l${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        score,
        mode,
        date: new Date(),
      };
      
      mockLeaderboard.push(entry);
      
      const rank = mockLeaderboard
        .filter(e => e.mode === mode)
        .sort((a, b) => b.score - a.score)
        .findIndex(e => e.id === entry.id) + 1;
      
      // Update high score
      if (score > currentUser.highScore) {
        currentUser.highScore = score;
        const userData = mockUsers.get(currentUser.id);
        if (userData) {
          userData.highScore = score;
        }
      }
      
      return { success: true, rank };
    },
  },

  players: {
    async getActivePlayers(): Promise<ActivePlayer[]> {
      await delay(200);
      return createMockActivePlayers();
    },

    async getPlayerState(playerId: string): Promise<ActivePlayer | null> {
      await delay(100);
      const players = createMockActivePlayers();
      return players.find(p => p.id === playerId) || null;
    },

    // Simulate player movement for watch mode
    simulatePlayerMove(player: ActivePlayer, gridSize: number): ActivePlayer {
      const newPlayer = { ...player };
      const head = { ...player.snake[0] };
      
      // Randomly change direction occasionally
      if (Math.random() < 0.1) {
        const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const opposite: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        const validDirections = directions.filter(d => d !== opposite[player.direction]);
        newPlayer.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
      }
      
      // Move head
      switch (newPlayer.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      
      // Wrap around for simulation
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
