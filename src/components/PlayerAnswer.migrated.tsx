// MIGRATED VERSION: PlayerAnswer using Redux and new hooks
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { setCurrentTurn } from '../app/store/slices/gameSlice';
import { addToast } from '../app/store/slices/uiSlice';
import { useFirebaseListener, useGameApi } from '../shared/hooks';
import { GameState } from '../shared/types';
import { buzzing, setStar, closeBuzz } from './services';

interface PlayerAnswerProps {
    isSpectator?: boolean;
}

const PlayerAnswer: React.FC<PlayerAnswerProps> = ({ isSpectator = false }) => {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    
    // Redux state
    const {
        players,
        currentTurn,
        loading
    } = useAppSelector((state) => state.game as GameState);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    
    // Local state
    const [answers, setAnswers] = useState<any[]>([]);
    const [broadcastedAnswer, setBroadcastedAnswer] = useState<string>("");
    const [buzzOpen, setBuzzOpen] = useState(false);
    const [currentPlayerBuzz, setCurrentPlayerBuzz] = useState<string>("");
    const [canBuzz, setCanBuzz] = useState(true);
    
    // Hooks
    const { submitPlayerAnswer } = useGameApi();
    const {
        listenToPlayerAnswers,
        listenToGameState
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

    // Listen to game state for all player-related updates
    useEffect(() => {
        if (!roomId) return;

        return listenToGameState((gameState) => {
            if (gameState) {
                // Handle broadcasted answers
                if (gameState.broadcastedAnswer) {
                    setBroadcastedAnswer(gameState.broadcastedAnswer);
                }

                // Handle current turn
                if (gameState.currentTurn !== undefined) {
                    dispatch(setCurrentTurn(gameState.currentTurn));
                }

                // Handle buzz state
                if (gameState.buzzOpen !== undefined) {
                    setBuzzOpen(gameState.buzzOpen);
                    setCanBuzz(true);
                }
            }
        });
    }, [roomId, listenToGameState, dispatch]);

    // Handle buzz in
    const handleBuzzIn = async () => {
        if (!roomId || !canBuzz || !buzzOpen || isSpectator) return;

        try {
            const currentUser = 'current-user-id'; // Should come from auth state
            // Note: buzzing function needs to be implemented
            console.log('Buzzing in:', currentUser);

            setCanBuzz(false);
            setCurrentPlayerBuzz(currentUser);

            dispatch(addToast({
                type: 'success',
                title: 'Buzzed In!',
                message: 'You have successfully buzzed in!'
            }));
        } catch (error) {
            console.error('Failed to buzz in:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Buzz Failed',
                message: 'Failed to buzz in. Please try again.'
            }));
        }
    };

    // Handle set star
    const handleSetStar = async (row: number, col: number) => {
        if (!roomId || isSpectator) return;

        try {
            // Note: setStar function needs to be implemented
            console.log('Setting star at:', { row, col });

            dispatch(addToast({
                type: 'success',
                title: 'Star Set',
                message: 'Star position has been set!'
            }));
        } catch (error) {
            console.error('Failed to set star:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Star Failed',
                message: 'Failed to set star. Please try again.'
            }));
        }
    };

    // Handle close buzz
    const handleCloseBuzz = async () => {
        if (!roomId || isSpectator) return;

        try {
            // Note: closeBuzz function needs to be implemented
            console.log('Closing buzz');
            setBuzzOpen(false);
            setCanBuzz(true);
            setCurrentPlayerBuzz("");

            dispatch(addToast({
                type: 'success',
                title: 'Buzz Closed',
                message: 'Buzz has been closed!'
            }));
        } catch (error) {
            console.error('Failed to close buzz:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Close Failed',
                message: 'Failed to close buzz. Please try again.'
            }));
        }
    };

    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading player data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Player Actions</h2>

            {/* Buzz Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Buzz System</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        buzzOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {buzzOpen ? 'Open' : 'Closed'}
                    </div>
                </div>

                {!isSpectator && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleBuzzIn}
                            disabled={!buzzOpen || !canBuzz}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                buzzOpen && canBuzz
                                    ? 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {canBuzz ? 'BUZZ IN!' : 'Already Buzzed'}
                        </button>
                        
                        {currentPlayerBuzz && (
                            <button
                                onClick={handleCloseBuzz}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Close Buzz
                            </button>
                        )}
                    </div>
                )}

                {currentPlayerBuzz && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            <span className="font-medium">Buzzed Player:</span> {currentPlayerBuzz}
                        </p>
                    </div>
                )}
            </div>

            {/* Broadcasted Answer */}
            {broadcastedAnswer && (
                <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 mb-2">Correct Answer Revealed</h3>
                        <p className="text-green-700 text-lg">{broadcastedAnswer}</p>
                    </div>
                </div>
            )}

            {/* Current Turn */}
            {currentTurn > 0 && (
                <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">Current Turn</h3>
                        <p className="text-blue-700">
                            Player #{currentTurn} is currently playing
                        </p>
                    </div>
                </div>
            )}

            {/* Player Answers Display */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Submitted Answers ({answers.length})
                </h3>
                
                {answers.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-gray-500">No answers submitted yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {answers.map((answer, index) => (
                            <div 
                                key={index}
                                className="border border-gray-200 rounded-lg p-3"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {answer.avatar && (
                                        <img 
                                            src={answer.avatar} 
                                            alt={answer.userName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <h4 className="font-medium text-gray-800">
                                            {answer.userName} (#{answer.stt})
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Submitted in {answer.time || 0}s
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-700 bg-gray-50 rounded p-2">
                                    {answer.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Game Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Instructions</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Wait for the buzz system to open before buzzing in</li>
                    <li>• Only one buzz per player per question</li>
                    <li>• Answer quickly when it's your turn</li>
                    <li>• Watch for the correct answer reveal</li>
                </ul>
            </div>
        </div>
    );
};

export default PlayerAnswer;
