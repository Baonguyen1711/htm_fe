// MIGRATED VERSION: Play layout using Redux and new hooks
import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { 
  setCurrentRound, 
  setPlayers, 
  setScores, 
  setCurrentQuestion,
  setShowRules 
} from '../app/store/slices/gameSlice';
import { setCurrentRoom } from '../app/store/slices/roomSlice';
import { openModal, closeModal, addToast, UIState } from '../app/store/slices/uiSlice';
import {
  useFirebaseListener,
  useGameApi,
  useAuthApi
} from '../shared/hooks';
import { MigrationHelper } from '../shared/utils/migration';
import { GameState, RoomState, AuthState } from '../shared/types';
import Header from './Header';
import HostManagement from '../components/HostManagement';
import PlayerScore from '../components/PlayerScore';
import RulesModal from '../components/RulesModal';
import HostScore from '../components/PlayerAnswer';
import { EyeIcon } from "@heroicons/react/24/solid";
import '../index.css';

interface PlayProps {
    questionComponent: ReactNode;
    isHost?: boolean;
    PlayerScore: ReactNode;
    SideBar: ReactNode;
}

const Play: React.FC<PlayProps> = ({ questionComponent, isHost = false, PlayerScore, SideBar }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Redux state
    const {
        scores,
        currentQuestion,
        currentRound,
        showRules,
        loading
    } = useAppSelector(state => state.game as GameState);

    const { currentRoom } = useAppSelector(state => state.room as RoomState);
    const { modals } = useAppSelector(state => state.ui as UIState);
    const { isAuthenticated } = useAppSelector(state => state.auth as AuthState);

    // URL params
    const roomId = searchParams.get("roomId") || "";
    const round = searchParams.get("round") || "";

    // Local state
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hooks
    const { 
        setupAllListeners,
        updatePlayer,
        setCurrentQuestionFirebase 
    } = useFirebaseListener(roomId);
    
    const { 
        submitPlayerAnswer,
        getQuestions 
    } = useGameApi();
    
    const { verifyToken } = useAuthApi();

    // Round configuration (moved to constants if needed)
    // const roundTabs = [
    //     { key: "1", label: "NHỔ NEO" },
    //     { key: "2", label: "VƯỢT SÓNG" },
    //     { key: "3", label: "BỨT PHÁ" },
    //     { key: "4", label: "CHINH PHỤC" },
    //     { key: "summary", label: "Tổng kết điểm" },
    //     { key: "turn", label: "Phân lượt" },
    // ];

    // const roundTime = {
    //     "1": 10,
    //     "2": 15,
    //     "3": 20,
    //     "4": 30,
    // };

    // Setup Firebase listeners
    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = setupAllListeners({
            onPlayerAnswersChange: (answers) => {
                const playersArray = Object.values(answers);
                const convertedPlayers = playersArray.map(MigrationHelper.convertLegacyPlayerData);
                dispatch(setPlayers(convertedPlayers));
            },
            
            onQuestionChange: (question) => {
                if (question) {
                    const convertedQuestion = MigrationHelper.convertLegacyQuestionData(question);
                    dispatch(setCurrentQuestion(convertedQuestion));
                }
            },
            
            onScoresChange: (scores) => {
                const convertedScores = scores.map(MigrationHelper.convertLegacyScoreData);
                dispatch(setScores(convertedScores));
            },
            
            onRoomChange: (roomData) => {
                if (roomData) {
                    dispatch(setCurrentRoom(roomData));
                }
            },
            
            onGameStateChange: (gameState) => {
                if (gameState) {
                    if (gameState.round) {
                        dispatch(setCurrentRound(gameState.round));
                    }
                    if (gameState.showRules !== undefined) {
                        dispatch(setShowRules(gameState.showRules));
                    }
                }
            },
        });

        return unsubscribe;
    }, [roomId, setupAllListeners, dispatch]);

    // Authentication check
    useEffect(() => {
        if (!isAuthenticated) {
            verifyToken().catch(() => {
                navigate('/login');
            });
        }
    }, [isAuthenticated, verifyToken, navigate]);

    // Handle answer submission
    const handleSubmitAnswer = useCallback(async (answer: string) => {
        if (!roomId || !currentQuestion || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await submitPlayerAnswer({
                roomId,
                uid: 'current-user-id', // This should come from auth state
                answer,
                time: Date.now(),
            });

            dispatch(addToast({
                type: 'success',
                title: 'Answer Submitted',
                message: 'Your answer has been submitted successfully!',
            }));
        } catch (error) {
            console.error('Failed to submit answer:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Submission Failed',
                message: 'Failed to submit your answer. Please try again.',
            }));
        } finally {
            setIsSubmitting(false);
        }
    }, [roomId, currentQuestion, isSubmitting, submitPlayerAnswer, dispatch]);

    // Handle rules modal
    const handleShowRules = useCallback(() => {
        dispatch(openModal({
            id: 'rules-modal',
            type: 'rules',
            data: { round: currentRound },
        }));
    }, [dispatch, currentRound]);

    const handleCloseRules = useCallback(() => {
        dispatch(closeModal('rules-modal'));
    }, [dispatch]);

    // Toggle sidebar
    const toggleSidebar = useCallback(() => {
        setSidebarVisible(prev => !prev);
    }, []);

    // Loading state
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading game...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <Header
                isHost={isHost}
                spectatorCount={0} // TODO: Get actual spectator count from Redux
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 p-4">
                        {questionComponent}
                    </div>
                    
                    {/* Player Score/Answer Area */}
                    <div className="border-t bg-white p-4">
                        {PlayerScore}
                    </div>
                </div>

                {/* Sidebar */}
                {sidebarVisible && (
                    <div className="w-80 bg-white border-l shadow-lg">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-gray-800">Game Info</h3>
                        </div>
                        <div className="p-4">
                            {SideBar}
                        </div>
                    </div>
                )}

                {/* Sidebar Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-blue-700 transition-colors z-10"
                >
                    <EyeIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Host Management (if host) */}
            {isHost && (
                <div className="border-t bg-white p-4">
                    <HostManagement />
                </div>
            )}

            {/* Rules Modal */}
            {modals['rules-modal']?.isOpen && (
                <RulesModal
                    isOpen={true}
                    onClose={handleCloseRules}
                    round={currentRound.toString()}
                />
            )}
        </div>
    );
};

export default Play;
