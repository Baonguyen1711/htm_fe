// Game-related constants
export const ROUNDS = {
  ROUND_1: 1,
  ROUND_2: 2,
  ROUND_3: 3,
  ROUND_4: 4,
} as const;

export const GAME_MODES = {
  MANUAL: 'manual',
  AUTO: 'auto',
  ADAPTIVE: 'adaptive',
} as const;

export const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const ROUND_4_DIFFICULTIES = {
  EASY: { range: [1, 20], points: 20 },
  MEDIUM: { range: [21, 40], points: 25 },
  HARD: { range: [41, 60], points: 30 },
} as const;

export const DEFAULT_SCORE_RULES = {
  round1: [20, 15, 10, 5],
  round2: [20, 15, 10, 5],
  round3: [10, 10, 10, 10],
  round4: [20, 25, 30],
} as const;

export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;

export const DEFAULT_TIME_LIMIT = 30; // seconds

export const ROUND_2_GRID_SIZE = {
  ROWS: 7,
  COLS: 15,
} as const;

export const ROUND_4_GRID_SIZE = {
  ROWS: 5,
  COLS: 5,
} as const;

export const QUESTION_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
} as const;

export const PLAYER_ROLES = {
  PLAYER: 'player',
  SPECTATOR: 'spectator',
  HOST: 'host',
} as const;

export const GAME_EVENTS = {
  QUESTION_START: 'question_start',
  QUESTION_END: 'question_end',
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  GAME_START: 'game_start',
  GAME_END: 'game_end',
  PLAYER_ANSWER: 'player_answer',
  SCORE_UPDATE: 'score_update',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
} as const;

export const FLASH_DURATION = 3000; // 3 seconds

export const BUZZ_TIMEOUT = 4000; // 4 seconds for Round 4 buzz

export const TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes
