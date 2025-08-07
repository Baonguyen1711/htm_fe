import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import GameGridRound4 from './GameGridRound4';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { useFirebaseListener } from '../../shared/hooks';
import { generateRandomGrid, getDifficultyRanges } from '../../shared/utils/round4.utils';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setSelectedDifficulty, setDifficultyRanges } from '../../app/store/slices/gameSlice';
import { useConfirmModal } from '../../shared/hooks/ui/useConfirmModal';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal/Modal';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';

interface QuestionComponentProps {
    initialGrid: string[][]; // 5x5 grid (can be passed from parent or generated)
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
    isSpectator,
    isHost = false,
}) => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "4"
    //api
    const { sendGrid, sendSelectedCell, sendSelectedCellColor, resetBuzz } = useGameApi()

    //firebase listener
    const { listenToTimeStart, listenToRound4Grid } = useFirebaseListener()


    const dispatch = useAppDispatch()
    //global state
    const { round4LevelNumber, currentQuestion, currentCorrectAnswer } = useAppSelector((state) => state.game);

    // Confirmation modal hook
    const { modalState, showConfirmModal, closeModal } = useConfirmModal();

        useEffect(() => {
        const unsubscribeGrid = listenToRound4Grid((grid) => {
            console.log("grid in question box round 4", grid);
            if (!grid  || grid.length !== 5 )  {
                setGrid(initialGrid)
            } else {
                setGrid(grid);
            }
        })
        return () => {
            unsubscribeGrid();
        };
    }, [])

    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                const audio = sounds['timer_4'];
                if (audio) {
                    audio.play();
                }
                startTimer(15)
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    useEffect(() => {
        const levelConfig = JSON.parse(localStorage.getItem(`scoreRules_${roomId}`) || "").round4Levels || { easy: true, medium: true, hard: true }
        const difficultyRanges = getDifficultyRanges(levelConfig)
        console.log("difficultyRanges", difficultyRanges);
        console.log("round4LevelNumber", round4LevelNumber);
        dispatch(setDifficultyRanges(difficultyRanges))
    }, [])

    const handleSuffleGrid = () => {
        console.log("start generating grid");
        console.log("roomRules:", roomRules);

        // Get level config from room rules
        const levelConfig = JSON.parse(localStorage.getItem(`scoreRules_${roomId}`) || "").round4Levels || { easy: true, medium: true, hard: true };
        console.log("levelConfig:", levelConfig);

        const newGrid = generateRandomGrid(levelConfig)
        console.log("newGrid", newGrid);

        setGrid(newGrid)
    }

    const handleConfirmGrid = () => {
        showConfirmModal({
            text: 'Bạn có chắc chắn muốn xác nhận bảng cho vòng 4? Bảng sẽ được gửi đến tất cả người chơi và không thể thay đổi.',
            onConfirm: async () => {
                await sendGrid(grid, roomId);
                toast.success('Đã xác nhận bảng cho vòng 4!');
            },
            confirmText: 'Xác nhận bảng',
            confirmVariant: 'primary'
        });
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
    const [roomRules, setRoomRules] = useState<any>(null);

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
    const handleMenuAction = async (action: 'select' | 'red' | 'green' | 'blue' | 'yellow', row: number, col: number) => {
        if (action === 'select') {

            if (grid[row][col] == "") {
                dispatch(setSelectedDifficulty("Dễ"))
            }

            if (grid[row][col] == "!") {

                dispatch(setSelectedDifficulty("Trung bình"))

            }
            if (grid[row][col] == "?") {
                dispatch(setSelectedDifficulty("Khó"))
            }

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

            setSelectedCell({ row, col });

            await sendSelectedCell(roomId, row.toString(), col.toString())
        } else {
            await sendSelectedCellColor(roomId, row.toString(), col.toString(), action)
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


            <div className="flex gap-2 mt-4 w-full">
                <Button
                    onClick={() => {
                        handleSuffleGrid()
                    }}
                    variant="primary"
                    size="md"
                    className="flex-1 whitespace-nowrap"
                >
                    Xáo trộn bảng
                </Button>

                <Button
                    onClick={() => {
                        handleConfirmGrid()
                    }}
                    variant="primary"
                    size="md"
                    className="flex-1 whitespace-nowrap"
                >
                    Xác nhận bảng
                </Button>
            </div>

            {/* Confirmation Modal */}
            {modalState.isOpen && (
                <Modal
                    text={modalState.text}
                    buttons={modalState.buttons}
                    onClose={closeModal}
                />
            )}

        </div>
    );
};

export default HostQuestionBoxRound4;