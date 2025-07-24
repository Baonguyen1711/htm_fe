// API-related constants
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    ACCESS_TOKEN: '/auth/access_token',
  },
  
  // Game
  GAME: {
    QUESTIONS: '/game/question/round',
    PREFETCH: '/game/question/prefetch',
    PACKETS: '/game/question/round/packet',
    GRID: '/game/grid',
    ROUND_START: '/game/round/start',
    SCORING: '/game/scoring',
    ANSWER: '/game/answer',
    BROADCAST_ANSWER: '/game/broadcast/answer',
    TURN: '/game/turn',
    RULES: '/game/rules',
  },
  
  // Room
  ROOM: {
    BASE: '/room',
    JOIN: '/room/join',
    VALIDATE: '/room/validate',
    LEAVE: '/room/leave',
    SPECTATOR: '/room/spectator',
  },
  
  // Test Management
  TEST: {
    BASE: '/test',
    UPLOAD: '/test/upload',
    USER: '/test/user',
    UPDATE: '/test/update',
  },
  
  // File Upload
  S3: {
    PRESIGNED_URL: '/s3/presigned-url',
    FILES: '/s3/files',
    SAVE_KEY: '/s3/save-file-key',
  },
  
  // Sound
  SOUND: {
    PLAY: '/sound/play',
  },
  
  // Buzz
  BUZZ: {
    BASE: '/buzz',
    OPEN: '/buzz/open',
    CLOSE: '/buzz/close',
    RESET: '/buzz/reset',
  },
  
  // Star
  STAR: {
    BASE: '/star',
  },
  
  // History
  HISTORY: {
    UPDATE: '/history/update',
    RETRIEVE: '/history/retrive', // Note: keeping original typo for compatibility
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const REQUEST_TIMEOUT = 30000; // 30 seconds

export const RETRY_ATTEMPTS = 3;

export const RETRY_DELAY = 1000; // 1 second
