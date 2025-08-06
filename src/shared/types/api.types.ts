// API-related type definitions
import { ApiResponse } from './common.types';
import { Question, Score, GameGrid } from './game.types';
import { Room, CreateRoomRequest, JoinRoomRequest } from './room.types';
import { User, AuthUser, PlayerData } from './user.types';

// Authentication API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends ApiResponse {
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse extends ApiResponse {
  data: {
    accessToken: string;
    expiresIn: number;
  };
}

// Game API types
export interface GetQuestionsRequest {
  testName: string;
  round: string;
  roomId?: string,
  questionNumber?: number,
  packetName?: string;
  difficulty?: string;
}

export interface GetQuestionsResponse extends ApiResponse {
  data: Question[];
}

export interface SubmitAnswerRequest {
  answer: string,
  stt: string,
  time: Number,
  player_name: string,
  avatar: string
}

export interface SubmitAnswerResponse extends ApiResponse {
  data: {
    isCorrect: boolean;
    score: number;
  };
}

export interface ScoringRequest {
  roomId: string;
  mode: 'manual' | 'auto' | 'adaptive';
  scores?: Partial<PlayerData[]>;
  round: string;
  stt?: string;
  isObstacleCorrect?: boolean;
  obstaclePoint?: number;
  isCorrect?: boolean;
  round4Mode?: string;
  difficulty?: string;
  isTakeTurnCorrect?: boolean;
  sttTakeTurn?: string;
  sttTaken?: string;
}

export interface ScoringResponse extends ApiResponse {
  data: Score[];
}

export interface SetPlayerColorRequest {
  roomId: string;
  playerStt: string;
  color: string;
}

export interface SetPlayerColorResponse extends ApiResponse {
  data: {
    success: boolean;
  };
}

// Room API types
export interface CreateRoomResponse extends ApiResponse {
  data: Room;
}

export interface JoinRoomResponse extends ApiResponse {
  data: {
    room: Room;
    accessToken: string;
  };
}

export interface GetRoomsResponse extends ApiResponse {
  data: Room[];
}

// Test Management API types
export interface UploadTestRequest {
  testName: string;
  file: File;
}

export interface UploadTestResponse extends ApiResponse {
  data: {
    testId: string;
    questionsCount: number;
  };
}

export interface GetTestsResponse extends ApiResponse {
  data: {
    testName: string;
    questionsCount: number;
    createdAt: string;
  }[];
}

// Grid API types
export interface SendGridRequest {
  roomId: string;
  grid: string[][];
}

export interface SendGridResponse extends ApiResponse {
  data: {
    success: boolean;
  };
}

// File Upload API types
export interface UploadFileRequest {
  file: File;
  type: 'image' | 'audio' | 'document';
}

export interface UploadFileResponse extends ApiResponse {
  data: {
    url: string;
    key: string;
    size: number;
  };
}

// Error response type
export interface ApiError {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}
