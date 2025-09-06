// Game Redux slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Question, Score, PlayerData, Round2Grid, Round4Grid, ScoreRule, RoomPlayer, JoinRoomRequest, Answer, GetQuestionsRequest, ScoringRequest } from '../../../shared/types';
import apiClient from '../../../shared/services/api/client';
import { set } from 'firebase/database';
import gameApi from '../../../shared/services/game/gameApi';

// Initial state
const initialState: GameState = {
  // Current game status
  currentRound: "1",
  currentTestName: "",
  isActive: false,
  isHost: false,

  // Questions and answers
  currentQuestion: null,
  selectedPacketName: null,
  packetNames: [],
  usedPacketNames: [],
  shouldReturnToTopicSelection: false,
  questions: [],
  currentCorrectAnswer: "",
  // Players and scoring
  players: [],
  currentPlayer: null,
  scoresRanking: [],

  // Round-specific data
  round2Grid: null,
  numberOfSelectedRow: 0,

  round4Grid: null,
  round4Level: { easy: true, medium: true, hard: true },
  difficultyRanges: { easy: 0, medium: 0, hard: 0 },
  round4LevelNumber: { easy: 0, medium: 0, hard: 0 },
  selectedDifficulty: "",
  buzzedPlayerName: "",

  // Game settings
  mode: 'manual',
  scoreRules: {
    round1: [15, 10, 10, 10],
    round2: [15, 10, 10, 10],
    round3: 10,
    round4: [10, 20, 30]
  },
  timeLimit: 30,

  // UI state
  isRound2GridConfirmed: false,
  isRound4GridConfirmed: false,
  showRules: false,
  currentTurn: 0,
  currentQuestionNumber: 0,
  isBuzzOpen: false,

  // Loading states
  loading: {
    isLoading: false,
    error: null,
  },

  // joing states
  joining: {
    isLoading: false,
    error: null,
  },

  //input disabled
  isInputDisabled: true,
};


