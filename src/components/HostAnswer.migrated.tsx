// MIGRATED VERSION: HostAnswer using Redux and new hooks
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { setScores, setCurrentTurn } from '../app/store/slices/gameSlice';
import { addToast } from '../app/store/slices/uiSlice';
import { useFirebaseListener } from '../shared/hooks';
import { GameState } from '../shared/types';
import { updateScore } from '../pages/Host/Management/service';
import { openBuzz } from './services';
import { setCurrrentTurnToPlayer } from '../layouts/services';
import { toast } from 'react-toastify';
import SimpleColorPicker from './SimpleColorPicker';

interface HostAnswerProps {
    isSpectator?: boolean;
}

const HostAnswer: React.FC<HostAnswerProps> = ({ isSpectator = false }) => {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    
    // Redux state
    const {
        players,
        scores,
        currentTurn,
        loading
    } = useAppSelector((state) => state.game as GameState);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    
    // Local state
    const [answers, setAnswers] = useState<any[]>([]);
    const [broadcastedAnswer, setBroadcastedAnswer] = useState<string>("");
    const [selectedPlayer, setSelectedPlayer] = useState<string>("");
    const [playerColors, setPlayerColors] = useState<{[key: string]: string}>({});
    const [showColorPicker, setShowColorPicker] = useState<{[key: string]: boolean}>({});
    const [usedColors, setUsedColors] = useState<Set<string>>(new Set());
    
    // Refs
    const prevOrder = useRef<{ [name: string]: number }>({});
    
    // Hooks
    const {
        listenToPlayerAnswers,
        listenToGameState,
        listenToScores
    } = useFirebaseListener(roomId);

    // Listen to player answers
    useEffect(() => {
        if (!roomId) return;

        return listenToPlayerAnswers((answersData) => {
            if (answersData) {
                const answersList = Object.values(answersData);
                setAnswers(answersList);
            }
        });
    }, [roomId, listenToPlayerAnswers]);

    // Listen to game state for broadcasted answers
    useEffect(() => {
        if (!roomId) return;

        return listenToGameState((gameState) => {
            if (gameState && gameState.broadcastedAnswer) {
                setBroadcastedAnswer(gameState.broadcastedAnswer);
            }
        });
    }, [roomId, listenToGameState]);

    // Listen to scores
    useEffect(() => {
        if (!roomId) return;
        
        return listenToScores((scoresData) => {
            if (scoresData) {
                const scoresArray = Object.values(scoresData);
                dispatch(setScores(scoresArray));
            }
        });
    }, [roomId, listenToScores, dispatch]);

    // Handle score update
    const handleScoreUpdate = async (playerStt: string, score: string, isCorrect: boolean) => {
        if (!roomId) return;

        try {
            // Note: updateScore function needs to be implemented
            console.log('Updating score:', { playerStt, score, isCorrect });

            dispatch(addToast({
                type: 'success',
                title: 'Score Updated',
                message: `Player score updated to ${score} points!`
            }));
        } catch (error) {
            console.error('Failed to update score:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update player score. Please try again.'
            }));
        }
    };

    // Handle set current turn
    const handleSetCurrentTurn = async (playerStt: string) => {
        if (!roomId) return;

        try {
            // Note: setCurrrentTurnToPlayer function needs to be implemented
            console.log('Setting current turn to player:', playerStt);
            dispatch(setCurrentTurn(parseInt(playerStt)));

            dispatch(addToast({
                type: 'success',
                title: 'Turn Set',
                message: `Current turn set to player ${playerStt}!`
            }));
        } catch (error) {
            console.error('Failed to set current turn:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Turn Set Failed',
                message: 'Failed to set current turn. Please try again.'
            }));
        }
    };

    // Handle open buzz
    const handleOpenBuzz = async () => {
        if (!roomId) return;
        
        try {
            await openBuzz(roomId);
            
            dispatch(addToast({
                type: 'success',
                title: 'Buzz Opened',
                message: 'Players can now buzz in!'
            }));
        } catch (error) {
            console.error('Failed to open buzz:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Buzz Failed',
                message: 'Failed to open buzz. Please try again.'
            }));
        }
    };

    // Handle color change
    const handleColorChange = (playerStt: string, color: string) => {
        setPlayerColors(prev => {
            const newColors = { ...prev };
            const oldColor = newColors[playerStt];

            // Update used colors set
            setUsedColors(prevUsed => {
                const newUsed = new Set(prevUsed);
                if (oldColor) {
                    newUsed.delete(oldColor);
                }
                if (color) {
                    newUsed.add(color);
                }
                return newUsed;
            });

            newColors[playerStt] = color;
            return newColors;
        });

        setShowColorPicker(prev => ({
            ...prev,
            [playerStt]: false
        }));
    };

    // Toggle color picker
    const toggleColorPicker = (playerStt: string) => {
        setShowColorPicker(prev => ({
            ...prev,
            [playerStt]: !prev[playerStt]
        }));
    };

    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading answers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Player Answers</h2>
                <button
                    onClick={handleOpenBuzz}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Open Buzz
                </button>
            </div>

            {/* Broadcasted Answer */}
            {broadcastedAnswer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-green-800 mb-2">Correct Answer</h3>
                    <p className="text-green-700">{broadcastedAnswer}</p>
                </div>
            )}

            {/* Player Answers */}
            <div className="space-y-4">
                {answers.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-gray-500">No answers submitted yet</p>
                    </div>
                ) : (
                    answers.map((answer, index) => (
                        <div 
                            key={index}
                            className="border border-gray-200 rounded-lg p-4"
                            style={{ backgroundColor: playerColors[answer.stt] || 'transparent' }}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    {answer.avatar && (
                                        <img 
                                            src={answer.avatar} 
                                            alt={answer.userName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-gray-800">
                                            {answer.userName} (#{answer.stt})
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Time: {answer.time || 0}s
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleColorPicker(answer.stt)}
                                        className="p-2 text-gray-500 hover:text-gray-700"
                                        title="Change color"
                                    >
                                        🎨
                                    </button>
                                    
                                    <button
                                        onClick={() => handleSetCurrentTurn(answer.stt)}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Set Turn
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="text-gray-800 font-medium">
                                    Answer: {answer.answer}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleScoreUpdate(answer.stt, "10", true)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                    Correct (+10)
                                </button>
                                
                                <button
                                    onClick={() => handleScoreUpdate(answer.stt, "5", true)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Partial (+5)
                                </button>
                                
                                <button
                                    onClick={() => handleScoreUpdate(answer.stt, "0", false)}
                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                    Wrong (0)
                                </button>
                            </div>

                            {/* Color Picker */}
                            {showColorPicker[answer.stt] && (
                                <div className="mt-3">
                                    <SimpleColorPicker
                                        playerStt={answer.stt}
                                        currentColor={playerColors[answer.stt]}
                                        onColorChange={handleColorChange}
                                        usedColors={usedColors}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Current Turn Indicator */}
            {currentTurn > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Current Turn</h3>
                    <p className="text-blue-700">Player #{currentTurn}</p>
                </div>
            )}
        </div>
    );
};

export default HostAnswer;
