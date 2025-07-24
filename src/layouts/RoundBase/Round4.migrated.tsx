// MIGRATED VERSION: Round4 using Redux and new hooks
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setCurrentQuestion, setRound4Grid } from '../../app/store/slices/gameSlice';
import { addToast } from '../../app/store/slices/uiSlice';
import { useGameApi, useFirebaseListener } from '../../shared/hooks';
import { GameState, Question } from '../../shared/types';
import { sendSelectedCell, sendCellColor, resetBuzz } from '../../components/services';
import GameGrid from '../../components/ui/GameGrid';

interface QuestionComponentProps {
    initialGrid?: string[][]; // 5x5 grid (can be passed from parent or generated)
    questions?: string[]; // Array of questions for testing
    isSpectator?: boolean; // Indicates whether the user is a spectator
    isHost?: boolean; // Indicates whether the user is the host
}

interface GameGridProps {
    initialGrid: string[][];
    gridColors: string[][];
    menu: { visible: boolean; rowIndex?: number; colIndex?: number };
    isSpectator?: boolean;
    showModal: boolean;
    menuRef: React.RefObject<HTMLDivElement | null>;
    onCellClick: (row: number, col: number) => void;
    onMenuAction: (action: 'select' | 'red' | 'green' | 'blue' | 'yellow', row: number, col: number) => void;
    onCloseModal: () => void;
}

const exampleGrid = [
    ['!', '', '?', '', '!'],
    ['', '?', '!', '', '?'],
    ['?', '', '', '!', '?'],
    ['!', '?', '', '', '!'],
    ['?', '!', '', '?', ''],
];

const QuestionBoxRound4: React.FC<QuestionComponentProps> = ({
    initialGrid = exampleGrid,
    questions = [],
    isSpectator = false,
    isHost = false,
}) => {
    const [searchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    
    // Redux state
    const {
        currentQuestion,
        round4Grid,
        players,
        currentTurn,
        loading
    } = useAppSelector((state) => state.game as GameState);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || "";
    
    // Local state
    const [grid, setGrid] = useState<string[][]>(initialGrid);
    const [gridColors, setGridColors] = useState<string[][]>(
        Array(5).fill(null).map(() => Array(5).fill(''))
    );
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [menu, setMenu] = useState<{ visible: boolean; rowIndex?: number; colIndex?: number }>({
        visible: false
    });
    const [showModal, setShowModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [buzzing, setBuzzing] = useState(false);
    const [starPositions, setStarPositions] = useState<{ row: number; col: number }[]>([]);
    const [answerList, setAnswerList] = useState<any[]>([]);
    
    // Refs
    const menuRef = useRef<HTMLDivElement>(null);
    
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
            // Note: Round4Grid type expects Round4Cell[][], but we're using simple string[][]
            // This is a simplified version for the migration
        } else if (round4Grid && round4Grid.cells) {
            // Convert Round4Cell[][] to string[][] for display
            const simpleGrid = round4Grid.cells.map(row =>
                row.map(cell => typeof cell === 'string' ? cell : (cell as any).symbol || '!')
            );
            setGrid(simpleGrid);
        }
    }, [initialGrid, round4Grid, dispatch]);

    // Listen to current question changes
    useEffect(() => {
        if (!roomId) return;

        return listenToCurrentQuestion((question) => {
            if (question) {
                setTimeLeft(30);
                setAnswerList([]);
            }
        });
    }, [roomId, listenToCurrentQuestion]);

    // Listen to player answers
    useEffect(() => {
        if (!roomId) return;

        return listenToPlayerAnswers((answersData) => {
            if (answersData) {
                setAnswerList(Object.values(answersData));
            }
        });
    }, [roomId, listenToPlayerAnswers]);

    // Listen to game state for Round 4 specific data
    useEffect(() => {
        if (!roomId) return;

        return listenToGameState((gameState) => {
            if (gameState) {
                // Handle time updates
                if (gameState.timeLeft !== undefined) {
                    setTimeLeft(gameState.timeLeft);
                }

                // Handle buzzing state
                if (gameState.buzzing !== undefined) {
                    setBuzzing(gameState.buzzing);
                }

                // Handle selected cell
                if (gameState.selectedCell) {
                    setSelectedCell(gameState.selectedCell);
                    setShowModal(true);
                }

                // Handle cell colors
                if (gameState.cellColors) {
                    setGridColors(gameState.cellColors);
                }

                // Handle star positions
                if (gameState.starPositions) {
                    setStarPositions(gameState.starPositions);
                }
            }
        });
    }, [roomId, listenToGameState]);

    // Timer countdown
    useEffect(() => {
        if (!currentQuestion || timeLeft <= 0) return;
        
        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [currentQuestion, timeLeft]);

    // Handle cell click
    const handleCellClick = async (row: number, col: number) => {
        if (!isHost || grid[row][col] === '') return;

        try {
            await sendSelectedCell(roomId, row.toString(), col.toString());
            setSelectedCell({ row, col });
            setShowModal(true);
        } catch (error) {
            console.error('Failed to select cell:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Selection Failed',
                message: 'Failed to select cell. Please try again.'
            }));
        }
    };

    // Handle menu action
    const handleMenuAction = async (action: 'select' | 'red' | 'green' | 'blue' | 'yellow', row: number, col: number) => {
        if (!isHost) return;

        try {
            if (action === 'select') {
                await sendSelectedCell(roomId, row.toString(), col.toString());
            } else {
                await sendCellColor(roomId, row.toString(), col.toString(), action);
                setGridColors(prev => {
                    const newColors = [...prev];
                    newColors[row][col] = action;
                    return newColors;
                });
            }
            setMenu({ visible: false });
        } catch (error) {
            console.error('Failed to perform menu action:', error);
            dispatch(addToast({
                type: 'error',
                title: 'Action Failed',
                message: 'Failed to perform action. Please try again.'
            }));
        }
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCell(null);
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

    // Handle reset buzz
    const handleResetBuzz = async () => {
        if (!isHost) return;
        
        try {
            await resetBuzz(roomId);
            setBuzzing(false);
        } catch (error) {
            console.error('Failed to reset buzz:', error);
        }
    };

    // Loading state
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Round 4...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Round Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Round 4: Tăng Tốc</h1>
                <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                    <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                        {timeLeft}s remaining
                    </span>
                    {buzzing && (
                        <span className="text-red-500 font-bold animate-pulse">BUZZING!</span>
                    )}
                </div>
            </div>

            {/* Game Grid */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <GameGrid
                    initialGrid={grid}
                    gridColors={gridColors}
                    menu={menu}
                    isSpectator={isSpectator}
                    isHost={isHost}
                    showModal={showModal}
                    menuRef={menuRef}
                    onCellClick={handleCellClick}
                    onMenuAction={handleMenuAction}
                    onCloseModal={handleCloseModal}
                    buzzedPlayer={players.find(p => p.stt === currentTurn.toString())?.userName || ""}
                    staredPlayer=""
                />
            </div>

            {/* Question Display */}
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
                    
                    {isHost && currentQuestion.answer && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <span className="text-green-700 font-semibold">
                                Answer: {currentQuestion.answer}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Player Input */}
            {!isSpectator && !isHost && currentQuestion && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Answer</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter your answer..."
                            disabled={timeLeft <= 0 || buzzing}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                            disabled={timeLeft <= 0 || buzzing}
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
                            onClick={handleResetBuzz}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Reset Buzz
                        </button>
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

export default QuestionBoxRound4;
