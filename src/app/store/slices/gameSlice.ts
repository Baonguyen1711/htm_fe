// Game Redux slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Question, Score, PlayerData, Round2Grid, Round4Grid, ScoreRule } from '../../../shared/types';

// Initial state
const initialState: GameState = {
  // Current game status
  currentRound: 1,
  isActive: false,
  isHost: false,
  
  // Questions and answers
  currentQuestion: null,
  questions: [],
  currentCorrectAnswer: null,
  
  // Players and scoring
  players: [],
  scores: [],
  scoreRules: null,
  
  // Round-specific data
  round2Grid: null,
  round4Grid: null,
  
  // Game settings
  mode: 'manual',
  timeLimit: 30,
  
  // UI state
  showRules: false,
  currentTurn: 1,
  questionNumber: 1,
  
  // Loading states
  loading: {
    isLoading: false,
    error: null,
  },
};

// Async thunks
export const fetchQuestions = createAsyncThunk(
  'game/fetchQuestions',
  async (params: { testName: string; round: number; difficulty?: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/game/questions?testName=${params.testName}&round=${params.round}&difficulty=${params.difficulty || ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      return data.questions;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'game/submitAnswer',
  async (params: { roomId: string; uid: string; answer: string; time: number }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateScores = createAsyncThunk(
  'game/updateScores',
  async (params: { roomId: string; mode: string; scores?: Score[]; round: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/game/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update scores');
      }
      
      const data = await response.json();
      return data.scores;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Game state management
    setCurrentRound: (state, action: PayloadAction<number>) => {
      state.currentRound = action.payload;
      state.questionNumber = 1; // Reset question number when round changes
    },
    
    setIsActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    
    setIsHost: (state, action: PayloadAction<boolean>) => {
      state.isHost = action.payload;
    },
    
    // Question management
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
    },
    
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    
    setCurrentCorrectAnswer: (state, action: PayloadAction<string[] | null>) => {
      state.currentCorrectAnswer = action.payload;
    },
    
    nextQuestion: (state) => {
      state.questionNumber += 1;
    },
    
    setQuestionNumber: (state, action: PayloadAction<number>) => {
      state.questionNumber = action.payload;
    },
    
    // Player management
    setPlayers: (state, action: PayloadAction<PlayerData[]>) => {
      state.players = action.payload;
    },
    
    updatePlayer: (state, action: PayloadAction<{ uid: string; updates: Partial<PlayerData> }>) => {
      const playerIndex = state.players.findIndex(p => p.uid === action.payload.uid);
      if (playerIndex !== -1) {
        state.players[playerIndex] = { ...state.players[playerIndex], ...action.payload.updates };
      }
    },
    
    addPlayer: (state, action: PayloadAction<PlayerData>) => {
      const existingIndex = state.players.findIndex(p => p.uid === action.payload.uid);
      if (existingIndex === -1) {
        state.players.push(action.payload);
      }
    },
    
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.uid !== action.payload);
    },
    
    // Scoring
    setScores: (state, action: PayloadAction<Score[]>) => {
      state.scores = action.payload;
    },
    
    setScoreRules: (state, action: PayloadAction<ScoreRule>) => {
      state.scoreRules = action.payload;
    },
    
    // Round-specific data
    setRound2Grid: (state, action: PayloadAction<Round2Grid | null>) => {
      state.round2Grid = action.payload;
    },
    
    setRound4Grid: (state, action: PayloadAction<Round4Grid | null>) => {
      state.round4Grid = action.payload;
    },
    
    // Game settings
    setMode: (state, action: PayloadAction<'manual' | 'auto' | 'adaptive'>) => {
      state.mode = action.payload;
    },
    
    setTimeLimit: (state, action: PayloadAction<number>) => {
      state.timeLimit = action.payload;
    },
    
    // UI state
    setShowRules: (state, action: PayloadAction<boolean>) => {
      state.showRules = action.payload;
    },
    
    setCurrentTurn: (state, action: PayloadAction<number>) => {
      state.currentTurn = action.payload;
    },
    
    // Reset game state
    resetGame: (state) => {
      return { ...initialState, isHost: state.isHost };
    },
    
    // Error handling
    clearError: (state) => {
      state.loading.error = null;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch questions
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });
    
    // Submit answer
    builder
      .addCase(submitAnswer.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        // Handle answer submission result
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });
    
    // Update scores
    builder
      .addCase(updateScores.fulfilled, (state, action) => {
        state.scores = action.payload;
      })
      .addCase(updateScores.rejected, (state, action) => {
        state.loading.error = action.payload as string;
      });
  },
});

export const {
  setCurrentRound,
  setIsActive,
  setIsHost,
  setCurrentQuestion,
  setQuestions,
  setCurrentCorrectAnswer,
  nextQuestion,
  setQuestionNumber,
  setPlayers,
  updatePlayer,
  addPlayer,
  removePlayer,
  setScores,
  setScoreRules,
  setRound2Grid,
  setRound4Grid,
  setMode,
  setTimeLimit,
  setShowRules,
  setCurrentTurn,
  resetGame,
  clearError,
} = gameSlice.actions;

export default gameSlice.reducer;
