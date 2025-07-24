// Central export file for all type definitions
// This allows for clean imports like: import { User, Question } from '@/shared/types'

// Common types
export * from './common.types';

// User types
export * from './user.types';

// Game types
export * from './game.types';

// Room types
export * from './room.types';

// API types
export * from './api.types';

// Legacy types (for backward compatibility during migration)
// These can be removed once migration is complete
export interface LegacyRoundBase {
  isHost?: boolean;
}

// Re-export commonly used types with aliases for convenience
export type {
  User as PlayerType,
} from './user.types';

export type {
  Question as QuestionType,
  GameState as GameStateType,
} from './game.types';

export type {
  Room as RoomType,
} from './room.types';

export type {
  ApiResponse as APIResponse,
} from './common.types';
