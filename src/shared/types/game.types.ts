// Game-related type definitions
import { Answer } from './user.types';
import { BaseEntity, LoadingState } from './common.types';
import { RoomPlayer } from './room.types';
import { PlayerData } from './user.types';

export interface Question extends BaseEntity {
  questionId: string;
  question: string;
  answer: string;
  type?: string;
  imgUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  round: string;
  stt?: number; // Question number in sequence
  packetName?: string;
  testId: string;
  groupName?: string; // For question grouping
  [key: string]: any; // For additional fields
}

export interface GameGrid {
  cells?: string[][];
  rows?: number;
  cols?: number;
}

export interface Round2Grid extends GameGrid {
  horizontalRows?: string[];
  cnv?: string; // Obstacle word
  rowsIndex?: {
    number: number,
    rowIndex: number,
    colIndex: number
  }[]
  actionRowIndex?: {
    rowIndex: number,
    colIndex: number
  } // index of row where action taken 
  grid?: string[][];
  blankGrid?: string[][] // blank grid for player to prevent cheating
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
  grid?: string[][],
  cells?: Round4Cell[][];
  selectedDifficulties?: string[];
  starPositions?: { row: number; col: number }[];
}

export interface Score {
  playerName: string;
  avatar: string;
  score: number;
  isCorrect: boolean;
  isModified: boolean;
  stt: string;
}

export interface ScoreRule {
  round1: number[];
  round2: number[];
  round3: number;
  round4: number[];
}

export interface GameState {
  // Current game status
  currentRound: string;
  currentTestName: string,
  isActive: boolean;
  isHost: boolean;
  
  // Questions and answers
  currentQuestion: Question | null;
  questions: Question[];
  packetNames: string[];
  usedPacketNames: string[];
  selectedPacketName: string | null,
  shouldReturnToTopicSelection: boolean;
  currentCorrectAnswer: string;
  
  // Players and scoring
  players: PlayerData[];
  currentPlayer: RoomPlayer | null;
  scoresRanking: Score[];
  scoreRules: ScoreRule | null;
  
  // Round-specific data
  round2Grid: Round2Grid | null;
  numberOfSelectedRow: number
  
  round4Grid: Round4Grid | null;
  round4Level: { easy: boolean; medium: boolean; hard: boolean };
  difficultyRanges: { easy: number; medium: number; hard: number }
  round4LevelNumber: { easy: number; medium: number; hard: number }
  selectedDifficulty: string;
  buzzedPlayerName: string
  
  // Game settings
  mode: 'manual' | 'auto' | 'adaptive';
  timeLimit: number;
  
  // UI state
  showRules: boolean;
  currentTurn: number;
  currentQuestionNumber: number;
  isBuzzOpen: boolean;
  
  // Loading states
  loading: LoadingState;

  joining: LoadingState;

  //
  isInputDisabled: boolean;
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
