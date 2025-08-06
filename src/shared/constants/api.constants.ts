// API-related constants
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    AUTHENTICATE: '/auth/token',
    IS_HOST: '/auth/isHost',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    ACCESS_TOKEN: '/auth/access_token',
  },
  
  // Game
  GAME: {
    QUESTION_BY_ROUND: '/game/question/round',
    QUESTION: '/game/question',
    CORRECT_ANSWER: '/game/answer',
    PREFETCH: '/game/question/prefetch',
    PACKETS: '/game/question/round/packet',
    SELECTED_PACKETS: '/game/packet/set',
    SELECTED_CELL: '/game/grid/cell',
    OPEN_OBSTACLE: '/game/obstacle',
    CELL_COLOR: '/game/grid/color',
    USED_PACKETS: '/game/packet/used',
    RETURN_TO_PACKET_SELECTION: '/game/packet/return',
    GRID: '/game/grid',
    ROUND_START: '/game/round/start',
    TIME_START: '/game/time',
    ROW_ACTION: '/game/row/action',
    SCORING: '/game/score',
    SUBMIT: '/game/submit',
    BROADCAST_ANSWER: '/game/broadcast',
    TURN: '/game/turn',
    RULES: '/game/score/rules',
    RULES_SHOW: '/game/rules/show',
    RULES_HIDE: '/game/rules/hide',
    HISTORY: '/history/update',
    PLAYER_COLOR: '/game/player/color',
  },
  
  // Room
  ROOM: {
    BASE: '/room',
    CREATE: '/room/create',
    JOIN: '/room/join',
    VALIDATE: '/room/validate',
    INFO: '/room/info',
    LEAVE: '/room/leave',
    SPECTATOR: '/room/spectator/join',
  },

  // Room
  HISSTORY: {
    BASE: '/history',
    RETRIEVE: '/history/retrive',
  },
  
  // Test Management
  TEST: {
    BASE: '/test',
    UPLOAD: '/test/upload',
    USER: '/test/user',
    UPDATE: '/test/question/update',
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
    RESET: '/star/reset'
  },
  
  // History
  HISTORY: {
    UPDATE: '/history/update',
    RETRIEVE: '/history/retrieve', 
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
