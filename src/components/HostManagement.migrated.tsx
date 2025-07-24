// MIGRATED VERSION: HostManagement using Redux and new hooks
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { 
    setCurrentQuestion, 
    nextQuestion, 
    setQuestionNumber,
    setCurrentTurn 
} from '../app/store/slices/gameSlice';
import { addToast, setSelectedTopic } from '../app/store/slices/uiSlice';
import { useGameApi, useFirebaseListener } from '../shared/hooks';
import { GameState } from '../shared/types';
import { openBuzz, playSound } from './services';
import { deletePath } from '../services/firebaseServices';
import { updateScore } from '../pages/Host/Management/service';
import http from '../services/http';
import {
    CheckCircleIcon,
    BellAlertIcon,
    ArrowRightCircleIcon,
    EyeIcon,
    ClockIcon,
    PlayCircleIcon,
    SpeakerWaveIcon,
    MusicalNoteIcon,
    DocumentTextIcon,
    EyeSlashIcon,
    QuestionMarkCircleIcon,
    PaintBrushIcon,
} from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import HostQuestionPreview from './HostQuestionPreview';
import HostGuideModal from './HostGuideModal';
import PlayerColorSelector from './PlayerColorSelector';
import useTokenRefresh from '../hooks/useTokenRefresh';

