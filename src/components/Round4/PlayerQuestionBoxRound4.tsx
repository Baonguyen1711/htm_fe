import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import GameGrid from '../../components/ui/GameGrid';
import { gameApi } from '../../shared/services';
import useGameApi from '../../shared/hooks/api/useGameApi';
import MediaModal from '../ui/Modal/MediaModal';

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

const PlayerQuestionBoxRound4: React.FC<QuestionComponentProps> = ({
    initialGrid,
    isSpectator,
    isHost = false,
}) => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "4"

    //firebase listener
    const { listenToRound4Grid, listenToCellColor, listenToSelectedCell } = useFirebaseListener()
    //global state
    const { currentCorrectAnswer, currentQuestion } = useAppSelector((state) => state.game);

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
    const [showMediaModal, setShowMediaModal] = useState(false);

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
        if (currentQuestion?.imgUrl) {
            setShowMediaModal(true);
        } else {
            setShowMediaModal(false);
        }
    }, [currentQuestion]);

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
            if (!data) return;
            console.log("cell color data", data);
            const row = parseInt(data.rowIndex);
            const col = parseInt(data.colIndex);
            const color = data.color;

            if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5 && color) {
                // Update grid colors
                setGridColors((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = colorMap[color];
                    return newGrid;
                });

                // Clear the cell content in the grid (remove "?", "!", or "i")
                setGrid((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = ''; // Set cell content to empty string
                    return newGrid;
                });
            }
        });

        return () => {
            unsubscribeCellColor();
        };
    }, []); useEffect(() => {
        const unsubscribeCellColor = listenToCellColor((data) => {
            if (!data) return;
            console.log("cell color data", data);
            const row = parseInt(data.rowIndex);
            const col = parseInt(data.colIndex);
            const color = data.color;

            if (!isNaN(row) && !isNaN(col) && row >= 0 && row < 5 && col >= 0 && col < 5 && color) {
                // Update grid colors
                setGridColors((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = colorMap[color];
                    return newGrid;
                });

                // Clear the cell content in the grid (remove "?", "!", or "i")
                setGrid((prev) => {
                    const newGrid = prev.map((rowArray) => [...rowArray]);
                    newGrid[row][col] = ''; // Set cell content to empty string
                    return newGrid;
                });
            }
        });

        return () => {
            unsubscribeCellColor();
        };
    }, []);

    const renderMediaContent = () => {
        const url = currentQuestion?.imgUrl;
        if (!url) return <p className="text-white">No media</p>;

        const extension = url.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return <img src={url} alt="Question Visual" className="max-w-full max-h-[80vh] object-contain rounded-lg" />;
        }

        if (['mp3', 'wav', 'ogg'].includes(extension)) {
            return (
                <audio controls className="w-full">
                    <source src={url} type={`audio/${extension}`} />
                    Your browser does not support the audio element.
                </audio>
            );
        }

        if (['mp4', 'webm', 'ogg'].includes(extension)) {
            return (
                <video controls autoPlay className="max-w-full max-h-[80vh] object-contain rounded-lg">
                    <source src={url} type={`video/${extension}`} />
                    Your browser does not support the video tag.
                </video>
            );
        }

        return <p className="text-white">Unsupported media type</p>;
    };

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

            {showMediaModal && currentQuestion?.imgUrl && (
                <MediaModal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)}>
                    {renderMediaContent()}
                </MediaModal>
            )}

        </div>
    );
};

export default PlayerQuestionBoxRound4;