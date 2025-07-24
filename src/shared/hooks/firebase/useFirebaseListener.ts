// Firebase real-time listener hook
import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../../app/store';
import { 
  setPlayers, 
  setCurrentQuestion, 
  setScores, 
  setRound2Grid, 
  setRound4Grid 
} from '../../../app/store/slices/gameSlice';
import { 
  setCurrentRoom, 
  setPlayers as setRoomPlayers 
} from '../../../app/store/slices/roomSlice';
import { firebaseRealtimeService } from '../../services/firebase/realtime';
import { PlayerData, Question, Score, Room } from '../../types';

export const useFirebaseListener = (roomId: string | null) => {
  const dispatch = useAppDispatch();

  /**
   * Listen to room data changes
   */
  const listenToRoom = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToRoom(roomId, (data) => {
      if (data) {
        // Update room state
        dispatch(setCurrentRoom(data as Room));
        
        // Call optional callback
        callback?.(data);
      }
    });
  }, [roomId, dispatch]);

  /**
   * Listen to player answers
   */
  const listenToPlayerAnswers = useCallback((callback?: (answers: Record<string, PlayerData>) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToPlayerAnswers(roomId, (answers) => {
      // Convert to array and update Redux state
      const playersArray = Object.values(answers);
      dispatch(setPlayers(playersArray));
      dispatch(setRoomPlayers(playersArray.map(p => ({ ...p, joinedAt: '', isReady: true, isConnected: true, role: 'player' as const }))));
      
      // Call optional callback
      callback?.(answers);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to current question
   */
  const listenToCurrentQuestion = useCallback((callback?: (question: Question | null) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToCurrentQuestion(roomId, (question) => {
      dispatch(setCurrentQuestion(question));
      
      // Call optional callback
      callback?.(question);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to scores
   */
  const listenToScores = useCallback((callback?: (scores: Score[]) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToScores(roomId, (scores) => {
      dispatch(setScores(scores));
      
      // Call optional callback
      callback?.(scores);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to game state
   */
  const listenToGameState = useCallback((callback?: (state: any) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToGameState(roomId, (state) => {
      if (state) {
        // Update relevant Redux state based on game state
        if (state.currentRound) {
          // dispatch(setCurrentRound(state.currentRound));
        }
        if (state.isActive !== undefined) {
          // dispatch(setIsActive(state.isActive));
        }
      }
      
      // Call optional callback
      callback?.(state);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to Round 2 grid
   */
  const listenToRound2Grid = useCallback((callback?: (grid: any) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToRound2Grid(roomId, (grid) => {
      if (grid) {
        dispatch(setRound2Grid(grid));
      }
      
      // Call optional callback
      callback?.(grid);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to Round 4 grid
   */
  const listenToRound4Grid = useCallback((callback?: (grid: any) => void) => {
    if (!roomId) return () => {};

    return firebaseRealtimeService.listenToRound4Grid(roomId, (grid) => {
      if (grid) {
        dispatch(setRound4Grid(grid));
      }
      
      // Call optional callback
      callback?.(grid);
    });
  }, [roomId, dispatch]);

  /**
   * Setup all listeners at once
   */
  const setupAllListeners = useCallback((callbacks?: {
    onRoomChange?: (data: any) => void;
    onPlayerAnswersChange?: (answers: Record<string, PlayerData>) => void;
    onQuestionChange?: (question: Question | null) => void;
    onScoresChange?: (scores: Score[]) => void;
    onGameStateChange?: (state: any) => void;
    onRound2GridChange?: (grid: any) => void;
    onRound4GridChange?: (grid: any) => void;
  }) => {
    if (!roomId) return () => {};

    const unsubscribers = [
      listenToRoom(callbacks?.onRoomChange),
      listenToPlayerAnswers(callbacks?.onPlayerAnswersChange),
      listenToCurrentQuestion(callbacks?.onQuestionChange),
      listenToScores(callbacks?.onScoresChange),
      listenToGameState(callbacks?.onGameStateChange),
      listenToRound2Grid(callbacks?.onRound2GridChange),
      listenToRound4Grid(callbacks?.onRound4GridChange),
    ];

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [
    roomId,
    listenToRoom,
    listenToPlayerAnswers,
    listenToCurrentQuestion,
    listenToScores,
    listenToGameState,
    listenToRound2Grid,
    listenToRound4Grid,
  ]);

  /**
   * Update player data
   */
  const updatePlayer = useCallback(async (playerId: string, playerData: Partial<PlayerData>) => {
    if (!roomId) return;
    
    await firebaseRealtimeService.updatePlayer(roomId, playerId, playerData);
  }, [roomId]);

  /**
   * Set current question
   */
  const setCurrentQuestionFirebase = useCallback(async (question: Question) => {
    if (!roomId) return;
    
    await firebaseRealtimeService.setCurrentQuestion(roomId, question);
  }, [roomId]);

  /**
   * Update scores
   */
  const updateScoresFirebase = useCallback(async (scores: Score[]) => {
    if (!roomId) return;
    
    await firebaseRealtimeService.updateScores(roomId, scores);
  }, [roomId]);

  /**
   * Update game state
   */
  const updateGameStateFirebase = useCallback(async (gameState: any) => {
    if (!roomId) return;
    
    await firebaseRealtimeService.updateGameState(roomId, gameState);
  }, [roomId]);

  /**
   * Cleanup all listeners on unmount
   */
  useEffect(() => {
    return () => {
      firebaseRealtimeService.removeAllListeners();
    };
  }, []);

  return {
    // Listeners
    listenToRoom,
    listenToPlayerAnswers,
    listenToCurrentQuestion,
    listenToScores,
    listenToGameState,
    listenToRound2Grid,
    listenToRound4Grid,
    setupAllListeners,
    
    // Writers
    updatePlayer,
    setCurrentQuestionFirebase,
    updateScoresFirebase,
    updateGameStateFirebase,
  };
};

export default useFirebaseListener;
