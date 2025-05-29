import React, { useState, useEffect, useRef } from 'react';
import Play from '../Play';
import { RoundBase } from '../../type';
import { sendSelectedCell, sendCellColor } from '../../components/services';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../context/playerContext';
import { deletePath, listenToSound, listenToQuestions, listenToSelectedCell, listenToCellColor, listenToAnswers, listenToBuzzing } from '../../services/firebaseServices';

import { resetBuzz } from '../../components/services';
import { useSounds } from '../../context/soundContext';
interface QuestionComponentProps {
    initialGrid: string[][]; // 5x5 grid (can be passed from parent or generated)
    questions: string[]; // Array of questions for testing
    isSpectator?: boolean; // Indicates whether the user is a spectator
    isHost?: boolean; // Indicates whether the user is the host
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

const QuestionBoxRound4: React.FC<QuestionComponentProps> = ({
    initialGrid,
    questions,
    isSpectator ,
    isHost = false,
}) => {
    const colorMap: Record<string, string> = {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    };
    const sounds = useSounds();
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
    const { setEasyQuestionNumber, setMediumQuestionNumber, setHardQuestionNumber, setLevel } = usePlayer()
    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [showModal, setShowModal] = useState(false); // State for modal visibility
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
            if (initialGrid[row][col] == "") {

                setLevel("Dễ")
            }

            if (initialGrid[row][col] == "!") {

                setLevel("Trung bình")
            }

            if (initialGrid[row][col] == "?") {

                setLevel("Khó")
            }

            sendSelectedCell(roomId, col.toString(), row.toString())
            const questionIndex = row * 5 + col; // Calculate question index from grid position
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
            // If the cell was previously selected, clear the selection
            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                setSelectedCell(null);
            }
        }
        setMenu({ visible: false }); // Close the menu
    };
    const lastBuzzedPlayerRef = useRef<string | null>(null);
    useEffect(() => {

        let hasMounted = false;
        const unsubscribeBuzzing = listenToBuzzing(roomId, (playerName) => {
            // if (!hasMounted) {
            //     hasMounted = true; // skip initial
            //     return;
            // }
            const audio = sounds['buzz'];
            if (audio) {
                audio.play();
            }
            console.log("playerName on host", playerName);

            console.log("listening on buzzing");

            if (playerName && playerName !== "") {
                setBuzzedPlayer(playerName);
                console.log("playerName", typeof playerName);

                console.log(playerName, "đã bấm chuông")
                setShowModal(true); // Show modal when a player buzzes
            }
        });

        return () => {
            unsubscribeBuzzing();
        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribePlayers = listenToSound(roomId, async (type) => {

            const audio = sounds[`${type}`];
            if (audio) {
                audio.play();
            }
            console.log("sound type", type)
            await deletePath(roomId, "sound")
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToAnswers(roomId, (answer) => {
            const audio = sounds['correct'];
            if (audio) {
                audio.play();
            }
            setCorrectAnswer(`Đáp án: ${answer}`)
            const timeOut = setTimeout(() => {
                setCorrectAnswer("")
            }, 4000)
            console.log("answer", answer)
            clearTimeout(timeOut)
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();

        };
    }, []);
    useEffect(() => {

        const unsubscribePlayers = listenToQuestions(roomId, (data) => {
            console.log("questions", data);

            setCurrentQuestion(data.question)
            setCorrectAnswer("")
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToSelectedCell(roomId, (data) => {
            console.log("Selected cell data:", data);
            // Ensure data has the expected properties
            if (data && typeof data.rowIndex === 'string' && typeof data.colIndex === 'string') {
                const row = parseInt(data.rowIndex, 10);
                const col = parseInt(data.colIndex, 10);

                // Check if indices are valid numbers and within 5x5 grid bounds
                if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5) {
                    setGridColors((prev) => {
                        const newGrid = prev.map((rowArray) => [...rowArray]);
                        // Reset all cells with light yellow (#FFFF99) to white (#FFFFFF)
                        for (let prevRow = 0; prevRow < 5; prevRow++) {
                            for (let prevCol = 0; prevCol < 5; prevCol++) {
                                if (newGrid[prevRow][prevCol] === '#FFFF99') {
                                    newGrid[prevRow][prevCol] = '#FFFFFF';
                                }
                            }
                        }
                        // Set the current cell to light yellow
                        newGrid[row][col] = '#FFFF99';
                        return newGrid;
                    });
                    // Update the selected cell
                    setSelectedCell({ row, col });
                } else {
                    console.warn(`Invalid cell indices: row=${row}, col=${col}`);
                }
            } else {
                console.warn("Invalid or missing data from listenToSelectedCell:", data);
            }
        })

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToCellColor(roomId, (data) => {
            console.log("questions", data);
            const row = parseInt(data.rowIndex)
            const col = parseInt(data.colIndex)
            const color = data.color

            if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5 && color) {
                setGridColors((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = colorMap[color];
                    return newGrid;
                });
            }
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

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
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full max-w-3xl mx-auto">
            {/* Display selected question */}
            <h2 className="text-2xl font-bold text-cyan-200 mb-2 text-center drop-shadow">
                {currentQuestion || ""}
            </h2>
            {correctAnswer && (
                <h2 className="text-xl font-semibold text-green-300 mb-4 text-center drop-shadow">
                    {correctAnswer}
                </h2>
            )}

            {/* Column labels (1, 2, 3, 4, 5) */}
            <div className="grid grid-cols-6 mb-2 w-fit">
                <div className="w-14 h-14"></div>
                {['1', '2', '3', '4', '5'].map((label) => (
                    <div
                        key={label}
                        className="flex items-center justify-center font-bold text-cyan-100 rounded-lg w-14 h-14 shadow"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Render 5x5 grid with row labels (A, B, C, D, E) */}
            <div className="grid grid-rows-5 gap-2">
                {['A', 'B', 'C', 'D', 'E'].map((rowLabel, rowIndex) => (
                    <div key={rowIndex} className="flex">
                        <div className="flex items-center justify-center font-bold text-cyan-100 rounded-lg w-14 h-14 shadow">
                            {rowLabel}
                        </div>
                        {initialGrid[rowIndex].map((cell, colIndex) => {
                            const showMenu =
                                menu.visible &&
                                menu.rowIndex === rowIndex &&
                                menu.colIndex === colIndex;

                            return (
                                <div className="relative flex items-center" key={`${rowIndex}-${colIndex}`}>
                                    <div
                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                        className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 transition-all duration-150 ${isHost
                                            ? 'cursor-pointer hover:scale-105 hover:border-blue-400'
                                            : 'cursor-not-allowed'
                                            }`}
                                        style={{
                                            backgroundColor: gridColors[rowIndex][colIndex],
                                            borderColor: showMenu ? '#38bdf8' : '#334155',
                                        }}
                                    >
                                        <span className="text-black text-lg font-semibold">{cell}</span>
                                    </div>

                                    {showMenu && (
                                        <div
                                            ref={menuRef}
                                            className="absolute left-20 top-1/2 transform -translate-y-1/2 flex space-x-2 bg-white border border-gray-300 rounded shadow-lg p-1 z-10"
                                        >
                                            <button
                                                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                                onClick={() =>
                                                    handleMenuAction('select', rowIndex, colIndex)
                                                }
                                            >
                                                SELECT
                                            </button>
                                            <button
                                                className="w-6 h-6 bg-red-500 rounded"
                                                onClick={() =>
                                                    handleMenuAction('red', rowIndex, colIndex)
                                                }
                                            />
                                            <button
                                                className="w-6 h-6 bg-green-500 rounded"
                                                onClick={() =>
                                                    handleMenuAction('green', rowIndex, colIndex)
                                                }
                                            />
                                            <button
                                                className="w-6 h-6 bg-blue-500 rounded"
                                                onClick={() =>
                                                    handleMenuAction('blue', rowIndex, colIndex)
                                                }
                                            />
                                            <button
                                                className="w-6 h-6 bg-yellow-500 rounded"
                                                onClick={() =>
                                                    handleMenuAction('yellow', rowIndex, colIndex)
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && buzzedPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            {`${buzzedPlayer} đã nhấn chuông trả lời`}
                        </h2>
                        <div className="flex justify-center">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBoxRound4;