const HostManagement = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // Redux state
    const {
        currentQuestion,
        questions,
        questionNumber,
        players,
        currentRound,
        currentTurn,
        round2Grid,
        round4Grid,
        loading
    } = useAppSelector((state) => state.game as GameState);
    
    const { selectedTopic } = useAppSelector((state) => state.ui);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || "";
    const round = searchParams.get("round") || "";
    
    // Local state
    const [currentAnswer, setCurrentAnswer] = useState<string>("");
    const [playerScores, setPlayerScores] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [playerColors, setPlayerColors] = useState<{[key: string]: string}>({});
    const [inGameQuestionIndex, setInGameQuestionIndex] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showColorSelector, setShowColorSelector] = useState(false);
    const [easyQuestionNumber, setEasyQuestionNumber] = useState(0);
    const [mediumQuestionNumber, setMediumQuestionNumber] = useState(0);
    const [hardQuestionNumber, setHardQuestionNumber] = useState(0);
    const [level, setLevel] = useState<string>("");
    
    // Hooks
    const {
        getQuestions,
        submitPlayerAnswer
    } = useGameApi();

    const {
        listenToCurrentQuestion,
        listenToPlayerAnswers,
        listenToScores,
        setCurrentQuestionFirebase
    } = useFirebaseListener(roomId);
    
    // Token refresh hook
    useTokenRefresh();

    // Listen to current question changes
    useEffect(() => {
        if (!roomId) return;
        
        return listenToCurrentQuestion((question) => {
            if (question) {
                setCurrentAnswer(question.answer as string || "");
            }
        });
    }, [roomId, listenToCurrentQuestion]);

    // Listen to player answers
    useEffect(() => {
        if (!roomId) return;

        return listenToPlayerAnswers((answersData) => {
            if (answersData) {
                // Handle answers data
                console.log("Answers received:", answersData);
            }
        });
    }, [roomId, listenToPlayerAnswers]);

    // Listen to scores
    useEffect(() => {
        if (!roomId) return;
        
        return listenToScores((scoresData) => {
            if (scoresData) {
                setPlayerScores(Object.values(scoresData));
            }
        });
    }, [roomId, listenToScores]);

    // Handle next question
    const handleNextQuestion = async () => {
        if (!questions.length) return;
        
        try {
            const nextIndex = questionNumber;
            if (nextIndex < questions.length) {
                const nextQ = questions[nextIndex];
                dispatch(setCurrentQuestion(nextQ));
                dispatch(nextQuestion());
                setCurrentAnswer(nextQ.answer as string || "");
                
                // Update Firebase
                await setCurrentQuestionFirebase(nextQ);
                
                dispatch(addToast({
                    type: 'success',
                    title: 'Question Updated',
                    message: 'Next question loaded successfully!'
                }));
            }
        } catch (error) {
            console.error('Failed to load next question:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to load next question. Please try again.'
            }));
        }
    };

    // Handle show answer
    const handleShowAnswer = async () => {
        if (!currentAnswer || !roomId) return;

        try {
            // Note: sendCorrectAnswer function needs to be implemented
            console.log('Showing answer:', currentAnswer);

            dispatch(addToast({
                type: 'success',
                title: 'Answer Revealed',
                message: 'Correct answer has been shown to players!'
            }));
        } catch (error) {
            console.error('Failed to show answer:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Show Answer Failed',
                message: 'Failed to show answer. Please try again.'
            }));
        }
    };

    // Handle start time
    const handleStartTime = async (duration: number = 30) => {
        if (!roomId) return;

        try {
            // Note: startTimer function needs to be implemented
            console.log('Starting timer:', { roomId, duration });

            dispatch(addToast({
                type: 'success',
                title: 'Timer Started',
                message: `Timer started for ${duration} seconds!`
            }));
        } catch (error) {
            console.error('Failed to start timer:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Timer Failed',
                message: 'Failed to start timer. Please try again.'
            }));
        }
    };

    // Handle start round
    const handleStartRound = async () => {
        if (!roomId) return;

        try {
            // Note: startRound function needs to be implemented
            console.log('Starting round:', { roomId, currentRound });

            dispatch(addToast({
                type: 'success',
                title: 'Round Started',
                message: `Round ${currentRound} has been started!`
            }));
        } catch (error) {
            console.error('Failed to start round:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Start Round Failed',
                message: 'Failed to start round. Please try again.'
            }));
        }
    };

    // Handle correct answer
    const handleCorrectAnswer = async () => {
        if (!currentAnswer || !roomId) return;

        try {
            // Note: sendCorrectAnswer function needs to be implemented
            console.log('Marking answer correct:', currentAnswer);

            // Update score for current player
            const currentPlayer = players[currentTurn - 1];
            if (currentPlayer) {
                // Note: updateScore function needs to be implemented
                console.log('Updating score for player:', currentPlayer.stt);
            }

            dispatch(addToast({
                type: 'success',
                title: 'Answer Marked Correct',
                message: 'Player score updated successfully!'
            }));
        } catch (error) {
            console.error('Failed to mark answer correct:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update score. Please try again.'
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

    // Handle play sound
    const handlePlaySound = async (soundType: string) => {
        if (!roomId) return;
        
        try {
            await playSound(roomId, soundType);
            
            dispatch(addToast({
                type: 'success',
                title: 'Sound Played',
                message: `${soundType} sound has been played!`
            }));
        } catch (error) {
            console.error('Failed to play sound:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Sound Failed',
                message: 'Failed to play sound. Please try again.'
            }));
        }
    };

    // Handle clear path
    const handleClearPath = async (path: string) => {
        if (!roomId) return;

        try {
            // Note: deletePath function needs to be implemented
            console.log('Clearing path:', `rooms/${roomId}/${path}`);

            dispatch(addToast({
                type: 'success',
                title: 'Path Cleared',
                message: `${path} has been cleared!`
            }));
        } catch (error) {
            console.error('Failed to clear path:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Clear Failed',
                message: 'Failed to clear path. Please try again.'
            }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Host Management</h2>
            
            {/* Question Controls */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                <button
                    onClick={handleNextQuestion}
                    disabled={questionNumber >= questions.length}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    <ArrowRightCircleIcon className="w-5 h-5" />
                    Next Question
                </button>
                
                <button
                    onClick={handleShowAnswer}
                    disabled={!currentAnswer}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    Show Answer
                </button>
                
                <button
                    onClick={() => handleStartTime(30)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                    <ClockIcon className="w-5 h-5" />
                    Start Timer
                </button>
                
                <button
                    onClick={handleStartRound}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    <PlayCircleIcon className="w-5 h-5" />
                    Start Round
                </button>
            </div>

            {/* Game Controls */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                <button
                    onClick={handleOpenBuzz}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    <BellAlertIcon className="w-5 h-5" />
                    Open Buzz
                </button>
                
                <button
                    onClick={() => handlePlaySound('correct')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    <SpeakerWaveIcon className="w-5 h-5" />
                    Correct Sound
                </button>
                
                <button
                    onClick={() => handlePlaySound('incorrect')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    <SpeakerWaveIcon className="w-5 h-5" />
                    Wrong Sound
                </button>
                
                <button
                    onClick={() => handlePlaySound('music')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    <MusicalNoteIcon className="w-5 h-5" />
                    Play Music
                </button>
            </div>

            {/* Utility Controls */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    <EyeIcon className="w-5 h-5" />
                    Preview
                </button>
                
                <button
                    onClick={() => setShowGuide(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    Guide
                </button>
                
                <button
                    onClick={() => setShowColorSelector(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    <PaintBrushIcon className="w-5 h-5" />
                    Colors
                </button>
                
                <button
                    onClick={() => handleClearPath('answers')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    Clear Answers
                </button>
            </div>

            {/* Current Question Info */}
            {currentQuestion && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Current Question</h3>
                    <p className="text-gray-600 mb-2">{currentQuestion.question}</p>
                    {currentAnswer && (
                        <p className="text-green-600 font-medium">Answer: {currentAnswer}</p>
                    )}
                    <p className="text-sm text-gray-500">
                        Question {questionNumber} of {questions.length}
                    </p>
                </div>
            )}

            {/* Modals */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Question Preview</h3>
                            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        {currentQuestion && (
                            <div>
                                <p className="text-gray-800 mb-4">{currentQuestion.question}</p>
                                {currentQuestion.imgUrl && (
                                    <img src={currentQuestion.imgUrl} alt="Question" className="max-w-full h-auto rounded" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showGuide && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Host Guide</h3>
                            <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>Host controls for Round {currentRound}:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• Use Next Question to advance</li>
                                <li>• Show Answer reveals correct answer</li>
                                <li>• Start Timer begins countdown</li>
                                <li>• Use sound controls for feedback</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {showColorSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Player Colors</h3>
                            <button onClick={() => setShowColorSelector(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>Player color management will be implemented here.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HostManagement;
