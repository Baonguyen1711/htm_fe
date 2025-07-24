// Game API hook
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { 
  fetchQuestions,
  submitAnswer,
  updateScores,
  setCurrentQuestion,
  setQuestions,
  setScores,
  setRound2Grid,
  setRound4Grid,
  clearError
} from '../../../app/store/slices/gameSlice';
import { gameApi } from '../../services/game/gameApi';
import { 
  GetQuestionsRequest,
  SubmitAnswerRequest,
  ScoringRequest,
  SendGridRequest,
  Question,
  Score
} from '../../types';

export const useGameApi = () => {
  const dispatch = useAppDispatch();
  const { 
    loading, 
    currentQuestion, 
    questions, 
    scores, 
    currentRound,
    round2Grid,
    round4Grid 
  } = useAppSelector(state => state.game);

  /**
   * Get questions for a round
   */
  const getQuestions = useCallback(async (params: GetQuestionsRequest) => {
    try {
      const result = await dispatch(fetchQuestions(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Get prefetch question
   */
  const getPrefetchQuestion = useCallback(async (params: { 
    testName: string; 
    round: number; 
    questionNumber: number 
  }) => {
    try {
      const question = await gameApi.getPrefetchQuestion(params);
      return question;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Get packet names
   */
  const getPacketNames = useCallback(async (testName: string) => {
    try {
      const packets = await gameApi.getPacketNames(testName);
      return packets;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Send grid to players
   */
  const sendGrid = useCallback(async (params: SendGridRequest) => {
    try {
      const success = await gameApi.sendGrid(params);
      
      // Update local state based on current round
      if (currentRound === 2) {
        dispatch(setRound2Grid({
          cells: params.grid,
          rows: params.grid.length,
          cols: params.grid[0]?.length || 0,
          horizontalRows: [],
          cnv: '',
          selectedRows: [],
          correctRows: [],
          incorrectRows: [],
        }));
      } else if (currentRound === 4) {
        // Convert grid to Round 4 format
        const round4Cells = params.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => ({
            id: `${rowIndex}-${colIndex}`,
            question: {} as Question, // Will be populated later
            isSelected: false,
            isAnswered: false,
            difficulty: 'easy' as const,
            points: 20,
          }))
        );
        
        dispatch(setRound4Grid({
          cells: round4Cells,
          selectedDifficulties: [],
          starPositions: [],
        }));
      }
      
      return success;
    } catch (error) {
      throw error;
    }
  }, [dispatch, currentRound]);

  /**
   * Start a new round
   */
  const startRound = useCallback(async (params: { 
    roomId: string; 
    round: string; 
    grid?: string[][] 
  }) => {
    try {
      await gameApi.startRound(params);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Submit player answer
   */
  const submitPlayerAnswer = useCallback(async (params: SubmitAnswerRequest) => {
    try {
      const result = await dispatch(submitAnswer(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Broadcast player answers
   */
  const broadcastAnswers = useCallback(async (roomId: string) => {
    try {
      const answers = await gameApi.broadcastAnswers(roomId);
      return answers;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Update game scoring
   */
  const updateGameScoring = useCallback(async (params: ScoringRequest) => {
    try {
      const result = await dispatch(updateScores(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Update current turn
   */
  const updateTurn = useCallback(async (roomId: string, turn: number) => {
    try {
      await gameApi.updateTurn(roomId, turn);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Show game rules
   */
  const showRules = useCallback(async (roomId: string, roundNumber: string) => {
    try {
      await gameApi.showRules(roomId, roundNumber);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Hide game rules
   */
  const hideRules = useCallback(async (roomId: string) => {
    try {
      await gameApi.hideRules(roomId);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Set selected packet name
   */
  const setSelectedPacketName = useCallback(async (roomId: string, packetName: string) => {
    try {
      await gameApi.setSelectedPacketName(roomId, packetName);
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Set current question (local state)
   */
  const setCurrentQuestionLocal = useCallback((question: Question | null) => {
    dispatch(setCurrentQuestion(question));
  }, [dispatch]);

  /**
   * Set questions (local state)
   */
  const setQuestionsLocal = useCallback((questions: Question[]) => {
    dispatch(setQuestions(questions));
  }, [dispatch]);

  /**
   * Set scores (local state)
   */
  const setScoresLocal = useCallback((scores: Score[]) => {
    dispatch(setScores(scores));
  }, [dispatch]);

  /**
   * Clear game errors
   */
  const clearGameError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    loading,
    currentQuestion,
    questions,
    scores,
    currentRound,
    round2Grid,
    round4Grid,
    
    // API Actions
    getQuestions,
    getPrefetchQuestion,
    getPacketNames,
    sendGrid,
    startRound,
    submitPlayerAnswer,
    broadcastAnswers,
    updateGameScoring,
    updateTurn,
    showRules,
    hideRules,
    setSelectedPacketName,
    
    // Local State Actions
    setCurrentQuestionLocal,
    setQuestionsLocal,
    setScoresLocal,
    clearGameError,
  };
};

export default useGameApi;
