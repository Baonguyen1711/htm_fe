// User-related type definitions
import { BaseEntity } from './common.types';

export interface User {
  uid?: string;
  userName?: string;
  email?: string;
  avatar?: string;
  stt?: string; // Player position/number
  lastActive?: number;
  isOnline?: boolean;
}

export interface PlayerData extends User {
  answer?: string;
  score?: number;
  isModified?: boolean;
  flashColor?: string | null;
  roundScores?: (number | null)[];
  time?: number;
  isCorrect?: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
}

export interface UserProfile {
  uid: string;
  userName: string;
  avatar: string;
  email?: string;
  createdAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

// Authentication states
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken?: string | null;
  tokenExpiry: number | null;
}

// Player context types (migrated from old context)
export interface PlayerContextState {
  currentPlayer: PlayerData | null;
  players: PlayerData[];
  roomId: string;
  position: string;
  selectedTopic: string;
  currentQuestion: string;
  answerList: Answer[];
  level: string;
  animationKey: number;
}

export interface Answer extends User{
  time?: number;
}
