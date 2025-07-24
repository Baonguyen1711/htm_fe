// Game-related type definitions
import { BaseEntity, LoadingState } from './common.types';
import { PlayerData } from './user.types';

export interface Question extends BaseEntity {
  questionId?: string;
  question: string;
  answer: string | string[]; // Can be single answer or multiple correct answers
  type?: string;
  imgUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  round: 1 | 2 | 3 | 4;
  stt?: number; // Question number in sequence
  packetName?: string;
  testId?: string;
}

export interface GameGrid {
  cells: string[][];
  rows: number;
  cols: number;
}

export interface Round2Grid extends GameGrid {
  horizontalRows: string[];
  cnv: string; // Obstacle word
  selectedRows: number[];
  correctRows: number[];
  incorrectRows: number[];
}

export interface Round4Cell {
  id: string;
  question: Question;
  isSelected: boolean;
  isAnswered: boolean;
  isCorrect?: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hasStar?: boolean;
}

export interface Round4Grid {
  cells: Round4Cell[][];
  selectedDifficulties: string[];
  starPositions: { row: number; col: number }[];
}

export interface Score {
  playerName: string;
  avatar: string;
  score: number;
  isCorrect: boolean;
  isModified: boolean; // For flashing effects
  stt: string;
  flashColor?: string | null; // Allow null for compatibility
}

export interface ScoreRule {
  round1: number[];
  round2: number[];
  round3: number[];
  round4: number[];
}

export interface GameState {
  // Current game status
  currentRound: number;
  isActive: boolean;
  isHost: boolean;
  
  // Questions and answers
  currentQuestion: Question | null;
  questions: Question[];
  currentCorrectAnswer: string[] | null;
  
  // Players and scoring
  players: PlayerData[];
  scores: Score[];
  scoreRules: ScoreRule | null;
  
  // Round-specific data
  round2Grid: Round2Grid | null;
  round4Grid: Round4Grid | null;
  
  // Game settings
  mode: 'manual' | 'auto' | 'adaptive';
  timeLimit: number;
  
  // UI state
  showRules: boolean;
  currentTurn: number;
  questionNumber: number;
  
  // Loading states
  loading: LoadingState;
}

export interface GameSettings {
  mode: 'manual' | 'auto' | 'adaptive';
  timeLimit: number;
  playerCount: number;
  rounds: number[];
  scoreRules: ScoreRule;
  round4Difficulties: string[];
}

// Game events for real-time updates
export interface GameEvent {
  type: 'question_start' | 'question_end' | 'round_start' | 'round_end' | 'game_end' | 'player_answer' | 'score_update';
  data: any;
  timestamp: number;
  roomId: string;
}
