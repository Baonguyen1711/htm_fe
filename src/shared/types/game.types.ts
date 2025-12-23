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
  uid?: string;
  groupId?: string;
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
  allRound?: number
}

export interface MultipleChoiceProps {

  choices: {
    position: string,
    content: string
  }[]
}

export interface Schedule {
  questionNumber: number,
  countDownTime: number,
  revealTime: number,
  startTime: number,
  endTime: number
}

export interface Statistic {
  question: string,
  answer: string,
  correct_answer: string,
  isCorrect: boolean
}

export type Phase = "idle" | "countdown" | "reveal" | "active" | "ended";


export interface GameState {
  // Current game status
  currentRound: string;

  currentTestName: string,
  isActive: boolean;
  isHost: boolean;
  numberOfPlayer: number;

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
  scoresRanking: PlayerData[] 
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
  phase: Phase;
  isPausedButtonDisabled: boolean;
  mode: 'manual' | 'auto' | 'adaptive';
  timeLimit: number;
  showCountdown: boolean;
  showGameStartCountdown: boolean;

  // UI state
  answersCount: string[];
  isRound2GridConfirmed: boolean;
  isRound4GridConfirmed: boolean;
  showRules: boolean;
  currentTurn: number;
  currentQuestionNumber: number;
  isBuzzOpen: boolean;

  // Loading states
  loading: LoadingState;

  joining: LoadingState;

  //
  isInputDisabled: boolean;
  selectedChoice: string | null
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

export type Catergory = "Ngẫu nhiên" | "Câu hỏi về Toán học" | "Câu hỏi về Vật lý" | "Câu hỏi về Hóa học" | "Câu hỏi về Sinh học, động vật và thực vật" | "Câu hỏi về Lịch sử" | "Câu hỏi về Nghệ thuật| văn hóa" | "Câu hỏi về Địa lý" | "Câu hỏi về Văn học" | "Câu hỏi về Tiếng Anh"


export type GamePhase =
  | "COUNTDOWN"
  | "QUESTION"
  | "SHOW_ANSWER"
  | "LEADERBOARD"
  | "ENDED";

export interface MultiplayerGameState {
  /** Phase hiện tại của game */
  phase: GamePhase;

  /** Mỗi lần phase (hoặc resume) sẽ có id mới */
  phaseId: string;

  /** Số thứ tự câu hỏi hiện tại (1-based) */
  currentQuestion: number;

  /** Thời điểm phase bắt đầu (server timestamp, ms) */
  phaseStartTime: number;

  /** Tổng thời gian phase (ms) */
  phaseDuration: number;

  /** Game đang bị pause hay không */
  paused: boolean;

  /** Thời điểm pause (ms) – chỉ có khi paused = true */
  pausedAt?: number | null;

  /** Thời gian còn lại tại lúc pause (ms) */
  remainingMs?: number | null;

  /** Thời điểm kết thúc game */
  endedAt?: number;
  /** Game đã kết thúc chưa*/
  ended?: boolean
}

