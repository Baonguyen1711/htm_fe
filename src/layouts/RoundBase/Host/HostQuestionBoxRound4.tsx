import React, { useState, useEffect, useRef } from 'react';
import Play from '../../Play';
import { RoundBase } from '../../../type';
import { sendSelectedCell, sendCellColor } from '../../../components/services';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';
import { useHost } from '../../../context/hostContext';
import { deletePath, listenToTimeStart, listenToSound, listenToQuestions, listenToSelectedCell, listenToCellColor, listenToAnswers, listenToBuzzing, listenToStar, listenToRules } from '../../../services/firebaseServices';
import { useTimeStart } from '../../../context/timeListenerContext';
import { resetBuzz } from '../../../components/services';
import { useSounds } from '../../../context/soundContext';
import { useGameListeners } from '../../../hooks/useListener';
import GameGrid from '../../../components/ui/GameGrid';
interface QuestionComponentProps {
    initialGrid: string[][]; // 5x5 grid (can be passed from parent or generated)
    questions: string[]; // Array of questions for testing
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

// Example questions for testing
const exampleQuestions = [
    'Question 1', 'Question 2', 'Question 3', 'Question 4', 'Question 5',
    'Question 6', 'Question 7', 'Question 8', 'Question 9', 'Question 10',
    'Question 11', 'Question 12', 'Question 13', 'Question 14', 'Question 15',
    'Question 16', 'Question 17', 'Question 18', 'Question 19', 'Question 20',
    'Question 21', 'Question 22', 'Question 23', 'Question 24', 'Question 25',
];

const HostQuestionBoxRound4: React.FC<QuestionComponentProps> = ({
    initialGrid,
    questions,
    isSpectator,
    isHost = false,
}) => {
    function generateRandomGrid(levelConfig?: { easy: boolean; medium: boolean; hard: boolean }): ("" | "!" | "?")[][] {
        const size = 5;
        const totalCells = size * size; // 25

        // Default to all levels if no config provided
        const config = levelConfig || { easy: true, medium: true, hard: true };

        // Determine which symbols to use based on configuration - ONLY include selected levels
        const workingSymbols: ("" | "!" | "?")[] = [];
        if (config.easy) workingSymbols.push("");
        if (config.medium) workingSymbols.push("!");
        if (config.hard) workingSymbols.push("?");

        // If no levels selected, default to all
        if (workingSymbols.length === 0) {
            workingSymbols.push("", "!", "?");
        }

        console.log("Working symbols:", workingSymbols);

        // Distribute cells evenly among working symbols
        const cellsPerSymbol = Math.floor(totalCells / workingSymbols.length);
        const remainder = totalCells % workingSymbols.length;

        let symbolArray: ("" | "!" | "?")[] = [];
        for (let i = 0; i < workingSymbols.length; i++) {
            const count = cellsPerSymbol + (i < remainder ? 1 : 0);
            console.log(`Symbol ${workingSymbols[i]}: ${count} cells`);
            for (let j = 0; j < count; j++) {
                symbolArray.push(workingSymbols[i]);
            }
        }

        console.log("Symbol array:", symbolArray);

        // Shuffle array
        for (let i = symbolArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [symbolArray[i], symbolArray[j]] = [symbolArray[j], symbolArray[i]];
        }

        // Create 5x5 grid, replace undefined/null with ""
        let grid: ("" | "!" | "?")[][] = [];
        let index = 0;
        for (let i = 0; i < size; i++) {
            let row: ("" | "!" | "?")[] = [];
            for (let j = 0; j < size; j++) {
                const value = index < symbolArray.length ? symbolArray[index++] : "";
                row.push(value);
            }
            grid.push(row);
        }

        // Ensure each row has at least one question (non-empty cell) if we have empty cells
        const shouldIncludeEmpty = workingSymbols.includes("");
        if (shouldIncludeEmpty) {
            for (let i = 0; i < size; i++) {
                const hasNonEmpty = grid[i].some(cell => cell === "!" || cell === "?");
                if (!hasNonEmpty) {
                    // Find a row with multiple "!" or "?" to swap
                    let donorRow = -1;
                    let donorCol = -1;
                    for (let r = 0; r < size; r++) {
                        if (r === i) continue;
                        const nonEmptyCount = grid[r].filter(cell => cell === "!" || cell === "?").length;
                        if (nonEmptyCount > 1) {
                            for (let c = 0; c < size; c++) {
                                if (grid[r][c] === "!" || grid[r][c] === "?") {
                                    donorRow = r;
                                    donorCol = c;
                                    break;
                                }
                            }
                            if (donorRow !== -1) break;
                        }
                    }

                    if (donorRow !== -1) {
                        // Swap with an empty cell in the target row
                        for (let c = 0; c < size; c++) {
                            if (grid[i][c] === "") {
                                [grid[i][c], grid[donorRow][donorCol]] = [grid[donorRow][donorCol], grid[i][c]];
                                break;
                            }
                        }
                    } else {
                        // Place "!" in an empty cell and adjust elsewhere
                        for (let c = 0; c < size; c++) {
                            if (grid[i][c] === "") {
                                grid[i][c] = "!";
                                // Replace a "!" elsewhere with ""
                                for (let r = 0; r < size; r++) {
                                    if (r === i) continue;
                                    for (let c2 = 0; c2 < size; c2++) {
                                        if (grid[r][c2] === "!") {
                                            grid[r][c2] = "";
                                            break;
                                        }
                                    }
                                    if (grid[r].some(cell => cell === "")) break;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Only apply 8-8-9 rule if we have all three symbol types (including empty)
        if (shouldIncludeEmpty && workingSymbols.length === 3) {
            // Verify counts (8, 8, 9)
            const finalCounts: Record<"" | "!" | "?", number> = { "": 0, "!": 0, "?": 0 };
            for (const row of grid) {
                for (const cell of row) {
                    finalCounts[cell]++;
                }
            }
            const countValues = Object.values(finalCounts).sort((a, b) => a - b);
            if (countValues[0] !== 8 || countValues[1] !== 8 || countValues[2] !== 9) {
                // Adjust counts by swapping to achieve 8, 8, 9
                let targetCounts: Record<"" | "!" | "?", number> = { "": 8, "!": 8, "?": 9 };
                // Randomly assign 8, 8, 9 to symbols
                const tempCounts = [8, 8, 9];
                const tempSymbols = [...workingSymbols];
                for (let i = tempCounts.length - 1; i >= 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    targetCounts[tempSymbols[j]] = tempCounts[i];
                    tempSymbols.splice(j, 1);
                }

                // Adjust grid to match target counts
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        if (finalCounts[grid[i][j]] > targetCounts[grid[i][j]]) {
                            // Find a cell to swap with a symbol that needs more
                            for (const sym of workingSymbols) {
                                if (finalCounts[sym] < targetCounts[sym]) {
                                    grid[i][j] = sym;
                                    finalCounts[grid[i][j]]--;
                                    finalCounts[sym]++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        return grid;
    }
    const handleSuffleGrid = () => {
        console.log("start generating grid");
        console.log("roomRules:", roomRules);

        // Get level config from room rules
        const levelConfig = roomRules?.round4Levels || { easy: true, medium: true, hard: true };
        console.log("levelConfig:", levelConfig);

        const newGrid = generateRandomGrid(levelConfig)
        console.log("newGrid", newGrid);

        setGrid(newGrid)
        setInitialGrid(newGrid)
    }

    const colorMap: Record<string, string> = {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    };

    const [grid, setGrid] = useState<string[][]>([[]])
    const sounds = useSounds();
    const { startTimer, timeLeft, setTimeLeft } = useTimeStart();
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string>("")
    const [correctAnswer, setCorrectAnswer] = useState<string>("")
    const [gridColors, setGridColors] = useState<string[][]>(
        Array(5).fill(null).map(() => Array(5).fill('#FFFFFF')) // Default grid colors are white
    );
    const [menu, setMenu] = useState<{
        visible: boolean;
        rowIndex?: number;
        colIndex?: number;
    }>({ visible: false });
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "4"
    const { setEasyQuestionNumber, setMediumQuestionNumber, setHardQuestionNumber, setLevel, animationKey, setAnimationKey, setInitialGrid } = usePlayer()
    const { currentAnswer, handleNextQuestion } = useHost()
    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [staredPlayer, setStaredPlayer] = useState<string>("");
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [roomRules, setRoomRules] = useState<any>(null);
    const isInitialTimerMount = useRef(false)
    useGameListeners({
        roomId,
        setBuzzedPlayer,
        setStaredPlayer,
        setShowModal,
        setCorrectAnswer,
        setCurrentQuestion,
        setGridColors,
        setGrid,
        setSelectedCell,
        sounds,
        round: "4",
        startTimer
    }
    )

    useEffect(() => {
        if (initialGrid) {
            setGrid(initialGrid)
            setInitialGrid(initialGrid)
        }
    }, [])

    // Listen to room rules to get round4Levels configuration
    useEffect(() => {
        const unsubscribe = listenToRules(roomId, (rules) => {
            console.log("Received room rules:", rules);
            setRoomRules(rules);
        });

        return () => unsubscribe();
    }, [roomId]);
    useEffect(() => {
        console.log("timeLeft", timeLeft);
        if (isInitialTimerMount.current) {
            isInitialTimerMount.current = false;
            return;
        }
        if (timeLeft === 0) {
            setAnimationKey((prev: number) => prev + 1);
        }
    }, [timeLeft]);

    // Watch for changes in currentAnswer from host context
    useEffect(() => {
        if (isHost && currentAnswer) {
            setCorrectAnswer(currentAnswer)
            console.log("Host answer updated in Round 4:", currentAnswer)
        }
    }, [currentAnswer, isHost]);

    // const isInitialMount = useRef(false)
    // useEffect(() => {
    //     const unsubscribe = listenToTimeStart(roomId, async () => {


    //         // Skip the timer setting on the first mount, but allow future calls to run
    //         if (isInitialMount.current) {
    //             isInitialMount.current = false;
    //             return;
    //         }
    //         startTimer(15)
    //         return () => {
    //             unsubscribe();

    //         };
    //     })

    // }, [])

    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        setBuzzedPlayer("");

        if (isHost) {
            resetBuzz(roomId)
        }
    };
    // Function to handle cell click (only for host)
    const handleCellClick = (row: number, col: number) => {
        if (!isHost) return; // Prevent non-host users from interacting
        setMenu({
            visible: true,
            rowIndex: row,
            colIndex: col,
        });
    };

    // Function to handle menu actions
    const handleMenuAction = (action: 'select' | 'red' | 'green' | 'blue' | 'yellow', row: number, col: number) => {
        if (action === 'select') {
            // Determine difficulty based on grid symbol
            let selectedDifficulty = "Dễ"; // default
            if (initialGrid[row][col] == "") {
                selectedDifficulty = "Dễ";
                setLevel("Dễ")
            }
            if (initialGrid[row][col] == "!") {
                selectedDifficulty = "Trung bình";
                setLevel("Trung bình")
            }
            if (initialGrid[row][col] == "?") {
                selectedDifficulty = "Khó";
                setLevel("Khó")
            }

            sendSelectedCell(roomId, col.toString(), row.toString())
            const questionIndex = row * 5 + col; // Calculate question index from grid position

            // Immediately trigger API call with the correct difficulty
            const questionNumber = (questionIndex + 1).toString();
            console.log(`Triggering API call with difficulty: ${selectedDifficulty}, question: ${questionNumber}`);
            handleNextQuestion(undefined, selectedDifficulty, questionNumber);

            if (questions[questionIndex]) {
                setSelectedQuestion(questions[questionIndex]);
                setGridColors((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    // Reset the previously selected cell to white, if it exists and wasn't colored otherwise
                    if (selectedCell) {
                        const { row: prevRow, col: prevCol } = selectedCell;
                        // Only reset if the cell is still light yellow (i.e., not changed by color buttons)
                        if (newGrid[prevRow][prevCol] === '#FFFF99') {
                            newGrid[prevRow][prevCol] = '#FFFFFF';
                        }
                    }
                    // Set the current cell to light yellow
                    newGrid[row][col] = '#FFFF99'; // Light yellow
                    return newGrid;
                });
                // Update the selected cell
                setSelectedCell({ row, col });
            }
        } else {
            sendCellColor(roomId, col.toString(), row.toString(), action)
            // Set the cell color based on the selected action

            setGridColors((prev) => {
                const newGrid = prev.map((rowArray) => [...rowArray]);
                newGrid[row][col] = colorMap[action];
                return newGrid;
            });

            setGrid((prev) => {
                const newGrid = prev.map((rowArray) => [...rowArray]);
                newGrid[row][col] = "";
                return newGrid;
            });
            // If the cell was previously selected, clear the selection
            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                setSelectedCell(null);
            }
        }
        setMenu({ visible: false }); // Close the menu
    };
    const lastBuzzedPlayerRef = useRef<string | null>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenu({ visible: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full max-w-3xl mx-auto min-h-[470px]">
            {/* Display selected question */}
            <h2 className="text-2xl font-bold text-cyan-200 mb-2 text-center drop-shadow">
                {currentQuestion || ""}
            </h2>
            {correctAnswer && (
                <h2 className="text-xl font-semibold text-green-300 mb-4 text-center drop-shadow">
                    {correctAnswer}
                </h2>
            )}

            <GameGrid
                initialGrid={grid}
                gridColors={gridColors}
                menu={menu}
                isHost={true}
                isSpectator={isSpectator}
                showModal={showModal}
                buzzedPlayer={buzzedPlayer}
                staredPlayer={staredPlayer}
                menuRef={menuRef}
                onCellClick={handleCellClick}
                onMenuAction={handleMenuAction}
                onCloseModal={handleCloseModal}
            />


            <div className="flex gap-2 mt-4 w-full">
                <button
                    onClick={() => {
                        handleSuffleGrid()
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
                >
                    Xáo trộn hàng ngang
                </button>
            </div>

        </div>
    );
};

export default HostQuestionBoxRound4;