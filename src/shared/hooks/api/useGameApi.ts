// // Game API hook
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    submitAnswer,
    updateScores,
    setCurrentQuestion,
    setQuestions,
    setRound2Grid,
    setRound4Grid,
    clearError,
    setScoreRules
} from '../../../app/store/slices/gameSlice';
import { gameApi } from '../../services/game/gameApi';
import {
    GetQuestionsRequest,
    SubmitAnswerRequest,
    ScoringRequest,
    SendGridRequest,
    Question,
    Score,
    ScoreRule,
    MultiplayerGameState
} from '../../types';

import {useSearchParams} from 'react-router-dom';
export const useGameApi = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";
    const currentRound = searchParams.get("round") || "";

    const {
        currentCorrectAnswer,
        round2Grid,
        round4Grid,
        // loading, 
        // currentQuestion, 
        // questions, 
        // scores, 
        // currentRound,
        // round2Grid,
        // round4Grid 
    } = useAppSelector(state => state.game);

    /**
     * Get questions for a round
     */
    //   const getQuestions = useCallback(async (params: GetQuestionsRequest) => {
    //     try {
    //       const result = await dispatch(fetchQuestions(params)).unwrap();
    //       return result;
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, [dispatch]);

    //   /**
    //    * Get prefetch question
    //    */
    //   const getPrefetchQuestion = useCallback(async (params: { 
    //     testName: string; 
    //     round: number; 
    //     questionNumber: number 
    //   }) => {
    //     try {
    //       const question = await gameApi.getPrefetchQuestion(params);
    //       return question;
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, []);

    //   /**
    //    * Get packet names
    //    */
    //   const getPacketNames = useCallback(async (testName: string) => {
    //     try {
    //       const packets = await gameApi.getPacketNames(testName);
    //       return packets;
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, []);

    //   /**
    //    * Send grid to players
    //    */
    //   const sendGrid = useCallback(async (params: SendGridRequest) => {
    //     try {
    //       const success = await gameApi.sendGrid(params);

    //       // Update local state based on current round
    //       if (currentRound === 2) {
    //         dispatch(setRound2Grid({
    //           cells: params.grid,
    //           rows: params.grid.length,
    //           cols: params.grid[0]?.length || 0,
    //           horizontalRows: [],
    //           cnv: '',
    //           selectedRows: [],
    //           correctRows: [],
    //           incorrectRows: [],
    //         }));
    //       } else if (currentRound === 4) {
    //         // Convert grid to Round 4 format
    //         const round4Cells = params.grid.map((row, rowIndex) =>
    //           row.map((cell, colIndex) => ({
    //             id: `${rowIndex}-${colIndex}`,
    //             question: {} as Question, // Will be populated later
    //             isSelected: false,
    //             isAnswered: false,
    //             difficulty: 'easy' as const,
    //             points: 20,
    //           }))
    //         );

    //         dispatch(setRound4Grid({
    //           cells: round4Cells,
    //           selectedDifficulties: [],
    //           starPositions: [],
    //         }));
    //       }

    //       return success;
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, [dispatch, currentRound]);

    const getSpecificQuestion = async (params: GetQuestionsRequest) => {
        try {
            const questions = await gameApi.getQuestions(params);
            return questions;
        } catch (error) {
            throw error;
        }
    }

    const getNextQuestion = async (params: GetQuestionsRequest) => {
        try {
            const questions = await gameApi.getNextQuestions(params);
            return questions;
        } catch (error) {
            throw error;
        }
    }

    const updateGameState = async (roomId: string, state: Partial<MultiplayerGameState>) => {
        try {
            const questions = await gameApi.updateGameState(roomId, state);
            return questions;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get questions by round
     */

    const getQuestionByRound = useCallback(async (testName: string, round: string) => {
        try {
            const questions = await gameApi.getQuestionsByRound({ testName: testName, round: round });
            return questions;
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Start a new round
     */
    const startRound = useCallback(async (roomId: string) => {
        try {
            const startRoundParams = {
                roomId: roomId,
                round: currentRound,
                grid: currentRound === "2" || currentRound === "4" ?
                    currentRound == "2" ? round2Grid?.grid : round4Grid?.grid
                    : undefined
            }
            await gameApi.startRound(startRoundParams);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Start a new round
     */
    const sendRowAction = useCallback(async ( roomId: string, rowNumber: string, action: 'SELECT' | 'CORRECT' | 'INCORRECT', wordLength: number, selectedRowIndex: number, selectedColIndex: number, correctAnswer?: string, markedCharactersIndex?: string, isRow?: boolean ) => {
        try {
            const rowActionParams = {
                roomId: roomId,
                rowNumber: rowNumber,
                selectedRowIndex: selectedRowIndex,
                selectedColIndex: selectedColIndex,
                action: action,
                wordLength: wordLength,
                correctAnswer: correctAnswer,
                markedCharactersIndex: markedCharactersIndex,
                isRow: isRow
            }

            await gameApi.sendRowAction(rowActionParams);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * update game score
     */
    const updateScoring = useCallback(async ( params: ScoringRequest ) => {
        try {
            
            await gameApi.updateScoring(params);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * update game score
     */
    const sendGrid = useCallback(async ( grid: string[][], roomId: string ) => {
        try {
            
            await gameApi.sendGrid(roomId, grid);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * update game score
     */
    const openObstacle = useCallback(async (  roomId: string ,grid: string[][], obstacle: string ) => {
        try {
            
            await gameApi.openObstacle(roomId, grid, obstacle);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * set game score rule
     */
    const setGameScoreRules = useCallback(async ( scoreRules:ScoreRule, roomId: string ) => {
        try {
            
            await gameApi.setScoreRules(roomId, scoreRules);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * update game score
     */
    const sendSelectedCell = useCallback(async ( roomId: string ,rowIndex: string, colIndex: string) => {
        try {
            
            await gameApi.sendSelectedCell(roomId, rowIndex, colIndex);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * update game score
     */
    const sendSelectedCellColor = useCallback(async ( roomId: string, rowIndex: string, colIndex: string, color: string ) => {
        try {
            
            await gameApi.sendSelectedCellColor(roomId, rowIndex, colIndex, color);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Start a new round
     */
    const startTimer = useCallback(async (roomId: string) => {
        try {
            await gameApi.startTimer({ roomId: roomId });
        } catch (error) {
            throw error;
        }
    }, []);

    //   /**
    //    * Submit player answer
    //    */
    //   const submitPlayerAnswer = useCallback(async (params: SubmitAnswerRequest) => {
    //     try {
    //       const result = await dispatch(submitAnswer(params)).unwrap();
    //       return result;
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, [dispatch]);

    /**
     * Broadcast player answers
     */
    const broadcastAnswers = useCallback(async (roomId: string) => {
        try {
            await gameApi.broadcastAnswers(roomId);
        } catch (error) {
            throw error;
        }
    }, []);


    /**
     * Broadcast player answers
     */
    const sendCorrectAnswer = useCallback(async (roomId: string) => {
        try {
            await gameApi.sendCorrectAnswer(
                {
                    roomId: roomId
                }
            );
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Broadcast player answers
     */
    const setGameHistory = useCallback(async (roomId: string) => {
        try {
            await gameApi.setGameHistory(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    //   /**
    //    * Update game scoring
    //    */
    //   const updateGameScoring = useCallback(async (params: ScoringRequest) => {
    //     try {
    //       const result = await dispatch(updateScores(params)).unwrap();
    //       return result;
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, [dispatch]);

    //   /**
    //    * Update current turn
    //    */
    //   const updateTurn = useCallback(async (roomId: string, turn: number) => {
    //     try {
    //       await gameApi.updateTurn(roomId, turn);
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, []);

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

    //   /**
    //    * Set selected packet name
    //    */
    //   const setSelectedPacketName = useCallback(async (roomId: string, packetName: string) => {
    //     try {
    //       await gameApi.setSelectedPacketName(roomId, packetName);
    //     } catch (error) {
    //       throw error;
    //     }
    //   }, []);

    //   /**
    //    * Set current question (local state)
    //    */
    //   const setCurrentQuestionLocal = useCallback((question: Question | null) => {
    //     dispatch(setCurrentQuestion(question));
    //   }, [dispatch]);

    //   /**
    //    * Set questions (local state)
    //    */
    //   const setQuestionsLocal = useCallback((questions: Question[]) => {
    //     dispatch(setQuestions(questions));
    //   }, [dispatch]);

    //   /**
    //    * Set scores (local state)
    //    */
    //   const setScoresLocal = useCallback((scores: Score[]) => {
    //     dispatch(setScores(scores));
    //   }, [dispatch]);

    //   /**
    //    * Clear game errors
    //    */
    //   const clearGameError = useCallback(() => {
    //     dispatch(clearError());
    //   }, [dispatch]);

    const openBuzz = useCallback(async (roomId: string) => {
        try {
            await gameApi.openBuzz(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const closeBuzz = useCallback(async (roomId: string) => {
        try {
            await gameApi.closeBuzz(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const resetBuzz = useCallback(async (roomId: string) => {
        try {
            await gameApi.resetBuzz(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const resetStar = useCallback(async (roomId: string) => {
        try {
            await gameApi.resetStar(roomId);
        } catch (error) {
            throw error;
        }
    }, []);


    const setStar = useCallback(async (roomId: string, playerName: string) => {
        try {
            await gameApi.setStar(roomId, playerName);
        } catch (error) {
            throw error;
        }
    }, []);

    const buzzing = useCallback(async (roomId: string, playerName: string) => {
        try {
            await gameApi.buzzing(roomId, playerName);
        } catch (error) {
            throw error;
        }
    }, []);

    const sendCurrentTurn = useCallback(async (roomId: string, turn: number) => {
        try {
            await gameApi.sendCurrentTurn(roomId, turn);
        } catch (error) {
            throw error;
        }
    }, []);

    /**
     * Set player color for Round 4
     */
    const setPlayerColor = useCallback(async (roomId: string, playerStt: string, color: string) => {
        try {
            const success = await gameApi.setPlayerColor({ roomId, playerStt, color });
            return success;
        } catch (error) {
            console.error('Failed to set player color:', error);
            throw error;
        }
    }, []);

    const startMedia = useCallback(async (roomId: string) => {
        try {
            await gameApi.startMedia(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const stopMedia = useCallback(async (roomId: string) => {
        try {
            await gameApi.stopMedia(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const multiplayerStart = useCallback(async (roomId: string, testName: string, playMode: string, currentQuestionNumber?: number) => {
        try {
            await gameApi.multiplayerStart(roomId, testName, playMode, currentQuestionNumber);
        } catch (error) {
            throw error;
        }
    }, []);

    const multiplayerPause = useCallback(async (roomId: string) => {
        try {
            await gameApi.multiplayerPause(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const multiplayerResume = useCallback(async (roomId: string, testName: string) => {
        try {
            await gameApi.multiplayerResume(roomId, testName);
        } catch (error) {
            throw error;
        }
    }, []);


    const multiplayerEnd = useCallback(async (roomId: string) => {
        try {
            await gameApi.multiplayerEnd(roomId);
        } catch (error) {
            throw error;
        }
    }, []);

    const multiplayerSubmit = useCallback(async (roomId: string, answer: string, stt: string, time: number, playerName: string, avatar: string, testName: string, groupId?: string) => {
        try {
            await gameApi.multiplayerSubmit({ roomId: roomId, answer: answer, stt: stt, time: time, player_name: playerName, avatar: avatar, testName: testName, groupId: groupId });
        } catch (error) {
            throw error;
        }
    }, []);

    const multiplayerGroupInvite = useCallback(async (roomId: string, targetPlayerUid: string, playerName: string, groupId?: string) => {
        try {
            await gameApi.multiplayerInvite({ roomId, targetPlayerUid, playerName, groupId });
        } catch (error) {
            throw error;
        }
    }, []);

    const multiplayerAcceptInvite = useCallback(async (roomId: string, groupId: string, inviterUid?: string) => {
        try {
            await gameApi.multiplayerAcceptInvite({ roomId, groupId, inviterUid });
        } catch (error) {
            throw error;
        }
    }, []);

    const getAllStatistic = async () => {
        try {
            const questions = await gameApi.getAllStatistic();
            return questions;
        } catch (error) {
            throw error;
        }
    };

    const getStatisticByTest = async (testId: string) => {
        try {
            const questions = await gameApi.getStatisticByTest(testId);
            return questions;
        } catch (error) {
            throw error;
        }
    }


    return {
        getQuestionByRound,
        getSpecificQuestion,
        getNextQuestion,
        //     // State
        //     loading,
        //     currentQuestion,
        //     questions,
        //     scores,
        //     currentRound,
        //     round2Grid,
        //     round4Grid,

        //     // API Actions
        //     getQuestions,
        //     getPrefetchQuestion,
        //     getPacketNames,
        //     sendGrid,
        startRound,
        startTimer,
        //     submitPlayerAnswer,
        broadcastAnswers,
        sendCorrectAnswer,
        sendRowAction,
        updateScoring,
        sendSelectedCell,
        sendSelectedCellColor,
        sendGrid,
        openObstacle,
        setGameHistory,
        setGameScoreRules,
        sendCurrentTurn,
        setPlayerColor,

        openBuzz,
        closeBuzz,
        resetBuzz,
        setStar,
        resetStar,
        buzzing,
        //     updateGameScoring,
        //     updateTurn,
        showRules,
        hideRules,
        //     setSelectedPacketName,
        startMedia,
        stopMedia,

        updateGameState,
        //     // Local State Actions
        //     setCurrentQuestionLocal,
        //     setQuestionsLocal,
        //     setScoresLocal,
        //     clearGameError,
        multiplayerStart,
        multiplayerPause,
        multiplayerResume,
        multiplayerEnd,
        multiplayerSubmit,
        multiplayerGroupInvite,
        multiplayerAcceptInvite,

        getAllStatistic,
        getStatisticByTest
    };
};

export default useGameApi;
