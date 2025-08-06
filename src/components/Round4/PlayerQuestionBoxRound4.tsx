import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import GameGrid from '../../components/ui/GameGrid';
import { gameApi } from '../../shared/services';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { useFirebaseListener } from '../../shared/hooks';
import { useAppSelector, useAppDispatch } from '../../app/store'
import GameGridRound4 from './GameGridRound4';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';

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

const PlayerQuestionBoxRound4: React.FC<QuestionComponentProps> = ({
    initialGrid,
    isSpectator,
    isHost = false,
}) => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "4"

    //firebase listener
    const { listenToRound4Grid, listenToTimeStart, listenToSound, deletePath, listenToCellColor, listenToSelectedCell } = useFirebaseListener()
    //global state
    const { round4Level, round4LevelNumber, currentCorrectAnswer, currentQuestion } = useAppSelector((state) => state.game);

    const colorMap: Record<string, string> = {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    };

    const [grid, setGrid] = useState<string[][]>([[]])
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

    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [staredPlayer, setStaredPlayer] = useState<string>("");
    const [showModal, setShowModal] = useState(false); // State for modal visibility

        useEffect(() => {
        const unsubscribeGrid = listenToRound4Grid((grid) => {
            console.log("grid in question box round 4", grid);
            if (grid) {
                setGrid(grid);
            } else {
                setGrid(initialGrid)
            }
        })
        return () => {
            unsubscribeGrid();
        };
    }, [])

    // useEffect(() => {
    //     const unsubscribeSound = listenToSound(
    //         () => {
    //             deletePath("sound")
    //         }
    //     );

    //     return () => {
    //         unsubscribeSound();
    //     };
    // }, []);





    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        setBuzzedPlayer("");
    };
    // Function to handle cell click (only for host)
    const handleCellClick = () => {

    };

    // Function to handle menu actions
    const handleMenuAction = async () => {

    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenu({ visible: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {

        const unsubscribeSelectedCells = listenToSelectedCell((data) => {
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
            unsubscribeSelectedCells();
        };
    }, []);

    useEffect(() => {

        const unsubscribeCellColor = listenToCellColor((data) => {
            if (!data) return
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
            unsubscribeCellColor();
        };
    }, []);

    return (
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full max-w-3xl mx-auto min-h-[470px]">
            {/* Display selected question */}
            <QuestionAndAnswer
                currentQuestion={currentQuestion}
                currentCorrectAnswer={currentCorrectAnswer}
            />

            <GameGridRound4
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

        </div>
    );
};

export default PlayerQuestionBoxRound4;