export const joinRoom = createAsyncThunk(
  'room/joinRoom',
  async (joinData: JoinRoomRequest, { rejectWithValue }) => {
    try {
      const url = new URL('/api/room/join', process.env.REACT_APP_BASE_URL);
      url.searchParams.append('room_id', joinData.roomId);
      if (joinData.password) {
        url.searchParams.append('password', joinData.password);
      }
      const response = await apiClient.post(url.toString(), joinData, { _isAuthRequired: true } as any);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// Async thunks
export const getQuestions = createAsyncThunk(
  'game/fetchQuestions',
  async ({ questionNumber, isJump = false, round, roomId, testName }: { questionNumber?: number; isJump?: boolean; round?: string, roomId: string, testName: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { game: GameState };

      const { currentQuestionNumber, currentRound, selectedPacketName, selectedDifficulty, difficultyRanges, round4LevelNumber } = state.game;
      console.log("getQuestions", { currentQuestionNumber, isJump, round, roomId, testName });
      let targetQuestionNumber = 0

      if (currentRound == "4") {
        switch (selectedDifficulty) {
          case "Dễ":
            const currentLevelNumber = round4LevelNumber.easy
            const easyRange = difficultyRanges.easy
            targetQuestionNumber = easyRange + currentLevelNumber + 1
            break;
          case "Trung bình":
            const currentMediumNumber = round4LevelNumber.medium
            const mediumRange = difficultyRanges.medium
            targetQuestionNumber = mediumRange + currentMediumNumber + 1
            break;
          case "Khó":
            const currentHardNumber = round4LevelNumber.hard
            const hardRange = difficultyRanges.hard
            targetQuestionNumber = hardRange + currentHardNumber + 1
            break;
          default:
            break;
        }
        console.log("targetQuestionNumber", targetQuestionNumber);
      } else {
        targetQuestionNumber = isJump && questionNumber !== undefined
          ? questionNumber
          : currentQuestionNumber + 1;
        console.log("targetQuestionNumber", targetQuestionNumber);
      }


      console.log("getQuestions", { currentQuestionNumber, isJump, round, roomId, testName });
      console.log("currentRound", currentRound);
      console.log(round == "2" || round == "4")
      const nextQuestion = {
        roomId: roomId,
        testName: testName,
        questionNumber: currentRound == "2" ? currentQuestionNumber : targetQuestionNumber,
        round: currentRound,
        packetName: currentRound === "3" ? (selectedPacketName || undefined) : undefined
      }
      console.log("nextQuestion", nextQuestion);
      const question = await gameApi.getQuestions(nextQuestion);

      return { question, targetQuestionNumber };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const getPacketsName = createAsyncThunk(
  'game/getPacketsName',
  async ({ testName, roomId }: { testName: string; roomId: string }, { rejectWithValue, getState }) => {
    try {
      // const state = getState() as { game: GameState };

      // const { currentTestName } = state.game;

      const packets = await gameApi.getPacketNames(testName, roomId);

      return packets
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
  async (params: ScoringRequest, { rejectWithValue }) => {
    try {
      const scores = await gameApi.updateScoring(params);
      return scores;
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
    setCurrentRound: (state, action: PayloadAction<string>) => {
      state.currentRound = action.payload;
      state.currentQuestionNumber = 0; // Reset question number when round changes
    },

    setCurrentTestName: (state, action: PayloadAction<string>) => {
      state.currentTestName = action.payload;
    },

    setSelectedPacketName: (state, action: PayloadAction<string | null>) => {
      state.selectedPacketName = action.payload;
    },

    setUsedPackesName: (state, action: PayloadAction<string[]>) => {
      state.usedPacketNames = action.payload;
    },

    setPacketsName: (state, action: PayloadAction<string[]>) => {
      console.log("setPacketsName", action.payload);
      console.trace("stack trace setPacketsName")
      state.packetNames = action.payload;
    },

    setShouldReturnToTopicSelection: (state, action: PayloadAction<boolean>) => {
      state.shouldReturnToTopicSelection = action.payload;
    },

    setIsInputDisabled: (state, action: PayloadAction<boolean>) => {
      console.log("setIsInputDisabled", action.payload);
      state.isInputDisabled = action.payload;
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

    setCurrentCorrectAnswer: (state, action: PayloadAction<string>) => {
      console.log("answer action.payload", action.payload);
      state.currentCorrectAnswer = action.payload;
    },

    setPlayerAnswerList: (state, action: PayloadAction<Answer[]>) => {
      state.players = state.players.map(player => {
        const answerUpdate = action.payload.find(a => a.uid === player.uid);
        return answerUpdate ? { ...player, ...answerUpdate } : player;
      });
    },

    clearPlayerAnswerList: (state) => {
      state.players = state.players.map(player => ({
        ...player,
        answer: "",
        time: 0,
      }));
    },

    nextQuestion: (state) => {
      state.currentQuestionNumber += 1;
    },

    setCurrentQuestionNumber: (state, action: PayloadAction<number>) => {
      state.currentQuestionNumber = action.payload;
    },
    // Player management
    setPlayers: (state, action: PayloadAction<Partial<PlayerData[]>>) => {
      console.log("action.payload", action.payload, new Error().stack);
      if (!action.payload) return;
      state.players = state.players.map(player => {
        const update = action.payload.find(p => p && p.stt === player.stt);
        return update ? { ...player, ...update } : player;
      });
    },


    setCurrentPlayer: (state, action: PayloadAction<Partial<PlayerData>>) => {
      console.log("set current player action.payload", action.payload, new Error().stack);
      state.currentPlayer = {
        ...state.currentPlayer,
        ...action.payload
      };

      console.log("currentPlayer after setting", state.currentPlayer);
    },

    updatePlayer: (state, action: PayloadAction<{ uid: string; updates: Partial<PlayerData> }>) => {
      const playerIndex = state.players.findIndex(p => p.uid === action.payload.uid);
      if (playerIndex !== -1) {
        state.players[playerIndex] = { ...state.players[playerIndex], ...action.payload.updates };
      }
    },

    addPlayer: (state, action: PayloadAction<Partial<PlayerData[]>>) => {
      console.log("action.payload", action.payload);
      // if (!action.payload) return;
      const cleanPayload = Array.isArray(action.payload)? action.payload.filter(Boolean) as PlayerData[]: []
      console.log("clean payload", cleanPayload)
      //new player joins room
      if (cleanPayload.length > state.players.length) {
        console.log("new player join")
        cleanPayload.forEach(player => {
          const existingIndex = state.players.findIndex(p => player && p.uid === player.uid);
          if (existingIndex === -1 && player) {
            state.players.push(player);
          }
        });
      }


      //player leaves room
      if (cleanPayload.length < state.players.length || !action.payload) {
        const updatedPlayers = new Set(Array.isArray(cleanPayload)? cleanPayload.map(player => player?.uid): [])
        console.log("updated players", updatedPlayers)
        console.log("current players", [...state.players])
        console.log("filter", state.players.filter(
          player => updatedPlayers.has(player.uid)
        ))
        state.players = state.players.filter(
          player => updatedPlayers.has(player.uid)
        )
      }

      //localStorage.setItem("players", JSON.stringify(state.players));
    },

    setBuzzedPlayer: (state, action: PayloadAction<string>) => {
      state.buzzedPlayerName = action.payload;
    },

    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.uid !== action.payload);
    },

    setPlayerAnswer: (state, action: PayloadAction<{ answer: string; time: number }>) => {
      console.log("action.payload", action.payload);
      console.log("state.currentPlayer", state.currentPlayer);
      if (state.currentPlayer) {
        console.log("abc")
        state.currentPlayer.answer = action.payload.answer;
        state.currentPlayer.time = action.payload.time;
      }

      console.log("state.currentPlayer after setting answer", state.currentPlayer);
    },

    // Scoring
    setScoresRanking: (state, action: PayloadAction<Score[]>) => {
      console.log("setScoresRanking", action.payload);
      state.scoresRanking = action.payload
      console.log("state.scoresRanking after setting", state.scoresRanking);
    },

    setScoreRules: (state, action: PayloadAction<ScoreRule>) => {
      state.scoreRules = action.payload;
    },

    // Round-specific data
    setRound2Grid: (state, action: PayloadAction<Partial<Round2Grid | null>>) => {
      console.log("setRound2Grid", action.payload);
      console.trace("stack trace round 2 grid")
      if (action.payload === null) {
        state.round2Grid = null;
      } else {
        state.round2Grid = {
          ...(state.round2Grid || {}),
          ...action.payload,
        };
      }
    },

    increaseNumberOfSelectedRow: (state) => {
      state.numberOfSelectedRow = state.numberOfSelectedRow + 1;
    },

    setRound4Grid: (state, action: PayloadAction<Partial<Round4Grid | null>>) => {
      if (action.payload === null) {
        state.round4Grid = null;
      } else {
        state.round4Grid = {
          ...(state.round4Grid || {}),
          ...action.payload,
        };
      }
    },

    setRound4Level: (state, action: PayloadAction<{ easy: boolean; medium: boolean; hard: boolean }>) => {
      state.round4Level = action.payload;
    },

    setRound4LevelNumber: (state, action: PayloadAction<Partial<{ easy: number; medium: number; hard: number }>>) => {
      state.round4LevelNumber = {
        ...state.round4LevelNumber,
        ...action.payload,
      };
    },

    setDifficultyRanges: (state, action: PayloadAction<Partial<{ easy: number; medium: number; hard: number }>>) => {
      state.difficultyRanges = {
        ...state.difficultyRanges,
        ...action.payload,
      };
    },

    setSelectedDifficulty: (state, action: PayloadAction<string>) => {
      state.selectedDifficulty = action.payload;
    },

    // Game settings
    setMode: (state, action: PayloadAction<'manual' | 'auto' | 'adaptive'>) => {
      console.log("setMode", action.payload);
      state.mode = action.payload;
    },

    setTimeLimit: (state, action: PayloadAction<number>) => {
      state.timeLimit = action.payload;
    },

    // UI state
    setIsRound2GridConfirmed: (state, action: PayloadAction<boolean>) => {
      state.isRound2GridConfirmed = action.payload;
    },

    setIsRound4GridConfirmed: (state, action: PayloadAction<boolean>) => {
      state.isRound4GridConfirmed = action.payload;
    },

    setShowRules: (state, action: PayloadAction<boolean>) => {
      state.showRules = action.payload;
    },

    setCurrentTurn: (state, action: PayloadAction<number>) => {
      state.currentTurn = action.payload;
    },

    setIsBuzzOpen: (state, action: PayloadAction<boolean>) => {
      state.isBuzzOpen = action.payload;
    },

    // Reset game state
    resetGame: (state) => {
      console.log("reset game state")
      return { ...initialState, isHost: state.isHost };
    },

    // Error handling
    clearError: (state) => {
      state.loading.error = null;
    },
  },

  extraReducers: (builder) => {
    // Join room
    builder
      .addCase(joinRoom.pending, (state) => {
        state.joining.isLoading = true;
        state.joining.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.joining.isLoading = false;
        state.players = action.payload.players;
        state.currentPlayer = {
          ...state.currentPlayer,
          ...action.meta.arg,
          uid: action.payload.uid
        }
        state.isHost = false;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.joining.isLoading = false;
        state.joining.error = action.payload as string;
      });
    // Fetch questions
    builder
      .addCase(getQuestions.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = null;
      })
      .addCase(getQuestions.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.currentQuestion = action.payload.question;
        state.currentCorrectAnswer = action.payload.question.answer
        state.currentQuestionNumber = action.payload.targetQuestionNumber
        if (state.currentRound === "4") {
          switch (state.selectedDifficulty) {
            case "Dễ":
              state.round4LevelNumber.easy += 1;
              break;
            case "Trung bình":
              state.round4LevelNumber.medium += 1;
              break;
            case "Khó":
              state.round4LevelNumber.hard += 1;
              break;
          }
        }
      })
      .addCase(getQuestions.rejected, (state, action) => {
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

    // Get packets name for round 3
    builder
      .addCase(getPacketsName.pending, (state) => {
        state.loading.isLoading = true;
      })
      .addCase(getPacketsName.fulfilled, (state, action) => {
        console.log("getPacketsName.fulfilled", action.payload);
        state.packetNames = action.payload;
      })
      .addCase(getPacketsName.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });

    // // Update scores
    // builder
    //   .addCase(updateScores.fulfilled, (state, action) => {
    //     state.scores = action.payload;
    //   })
    //   .addCase(updateScores.rejected, (state, action) => {
    //     state.loading.error = action.payload as string;
    //   });
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
  setCurrentQuestionNumber,
  setPlayers,
  setCurrentPlayer,
  setPlayerAnswer,
  setSelectedPacketName,
  setUsedPackesName,
  setPacketsName,
  setShouldReturnToTopicSelection,
  setPlayerAnswerList,
  clearPlayerAnswerList,
  updatePlayer,
  addPlayer,
  removePlayer,
  setScoresRanking,
  setScoreRules,
  setRound2Grid,
  increaseNumberOfSelectedRow,
  setBuzzedPlayer,
  setRound4Grid,
  setRound4Level,
  setDifficultyRanges,
  setRound4LevelNumber,
  setSelectedDifficulty,
  setMode,
  setTimeLimit,
  setIsRound2GridConfirmed,
  setIsRound4GridConfirmed,
  setShowRules,
  setCurrentTurn,
  resetGame,
  clearError,
  setIsInputDisabled,
  setIsBuzzOpen
} = gameSlice.actions;

export default gameSlice.reducer;
