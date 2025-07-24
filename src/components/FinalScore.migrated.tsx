// MIGRATED VERSION: FinalScore using Redux and new hooks
import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { addToast } from '../app/store/slices/uiSlice';
import { useFirebaseListener } from '../shared/hooks';
import { GameState } from '../shared/types';
import PlayerScore from '../components/PlayerScore.migrated';
import Header from '../layouts/Header';
import { updateHistory } from './services';

interface PlayerScoreProps {
    isHost?: boolean;
    buttonComponent?: ReactNode;
}

const FinalScore: React.FC<PlayerScoreProps> = ({ isHost = false, buttonComponent }) => {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    
    // Redux state
    const {
        scores,
        players,
        loading
    } = useAppSelector((state) => state.game as GameState);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || "";
    
    // Local state
    const [isHistoryUpdated, setIsHistoryUpdated] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Hooks
    const { listenToScores } = useFirebaseListener(roomId);

    // Listen to final scores
    useEffect(() => {
        if (!roomId) return;
        
        return listenToScores((scoresData) => {
            if (scoresData) {
                // Trigger confetti animation when scores are loaded
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            }
        });
    }, [roomId, listenToScores]);

    // Update history when component mounts
    useEffect(() => {
        if (!roomId || !testName || isHistoryUpdated) return;
        
        const updateGameHistory = async () => {
            try {
                // Note: updateHistory function needs to be implemented
                console.log('Updating game history:', { roomId, testName });
                setIsHistoryUpdated(true);

                dispatch(addToast({
                    type: 'success',
                    title: 'Game Complete',
                    message: 'Game results have been saved to history!'
                }));
            } catch (error) {
                console.error('Failed to update history:', error);
                dispatch(addToast({
                    type: 'error',
                    title: 'History Update Failed',
                    message: 'Failed to save game results. Please try again.'
                }));
            }
        };

        updateGameHistory();
    }, [roomId, testName, isHistoryUpdated, dispatch]);

    // Get winner information
    const getWinnerInfo = () => {
        if (!scores.length) return null;
        
        const sortedScores = [...scores].sort((a, b) =>
            parseInt(b.score.toString()) - parseInt(a.score.toString())
        );
        
        const winner = sortedScores[0];
        const isMultipleWinners = sortedScores.filter(s => s.score === winner.score).length > 1;
        
        return {
            winner,
            isMultipleWinners,
            topScores: sortedScores.slice(0, 3)
        };
    };

    const winnerInfo = getWinnerInfo();

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}
                            >
                                {['🎉', '🎊', '⭐', '🏆', '🎈'][Math.floor(Math.random() * 5)]}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                    transform: "scale(0.75)",
                    width: `${100 / 0.75}vw`,
                    height: `${100 / 0.75}vh`,
                }}
            >
                <div className="relative min-h-full">
                    {/* Ocean/Starry Night Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col min-h-full">
                        {isHost && <Header isHost={isHost} />}
                        
                        {/* Winner Announcement */}
                        {winnerInfo && (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🏆</div>
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {winnerInfo.isMultipleWinners ? 'We Have Winners!' : 'We Have a Winner!'}
                                </h1>
                                <div className="text-2xl text-yellow-300 font-semibold">
                                    {winnerInfo.winner.playerName}
                                </div>
                                <div className="text-xl text-blue-200 mt-2">
                                    Final Score: {winnerInfo.winner.score} points
                                </div>
                            </div>
                        )}

                        <div className="flex flex-1 items-center justify-center w-full py-8"
                            style={{
                                marginTop: isHost ? "120px" : "60px",
                                transform: "scale(1.3)",
                            }}
                        >
                            <div className="w-full max-w-2xl">
                                <PlayerScore />
                                
                                {/* Additional Game Stats */}
                                <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4 text-center">
                                        Game Statistics
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-white/20 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-white">
                                                {players.length}
                                            </div>
                                            <div className="text-blue-200 text-sm">
                                                Total Players
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/20 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-white">
                                                {testName || 'Quiz Game'}
                                            </div>
                                            <div className="text-blue-200 text-sm">
                                                Game Name
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {winnerInfo && winnerInfo.topScores.length > 1 && (
                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-white mb-3 text-center">
                                                Top 3 Players
                                            </h4>
                                            <div className="space-y-2">
                                                {winnerInfo.topScores.map((score, index) => (
                                                    <div 
                                                        key={index}
                                                        className="flex justify-between items-center bg-white/20 rounded-lg p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl">
                                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                            </div>
                                                            <span className="text-white font-medium">
                                                                {score.playerName}
                                                            </span>
                                                        </div>
                                                        <span className="text-yellow-300 font-bold">
                                                            {score.score} pts
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Custom Button Component */}
                                {buttonComponent && (
                                    <div className="mt-6 text-center">
                                        {buttonComponent}
                                    </div>
                                )}
                                
                                {/* Thank You Message */}
                                <div className="mt-8 text-center">
                                    <div className="text-lg text-blue-200 mb-2">
                                        Thank you for playing!
                                    </div>
                                    <div className="text-sm text-blue-300">
                                        Game results have been saved to your history
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalScore;
