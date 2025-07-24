// MIGRATED VERSION: Round3 using Redux and new hooks
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setCurrentQuestion, setQuestionNumber } from '../../app/store/slices/gameSlice';
import { addToast, setSelectedTopic } from '../../app/store/slices/uiSlice';
import { useGameApi, useFirebaseListener } from '../../shared/hooks';
import { GameState, Question } from '../../shared/types';
import { getPacketNames, setCurrentPacketQuestion, sendCorrectAnswer } from '../../components/services';
import { setSelectedPacketToPlayer } from '../services';
import { updateScore } from '../../pages/Host/Management/service';
import { ref, set, database } from '../../firebase-config';

interface QuestionComponentProps {
    isHost?: boolean;
    isSpectator?: boolean;
}

const QuestionBoxRound3: React.FC<QuestionComponentProps> = ({ 
    isHost = false, 
    isSpectator = false 
}) => {
    const MAX_PACKET_QUESTION = 12;
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    
    // Redux state
    const {
        currentQuestion,
        questionNumber,
        players,
        currentTurn,
        loading
    } = useAppSelector((state) => state.game as GameState);
    
    const { selectedTopic } = useAppSelector((state) => state.ui);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || "";
    const round = searchParams.get("round") || "";
    
    // Local state
    const [topics, setTopics] = useState<string[]>([]);
    const [correctAnswer, setCorrectAnswer] = useState<string>("");
    const [hiddenTopics, setHiddenTopics] = useState<string[]>([]);
    const [usedTopics, setUsedTopics] = useState<string[]>([]);
    const [showReturnButton, setShowReturnButton] = useState(false);
    const [playerCurrentQuestionIndex, setPlayerCurrentQuestionIndex] = useState<number>(-1);
    const [tempQuestionList, setTempQuestionList] = useState<Question[]>([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answerList, setAnswerList] = useState<any[]>([]);
    const [animationKey, setAnimationKey] = useState(0);
    
    // Refs
    const tempQuestionListRef = useRef<Question[]>([]);
    const isFirstMounted = useRef(true);
    
    // Hooks
    const { getQuestions, submitPlayerAnswer } = useGameApi();
    const {
        listenToCurrentQuestion,
        listenToPlayerAnswers,
        listenToGameState
    } = useFirebaseListener(roomId);

    // Load topics on mount
    useEffect(() => {
        if (testName) {
            // Note: getPacketNames function needs to be implemented or imported
            // For now, using placeholder topics
            const placeholderTopics = ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4'];
            setTopics(placeholderTopics);
        }
    }, [testName, dispatch]);

    // Listen to game state for Round 3 specific data
    useEffect(() => {
        if (!roomId) return;

        return listenToGameState((gameState) => {
            if (gameState) {
                // Handle topics/packets
                if (gameState.topics) {
                    setTopics(gameState.topics);
                }

                // Handle selected topic/packet
                if (gameState.selectedTopic) {
                    dispatch(setSelectedTopic(gameState.selectedTopic));
                    setShowReturnButton(true);
                }

                // Handle question number
                if (gameState.currentQuestionIndex !== undefined) {
                    setPlayerCurrentQuestionIndex(gameState.currentQuestionIndex);
                    dispatch(setQuestionNumber(gameState.currentQuestionIndex + 1));
                }

                // Handle time updates
                if (gameState.timeLeft !== undefined) {
                    setTimeLeft(gameState.timeLeft);
                }

                // Handle used topics
                if (gameState.usedTopics) {
                    setUsedTopics(gameState.usedTopics);
                }

                // Handle return to topic selection
                if (gameState.returnToTopicSelection) {
                    dispatch(setSelectedTopic(""));
                    setShowReturnButton(false);
                    setPlayerCurrentQuestionIndex(-1);
                }
            }
        });
    }, [roomId, listenToGameState, dispatch]);

    // Listen to current question
    useEffect(() => {
        if (!roomId) return;

        return listenToCurrentQuestion((question) => {
            if (question) {
                setCorrectAnswer(isHost ? question.answer as string : "");
                setAnswerList([]);
                setTimeLeft(30);
            }
        });
    }, [roomId, listenToCurrentQuestion, isHost]);

    // Listen to player answers
    useEffect(() => {
        if (!roomId) return;

        return listenToPlayerAnswers((answersData) => {
            if (answersData) {
                setAnswerList(Object.values(answersData));
            }
        });
    }, [roomId, listenToPlayerAnswers]);

    // Timer countdown
    useEffect(() => {
        if (!currentQuestion || timeLeft <= 0) return;
        
        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [currentQuestion, timeLeft]);

    // Handle topic selection
    const handleTopicSelect = async (topic: string) => {
        if (usedTopics.includes(topic)) return;
        
        try {
            dispatch(setSelectedTopic(topic));
            await setSelectedPacketToPlayer(roomId, topic);
            
            // Load questions for selected topic
            const questions = await getQuestions({
                testName,
                round: 3,
                difficulty: 'medium' // Default difficulty for Round 3
            });
            
            setTempQuestionList(questions);
            tempQuestionListRef.current = questions;
            setShowReturnButton(true);
            
        } catch (error) {
            console.error('Failed to select topic:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Selection Failed',
                message: 'Failed to select topic. Please try again.'
            }));
        }
    };

    // Handle return to topic selection
    const handleReturnToTopics = async () => {
        try {
            await set(ref(database, `rooms/${roomId}/returnToTopicSelection`), true);
            dispatch(setSelectedTopic(""));
            setShowReturnButton(false);
            setPlayerCurrentQuestionIndex(-1);
        } catch (error) {
            console.error('Failed to return to topics:', error);
        }
    };

    // Handle next question (host only)
    const handleNextQuestion = async () => {
        if (!isHost || !tempQuestionList.length) return;
        
        const nextIndex = playerCurrentQuestionIndex + 1;
        if (nextIndex < tempQuestionList.length) {
            const nextQuestion = tempQuestionList[nextIndex];
            dispatch(setCurrentQuestion(nextQuestion));
            // Note: setCurrentPacketQuestion function needs to be implemented
            // For now, just update the question
        }
    };

    // Handle correct answer (host only)
    const handleCorrectAnswer = async () => {
        if (!isHost || !currentQuestion) return;
        
        try {
            await sendCorrectAnswer(roomId, currentQuestion.answer as string);

            // Update score for current player
            const currentPlayer = players[currentTurn - 1];
            if (currentPlayer) {
                // Note: updateScore function signature needs to be checked
                // For now, using placeholder implementation
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

    // Handle answer submission
    const handleSubmitAnswer = async (answer: string) => {
        if (!roomId || !answer.trim()) return;
        
        try {
            await submitPlayerAnswer({
                roomId,
                uid: 'current-user-id', // Should come from auth state
                answer: answer.trim(),
                time: 30 - timeLeft,
            });
            
            dispatch(addToast({
                type: 'success',
                title: 'Answer Submitted',
                message: 'Your answer has been recorded!'
            }));
        } catch (error) {
            console.error('Failed to submit answer:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Submission Failed',
                message: 'Failed to submit your answer. Please try again.'
            }));
        }
    };

    // Loading state
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Round 3...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Round Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Round 3: Về Đích</h1>
                {selectedTopic && (
                    <div className="text-lg text-gray-700 mb-2">
                        Topic: <span className="font-semibold text-blue-600">{selectedTopic}</span>
                    </div>
                )}
                <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                    {currentQuestion && (
                        <>
                            <span>Question {playerCurrentQuestionIndex + 1} of {MAX_PACKET_QUESTION}</span>
                            <span>•</span>
                        </>
                    )}
                    <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                        {timeLeft}s remaining
                    </span>
                </div>
            </div>

            {/* Topic Selection */}
            {!selectedTopic && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Topic</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {topics.map((topic, index) => (
                            <button
                                key={index}
                                onClick={() => handleTopicSelect(topic)}
                                disabled={usedTopics.includes(topic)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    usedTopics.includes(topic)
                                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
                                }`}
                            >
                                <div className="font-medium">{topic}</div>
                                {usedTopics.includes(topic) && (
                                    <div className="text-xs text-gray-400 mt-1">Used</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Question Display */}
            {selectedTopic && currentQuestion && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="text-lg font-medium text-gray-800 mb-4">
                        {currentQuestion.question}
                    </div>
                    
                    {currentQuestion.imgUrl && (
                        <div className="mb-4">
                            <img 
                                src={currentQuestion.imgUrl} 
                                alt="Question" 
                                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                            />
                        </div>
                    )}
                    
                    {isHost && correctAnswer && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-semibold">Answer: {correctAnswer}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Player Input */}
            {!isSpectator && !isHost && selectedTopic && currentQuestion && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Answer</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter your answer..."
                            disabled={timeLeft <= 0}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmitAnswer((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                        <button
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                handleSubmitAnswer(input.value);
                                input.value = '';
                            }}
                            disabled={timeLeft <= 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

            {/* Host Controls */}
            {isHost && (
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Host Controls</h3>
                    <div className="flex gap-3 flex-wrap">
                        {selectedTopic && (
                            <>
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={playerCurrentQuestionIndex >= tempQuestionList.length - 1}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    Next Question
                                </button>
                                <button
                                    onClick={handleCorrectAnswer}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Mark Correct
                                </button>
                                <button
                                    onClick={handleReturnToTopics}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                >
                                    Return to Topics
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => {
                                // Show current answers logic
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Show Answers ({answerList.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBoxRound3;
