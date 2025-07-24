// MIGRATED VERSION: Round2 using Redux and new hooks
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/store";
import { setCurrentQuestion, setRound2Grid } from "../../app/store/slices/gameSlice";
import { addToast } from "../../app/store/slices/uiSlice";
import { useGameApi, useFirebaseListener } from "../../shared/hooks";
import { GameState, Question, Round2Grid } from "../../shared/types";
import { renderGrid } from "./utils";
import { setSelectedRow, setCorrectRow, setIncorectRow, openObstacle, resetBuzz } from "../../components/services";
import { getNextQuestion } from "../../pages/Host/Test/service";
import { generateGrid } from "../../pages/User/Round2/utils";
import PlayerAnswerInput from "../../components/ui/PlayerAnswerInput";
import { submitAnswer } from "../services";

interface HintWord {
  word: string;
  x: number;
  y: number;
  direction: "horizontal" | "vertical";
}

interface MatchPosition {
  x: number;
  y: number;
  dir: number;
}

interface WordObj {
  string: string;
  char: string[];
  totalMatches: number;
  effectiveMatches: number;
  successfulMatches: MatchPosition[];
  x: number;
  y: number;
  dir: number;
  index: number;
}

interface ObstacleQuestionBoxProps {
  obstacleWord?: string;
  hintWordArray?: string[];
  isHost?: boolean;
  initialGrid?: string[][];
  isSpectator?: boolean;
}

interface QuestionBoxProps {
  question: string;
  imageUrl?: string;
  isHost?: boolean;
}

const mainKeyword = "BÒCÔNGANH";

const QuestionBoxRound2: React.FC<ObstacleQuestionBoxProps> = ({
  obstacleWord,
  hintWordArray,
  initialGrid,
  isSpectator = false,
  isHost = false,
}) => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    currentQuestion,
    round2Grid,
    players,
    loading
  } = useAppSelector((state) => state.game as GameState);
  
  // URL params
  const roomId = searchParams.get("roomId") || "";
  const testName = searchParams.get("testName") || "";
  
  // Local state
  const [grid, setGrid] = useState<string[][]>([[]]);
  const [hintWords, setHintWords] = useState<WordObj[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerAnswerTime, setPlayerAnswerTime] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentPlayerName, setCurrentPlayerName] = useState("");
  const [currentPlayerAvatar, setCurrentPlayerAvatar] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [answerList, setAnswerList] = useState<any[]>([]);
  
  // Refs
  const playerAnswerRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  
  // Hooks
  const { getQuestions, submitPlayerAnswer } = useGameApi();
  const {
    listenToCurrentQuestion,
    listenToPlayerAnswers,
    listenToGameState
  } = useFirebaseListener(roomId);

  // Initialize grid from props or Redux state
  useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      setGrid(initialGrid);
      dispatch(setRound2Grid({
        cells: initialGrid,
        rows: initialGrid.length,
        cols: initialGrid[0]?.length || 0,
        horizontalRows: hintWordArray || [],
        cnv: obstacleWord || "",
        selectedRows: [],
        correctRows: [],
        incorrectRows: []
      }));
    } else if (round2Grid) {
      setGrid(round2Grid.cells);
    }
  }, [initialGrid, round2Grid, hintWordArray, obstacleWord, dispatch]);

  // Listen to current question changes
  useEffect(() => {
    if (!roomId) return;
    
    return listenToCurrentQuestion((question) => {
      if (question) {
        setCorrectAnswer(isHost ? question.answer as string : "");
        setAnswerList([]);
        setTimeLeft(30);
        setPlayerAnswerTime(0);
      }
    });
  }, [roomId, listenToCurrentQuestion, isHost]);

  // Listen to game state for Round 2 specific data
  useEffect(() => {
    if (!roomId) return;

    return listenToGameState((gameState) => {
      if (gameState) {
        // Handle time updates
        if (gameState.timeLeft !== undefined) {
          setTimeLeft(gameState.timeLeft);
          setIsInputDisabled(false);
        }

        // Handle row selections
        if (gameState.selectedRow !== undefined) {
          console.log("Row selected:", gameState.selectedRow);
        }

        // Handle correct/incorrect rows
        if (gameState.correctRows) {
          console.log("Correct rows:", gameState.correctRows);
        }

        if (gameState.incorrectRows) {
          console.log("Incorrect rows:", gameState.incorrectRows);
        }

        // Handle obstacle events
        if (gameState.obstacleOpen !== undefined) {
          console.log("Obstacle event:", gameState.obstacleOpen);
        }

        // Handle buzzing
        if (gameState.buzzing !== undefined) {
          console.log("Buzz event:", gameState.buzzing);
        }
      }
    });
  }, [roomId, listenToGameState]);

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

  // Host functions
  const handleRowSelect = async (rowIndex: number) => {
    if (!isHost) return;
    // Note: setSelectedRow function needs proper implementation
    console.log('Selecting row:', { roomId, rowIndex });
  };

  const handleRowCorrect = async (rowIndex: number) => {
    if (!isHost) return;
    // Note: setCorrectRow function needs proper implementation
    console.log('Setting correct row:', { roomId, rowIndex });
  };

  const handleRowIncorrect = async (rowIndex: number) => {
    if (!isHost) return;
    // Note: setIncorectRow function needs proper implementation
    console.log('Setting incorrect row:', { roomId, rowIndex });
  };

  const handleOpenObstacle = async () => {
    if (!isHost) return;
    // Note: openObstacle function needs proper implementation
    console.log('Opening obstacle:', { roomId });
  };

  const handleResetBuzz = async () => {
    if (!isHost) return;
    await resetBuzz(roomId);
  };

  // Loading state
  if (loading.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Round 2...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Round Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Round 2: Vượt Chướng Ngại Vật</h1>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
          <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
            {timeLeft}s remaining
          </span>
        </div>
      </div>

      {/* Grid Display */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {grid.length > 0 && grid[0].length > 0 && (
          <div className="grid-container">
            <div className="text-center text-gray-600 mb-4">
              Round 2 Grid ({grid.length}x{grid[0]?.length || 0})
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 1fr)` }}>
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold bg-white"
                  >
                    {cell}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question Section */}
      {currentQuestion && (
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
      {!isSpectator && !isHost && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Answer</h3>
          <div className="flex gap-3">
            <input
              ref={playerAnswerRef}
              type="text"
              placeholder="Enter your answer..."
              disabled={isInputDisabled || timeLeft <= 0}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleSubmitAnswer(input.value);
                  input.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                if (playerAnswerRef.current) {
                  handleSubmitAnswer(playerAnswerRef.current.value);
                  playerAnswerRef.current.value = '';
                }
              }}
              disabled={isInputDisabled || timeLeft <= 0}
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
            <button
              onClick={handleOpenObstacle}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Open Obstacle
            </button>
            <button
              onClick={handleResetBuzz}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset Buzz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBoxRound2;
