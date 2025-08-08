// Firebase real-time firebaseServices hook
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
  setPlayers,
  setCurrentQuestion,
  setScoresRanking,
  setRound2Grid,
  setRound4Grid,
  setIsInputDisabled,
  setCurrentCorrectAnswer,
  setCurrentTurn,
  setIsBuzzOpen,
  setBuzzedPlayer,
  setPacketsName,
  setSelectedPacketName,
  setUsedPackesName,
  setShouldReturnToTopicSelection,
  setCurrentRound,
  addPlayer
} from '../../../app/store/slices/gameSlice';
import {
  setCurrentRoom,
  setPlayers as setRoomPlayers,
  setSpectators
} from '../../../app/store/slices/roomSlice';
// import { firebaseRealtimeService } from '../../services/firebase/realtime';
import { PlayerData, Question, Score, Room } from '../../types';

import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import firebaseServices from '../../services/firebase/firebaseServices';
export const useFirebaseListener = () => {
  const dispatch = useAppDispatch();

  const { currentRound,players } = useAppSelector(state => state.game);
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "";
  const roomId = searchParams.get("roomId") || "";
  const navigate = useNavigate();
  /**
   * Listen to room data changes
   */
  // const listenToRoom = useCallback((callback?: (data: any) => void) => {
  //   if (!roomId) return () => { };

  //   return firebaseRealtimeService.listenToRoom(roomId, (data) => {
  //     if (data) {
  //       // Update room state
  //       dispatch(setCurrentRoom(data as Room));

  //       // Call optional callback
  //       callback?.(data);
  //     }
  //   });
  // }, [roomId, dispatch]);

  const listenToTimeStart = useCallback((callback?: () => void) => {
    if (!roomId) return () => { };


    return firebaseServices.listenToTimeStart(roomId, () => {
      console.log("listenToTimeStart");
      dispatch(setIsInputDisabled(false))
      callback?.()
    }
    );
  }, [roomId, dispatch]);

  const listenToSound = useCallback((callback: (type: string) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToSound(roomId, (type: string) => {
      callback?.(type)
    }

    );
  }, [roomId, dispatch]);

  /**
   * Listen to player answers
   */
  const listenToNewPlayer = (callback?: () => void) => {
    console.log("roomId", roomId);
    if (!roomId) return () => { };

    return firebaseServices.listenToPlayers(roomId, (players) => {
      console.log("players", players);
      dispatch(addPlayer(players))

      callback?.()
    });
  }

  /**
   * Listen to player answers
   */
  const listenToBroadcastedAnswer = useCallback((callback?: () => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToBroadcastedAnswer(roomId, (players) => {
      dispatch(setPlayers(players))

      callback?.()
    });
  }, [roomId, dispatch]);

  /**
   * Listen to player answers
   */
  // const listenToGameGrid = useCallback((callback?: (grid: string[][]) => void) => {
  //   if (!roomId) return () => { };

  //   return firebaseServices.listenToGrid(roomId,(grid) => {

  //     callback?.(grid)
  //   });
  // }, [roomId, dispatch]);

  /**
   * Listen to player answers
   */
  const listenToCellColor = useCallback((callback?: (color: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToCellColor(roomId, (color) => {

      callback?.(color)
    });
  }, [roomId, dispatch]);

  /**
   * Listen to player answers
   */
  const listenToCurrentTurn = useCallback((callback?: (turn: number) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToCurrentTurn(roomId, (turn) => {
      dispatch(setCurrentTurn(turn))

      callback?.(turn)
    });
  }, [roomId, dispatch]);

  /**
   * Listen to player answers
   */
  const listenToOpenBuzz = useCallback((callback?: (isBuzzOpened: string) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToOpenBuzz(roomId, (isBuzzOpened) => {
      if(!isBuzzOpened) return;

      callback?.(isBuzzOpened)
    });
  }, [roomId, dispatch]);

  /**
   * Listen to spectator join
   */
  const listenToSpectatorJoin = useCallback((callback?: () => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToSpectatorJoin(roomId, (count: number) => {
      dispatch(setSpectators(count))

      callback?.()
    });
  }, [roomId, dispatch]);

  /**
   * Listen to scores on host side
   */
  const listenToScores = useCallback((callback?: (scores: Partial<PlayerData[]> | Score[]) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToScores(roomId, (scores) => {
      console.log("scores", scores);

      dispatch(setPlayers(scores))

      callback?.(scores)
    });
  }, [roomId]);

  /**
   * Listen to scores ranking on player side
   */
  const listenToScoresRanking = useCallback((callback?: (scores: Score[]) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToScoresRanking(roomId, (scores) => {
      console.log("scores", scores);

      dispatch(setScoresRanking(scores))

      callback?.(scores)
    });
  }, [roomId]);

  /**
   * Listen to player answers
   */
  // const listenToPlayerAnswers = useCallback((callback?: (answers: Record<string, PlayerData>) => void) => {
  //   if (!roomId) return () => { };

  //   return firebaseRealtimeService.listenToPlayerAnswers(roomId, (answers) => {
  //     // Convert to array and update Redux state
  //     const playersArray = Object.values(answers);
  //     dispatch(setPlayers(playersArray));
  //     dispatch(setRoomPlayers(playersArray.map(p => ({ ...p, joinedAt: '', isReady: true, isConnected: true, role: 'player' as const }))));

  //     // Call optional callback
  //     callback?.(answers);
  //   });
  // }, [roomId, dispatch]);

  /**
   * Listen to current question
   */
  const listenToCurrentQuestion = useCallback((callback?: () => void) => {
    if (!roomId) return () => { };

    const unsubscribe = firebaseServices.listenToQuestion(roomId, (question) => {
      let timeout: NodeJS.Timeout | undefined;

      console.log("question", question);

      if (currentRound === '3') {
        timeout = setTimeout(() => {
          dispatch(setCurrentQuestion(question));
        }, 1000);
      } else {
        dispatch(setCurrentQuestion(question));
      }

      callback?.();


      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    });

    return unsubscribe;
  }, [roomId, dispatch]);

  /**
   * Listen to correct answer
   */
  const listenToCorrectAnswer = useCallback((callback?: () => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToCorrectAnswer(roomId, (answer) => {
      if(!answer) return;
      console.log("answer", answer);
      dispatch(setCurrentCorrectAnswer(answer.join("/ ")));

      // Call optional callback
      callback?.();
    });
  }, [roomId, dispatch]);

  /**
   * Listen to selected row
   */
  const listenToSelectRow = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToSelectRow(roomId, (data) => {
      console.log("selectedRow", data);
      // Call optional callback
      callback?.(data);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to correct row
   */
  const listenToCorrectRow = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToCorrectRow(roomId, (data) => {

      // Call optional callback
      callback?.(data);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to incorrect row
   */
  const listenToIncorectRow = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToIncorrectRow(roomId, (data) => {

      // Call optional callback
      callback?.(data);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to incorrect row
   */
  const listenToObstacle = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToObstacle(roomId, (data) => {

      // Call optional callback
      callback?.(data);
    });
  }, [roomId, dispatch]);

  

  /**
   * Listen to packets nam
   */
  const listenToPacketsName = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToPackets(roomId, (packetsName) => {
      dispatch(setPacketsName(packetsName))
      // Call optional callback
      callback?.(packetsName);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to selected packets name
   */
  const listenToSelectedPacketName = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToSelectedPacket(roomId, (selectedPacketName) => {
      dispatch(setSelectedPacketName(selectedPacketName))
      // Call optional callback
      callback?.(selectedPacketName);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to packets nam
   */
  const listenToUsedPackets = useCallback((callback?: (usedPacketsName: string[]) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToUsedPackets(roomId, (usedPacketsName) => {
      // dispatch(setUsedPackesName(usedPacketsName))
      // Call optional callback
      callback?.(usedPacketsName);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to return to packets selection
   */
  const listenToReturnToPacketsSelection = useCallback((callback?: (shouldReturn: boolean) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToReturnToTopicSelection(roomId, (shouldReturn) => {
      // dispatch(setShouldReturnToTopicSelection(shouldReturn))
      // Call optional callback
      callback?.(shouldReturn);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to return to packets selection
   */
  const listenToRoundStart = useCallback((callback?: (round: string) => void) => {
    if (!roomId) return () => { };



    return firebaseServices.listenToRoundStart(roomId, (data) => {
      if (!data) return;

      dispatch(setCurrentRound(data.round))
      // Call optional callback
      callback?.(data.round);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to return to packets selection
   */
  const listenToReturnToCurrentTurn = useCallback((callback?: (data: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToCurrentTurn(roomId, (data) => {

      // Call optional callback
      callback?.(data);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to buzzed player
   */
  const listenToBuzzedPlayer = useCallback((callback?: (playerName:string) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToBuzzing(roomId, (playerName) => {
      console.log("buzz playerName ", playerName);
      dispatch(setBuzzedPlayer(playerName));
      // Call optional callback
      callback?.(playerName);
    });
  }, [roomId, dispatch]);

  const listenToStar = useCallback((callback?: (playerName: string) => void) => {
    if (!roomId) return () => { };
    return firebaseServices.listenToStar(roomId, (playerName) => {
      // Call optional callback
      callback?.(playerName);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to player colors
   */
  const listenToPlayerColors = useCallback((callback?: (colors: Record<string, string>) => void) => {
    if (!roomId) return () => { };
    return firebaseServices.listenToPlayerColors(roomId, (colors) => {
      // Call optional callback
      callback?.(colors);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to game state
   */
  // const listenToGameState = useCallback((callback?: (state: any) => void) => {
  //   if (!roomId) return () => { };

  //   return firebaseRealtimeService.listenToGameState(roomId, (state) => {
  //     if (state) {
  //       // Update relevant Redux state based on game state
  //       if (state.currentRound) {
  //         // dispatch(setCurrentRound(state.currentRound));
  //       }
  //       if (state.isActive !== undefined) {
  //         // dispatch(setIsActive(state.isActive));
  //       }
  //     }

  //     // Call optional callback
  //     callback?.(state);
  //   });
  // }, [roomId, dispatch]);

  /**
   * Listen to Round 2 grid
   */
  const listenToRound2Grid = useCallback((callback?: (grid: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToRound2Grid(roomId, (grid) => {
      console.log("grid", grid);

      // Call optional callback
      callback?.(grid);
    });
  }, [roomId, dispatch]);

  /**
   * Listen to Round 4 grid
   */
  const listenToRound4Grid = useCallback((callback?: (grid: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToGrid(roomId, (grid) => {
      console.log("grid round 4", grid);

      // Call optional callback
      callback?.(grid);
    });
  }, [roomId, dispatch]);

  /**
  * Listen to Selected cell
  */
  const listenToSelectedCell = useCallback((callback?: (selectedCell: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToSelectedCell(roomId, (selectedCell) => {

      callback?.(selectedCell)
    }

    );
  }, [roomId, dispatch]);

  /**
   * Listen to rules display
   */
  const listenToRules = useCallback((callback?: (rulesData: any) => void) => {
    if (!roomId) return () => { };

    return firebaseServices.listenToRoundRules(roomId, (rulesData) => {
      callback?.(rulesData);
    });
  }, [roomId]);

  /**
   * Setup all firebaseServicess at once
   */
  // const setupAllfirebaseServicess = useCallback((callbacks?: {
  //   onRoomChange?: (data: any) => void;
  //   onPlayerAnswersChange?: (answers: Record<string, PlayerData>) => void;
  //   onQuestionChange?: () => void;
  //   onScoresChange?: () => void;
  //   onGameStateChange?: (state: any) => void;
  //   onRound2GridChange?: (grid: any) => void;
  //   onRound4GridChange?: (grid: any) => void;
  // }) => {
  //   if (!roomId) return () => { };

  //   const unsubscribers = [
  //     // listenToRoom(callbacks?.onRoomChange),
  //     // listenToPlayerAnswers(callbacks?.onPlayerAnswersChange),
  //     listenToCurrentQuestion(callbacks?.onQuestionChange),
  //     listenToScores(callbacks?.onScoresChange),
  //     // listenToGameState(callbacks?.onGameStateChange),
  //     listenToRound2Grid(callbacks?.onRound2GridChange),
  //     listenToRound4Grid(callbacks?.onRound4GridChange),
  //   ];

  //   return () => {
  //     unsubscribers.forEach(unsubscribe => unsubscribe());
  //   };
  // }, [
  //   roomId,
  //   // listenToRoom,
  //   // listenToPlayerAnswers,

  // ]);

  /**
   * Update player data
   */
  // const updatePlayer = useCallback(async (playerId: string, playerData: Partial<PlayerData>) => {
  //   if (!roomId) return;

  //   await firebaseRealtimeService.updatePlayer(roomId, playerId, playerData);
  // }, [roomId]);

  // /**
  //  * Set current question
  //  */
  // const setCurrentQuestionFirebase = useCallback(async (question: Question) => {
  //   if (!roomId) return;

  //   await firebaseRealtimeService.setCurrentQuestion(roomId, question);
  // }, [roomId]);

  // /**
  //  * Update scores
  //  */
  // const updateScoresFirebase = useCallback(async (scores: Score[]) => {
  //   if (!roomId) return;

  //   await firebaseRealtimeService.updateScores(roomId, scores);
  // }, [roomId]);

  // /**
  //  * Update game state
  //  */
  // const updateGameStateFirebase = useCallback(async (gameState: any) => {
  //   if (!roomId) return;

  //   await firebaseRealtimeService.updateGameState(roomId, gameState);
  // }, [roomId]);

  /**
   * Setup on disconnect
   */
  const setupDisconnect = useCallback(async (roomId: string, uid: string, callback?: () => void) => {
    if (!roomId) return;

    return firebaseServices.setupOnDisconnect(roomId, uid, callback);
  }, [roomId]);

  const deletePath = async (path: string): Promise<void> => {
    if (!roomId) return;
    await firebaseServices.deletePath(roomId, path);
  }

  const removeSpectator = useCallback((spectatorPath: string) => {
    console.log("Removing spectator from path:", spectatorPath);
    
    if (!spectatorPath) {
      console.warn("No spectator path provided");
      return;
    }

    // Only remove spectator when they actually leave, not when they join
    // This should be called on component unmount or navigation away
    try {
      firebaseServices.removeSpectator(spectatorPath);
      console.log("Spectator removed successfully");
    } catch (error) {
      console.error("Error removing spectator:", error);
    }
  }, []);

        
  const startWatchingPendingRemovals  = async (roomId: string) => {
    if (!roomId) return;

    await firebaseServices.startWatchingPendingRemovals(roomId)
  }

  const connectOnRejoin = async (roomId: string, uid: string) => {
    if (!roomId) return;

    await firebaseServices.connectOnRejoin(roomId, uid)
  }
  // /**
  //  * Cleanup all firebaseServicess on unmount
  //  */
  // useEffect(() => {
  //   return () => {
  //     firebaseServices.removeAllfirebaseServicess();
  //   };
  // }, []);

  return {
    // firebaseServicess
    // listenToRoom,
    listenToRoundStart,
    listenToNewPlayer,
    listenToSpectatorJoin,
    // listenToPlayerAnswers,
    listenToCorrectAnswer,
    listenToBroadcastedAnswer,
    listenToCurrentQuestion,
    listenToScores,
    listenToScoresRanking,
    // listenToGameState,

    listenToRound2Grid,
    listenToSelectRow,
    listenToCorrectRow,
    listenToIncorectRow,
    listenToObstacle,
    listenToBuzzedPlayer,

    listenToPacketsName,
    listenToSelectedPacketName,
    listenToUsedPackets,
    listenToReturnToPacketsSelection,

    listenToRound4Grid,
    listenToCellColor,
    listenToSelectedCell,
    listenToTimeStart,
    listenToSound,
    listenToOpenBuzz,
    listenToStar,
    listenToPlayerColors,
    listenToCurrentTurn,
    listenToRules,

    setupDisconnect,
    startWatchingPendingRemovals,
    connectOnRejoin,
    // setupAllfirebaseServicess,

    // Writers
    // updatePlayer,
    // setCurrentQuestionFirebase,
    // updateScoresFirebase,
    // updateGameStateFirebase,

    //Delete
    deletePath,
    removeSpectator
  };
};

export default useFirebaseListener;
