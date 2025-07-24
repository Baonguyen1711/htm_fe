// MIGRATED VERSION: Round1 using Redux and new hooks
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../../app/store';
import { setCurrentQuestion, nextQuestion } from '../../../../../app/store/slices/gameSlice';
import { addToast } from '../../../../../app/store/slices/uiSlice';
import { useGameApi, useFirebaseListener } from '../../../../../shared/hooks';
import { Button, Input } from '../../../../../shared/components/ui';
import { GameState } from '../../../../../shared/types';

interface Round1Props {
  isHost?: boolean;
  isSpectator?: boolean;
}

const Round1: React.FC<Round1Props> = ({ isHost = false, isSpectator = false }) => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    currentQuestion,
    questions,
    questionNumber,
    players,
    loading
  } = useAppSelector((state) => state.game as GameState);
  
  // URL params
  const roomId = searchParams.get("roomId") || "";
  const testName = searchParams.get("testName") || "";
  
  // Local state
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswering, setIsAnswering] = useState(false);
  
  // Hooks
  const {
    getQuestions,
    submitPlayerAnswer
  } = useGameApi();
  
  const { 
    listenToCurrentQuestion,
    setCurrentQuestionFirebase 
  } = useFirebaseListener(roomId);

  // Load questions on mount
  useEffect(() => {
    if (testName && questions.length === 0) {
      getQuestions({
        testName,
        round: 1,
        difficulty: 'easy'
      }).catch(error => {
        console.error('Failed to load questions:', error);
        dispatch(addToast({
          type: 'error',
          title: 'Loading Failed',
          message: 'Failed to load questions for Round 1'
        }));
      });
    }
  }, [testName, questions.length, getQuestions, dispatch]);

  // Listen to current question changes
  useEffect(() => {
    if (!roomId) return;
    
    return listenToCurrentQuestion((question) => {
      if (question) {
        setTimeLeft(30); // Reset timer for new question
        setPlayerAnswer(''); // Clear previous answer
        setIsAnswering(false);
      }
    });
  }, [roomId, listenToCurrentQuestion]);

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentQuestion, timeLeft]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback(async () => {
    if (!roomId || !playerAnswer.trim() || isAnswering) return;
    
    setIsAnswering(true);
    try {
      await submitPlayerAnswer({
        roomId,
        uid: 'current-user-id', // Should come from auth state
        answer: playerAnswer.trim(),
        time: 30 - timeLeft,
      });
      
      dispatch(addToast({
        type: 'success',
        title: 'Answer Submitted',
        message: 'Your answer has been recorded!'
      }));
      
      setPlayerAnswer('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
      dispatch(addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit your answer. Please try again.'
      }));
    } finally {
      setIsAnswering(false);
    }
  }, [roomId, playerAnswer, timeLeft, isAnswering, submitPlayerAnswer, dispatch]);

  // Host: Next question
  const handleNextQuestion = useCallback(async () => {
    if (!isHost || !questions.length) return;
    
    const nextQuestionIndex = questionNumber;
    if (nextQuestionIndex < questions.length) {
      const nextQ = questions[nextQuestionIndex];
      dispatch(setCurrentQuestion(nextQ));
      dispatch(nextQuestion());
      
      // Update Firebase
      await setCurrentQuestionFirebase(nextQ);
    }
  }, [isHost, questions, questionNumber, dispatch, setCurrentQuestionFirebase]);

  // Loading state
  if (loading.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Round 1...</p>
        </div>
      </div>
    );
  }

  // No question state
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Round 1: Nhổ Neo</h2>
          <p className="text-gray-600">Waiting for questions to start...</p>
          {isHost && questions.length > 0 && (
            <Button 
              onClick={handleNextQuestion}
              className="mt-4"
              variant="primary"
            >
              Start Round 1
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Round Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Round 1: Nhổ Neo</h1>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
          <span>Question {questionNumber} of {questions.length}</span>
          <span>•</span>
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
            {timeLeft}s remaining
          </span>
        </div>
      </div>

      {/* Question Card */}
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
      </div>

      {/* Answer Section */}
      {!isSpectator && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Answer</h3>
          <div className="flex gap-3">
            <Input
              value={playerAnswer}
              onChange={(e) => setPlayerAnswer(e.target.value)}
              placeholder="Enter your answer..."
              disabled={timeLeft <= 0 || isAnswering}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitAnswer();
                }
              }}
            />
            <Button
              onClick={handleSubmitAnswer}
              disabled={!playerAnswer.trim() || timeLeft <= 0 || isAnswering}
              isLoading={isAnswering}
              variant="primary"
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {/* Host Controls */}
      {isHost && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Host Controls</h3>
          <div className="flex gap-3">
            <Button
              onClick={handleNextQuestion}
              disabled={questionNumber >= questions.length}
              variant="primary"
            >
              Next Question
            </Button>
            <Button
              onClick={() => {
                // Show current answers logic
              }}
              variant="secondary"
            >
              Show Answers ({players.filter(p => p.answer).length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round1;
