import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import GameGridRound4 from './GameGridRound4';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { useFirebaseListener } from '../../shared/hooks';
import { generateRandomGrid, getDifficultyRanges } from '../../shared/utils/round4.utils';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setSelectedDifficulty, setDifficultyRanges, setIsRound4GridConfirmed } from '../../app/store/slices/gameSlice';
import { useConfirmModal } from '../../shared/hooks/ui/useConfirmModal';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal/Modal';
import MediaModal from '../ui/Modal/MediaModal';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';
import QuestionTimerBar from '../ui/QuestionTimeBar';

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
    const baseBtn =
        "w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 \
   hover:bg-slate-700/60 hover:border-white/20 transition-all duration-200 \
   disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "4"
    //api
    const { sendGrid, sendSelectedCell, sendSelectedCellColor, resetBuzz, openBuzz, closeBuzz } = useGameApi()

    //firebase listener
    const { listenToTimeStart, listenToRound4Grid } = useFirebaseListener()


    const dispatch = useAppDispatch()
    //global state
    const { round4LevelNumber, currentQuestion, currentCorrectAnswer, isRound4GridConfirmed } = useAppSelector((state) => state.game);

    // Confirmation modal hook
    const { modalState, showConfirmModal, closeModal } = useConfirmModal();

    useEffect(() => {
        if (currentQuestion?.imgUrl) {
            setShowMediaModal(true);
        } else {
            setShowMediaModal(false);
        }
    }, [currentQuestion]);



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

        const newGrid = generateRandomGrid(gridSize, levelConfig)
        console.log("newGrid", newGrid);

        setGrid(newGrid)
    }

    const handleConfirmGrid = () => {
        showConfirmModal({
            text: 'Bạn có chắc chắn muốn xác nhận bảng cho vòng 4? Bảng sẽ được gửi đến tất cả người chơi và không thể thay đổi.',
            onConfirm: async () => {
                dispatch(setIsRound4GridConfirmed(true));
                await sendGrid(grid, roomId);
                toast.success('Đã xác nhận bảng cho vòng 4!');
            },
            confirmText: 'Xác nhận bảng',
            confirmVariant: 'primary'
        });
    }

    const hanldeOpenBuzz = async () => {
        let timeId: any
        try {
            await openBuzz(roomId)
            toast.success("đã mở bấm chuông!")

            timeId = setTimeout(async () => {
                await closeBuzz(roomId)
            }, 5000)
        } catch (e: any) {
            toast.error("lỗi khi mở bấm chuông")
        }

        return () => {
            clearTimeout(timeId)
        }
    }



    const colorMap: Record<string, string> = {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    };
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [gridSize, setGridSize] = useState<5 | 6 | 7>(5);
    const createEmptyGrid = (size: number) =>
        Array(size).fill(null).map(() => Array(size).fill(''));

    const createColorGrid = (size: number) =>
        Array(size).fill(null).map(() => Array(size).fill('#FFFFFF'));

    const [grid, setGrid] = useState<string[][]>(() => createEmptyGrid(gridSize));
    const [gridColors, setGridColors] = useState<string[][]>(() => createColorGrid(gridSize));

    const sounds = useSounds();
    const { startTimer, timeLeft, setTimeLeft } = useTimeStart();
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

    useEffect(() => {
        setGrid(createEmptyGrid(gridSize));
        setGridColors(createColorGrid(gridSize));
    }, [gridSize])

    useEffect(() => {
        const unsubscribeGrid = listenToRound4Grid((data) => {
            if (!data) return;

            setGrid(data.grid);

            // 🔥 sync gridColors theo size mới
            setGridColors(
                Array(data.grid.length)
                    .fill(null)
                    .map(() => Array(data.grid.length).fill('#FFFFFF'))
            );
        });

        return () => unsubscribeGrid();
    }, []);



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

            <QuestionTimerBar isHost={true} />
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


            <div className="mt-6 w-full space-y-4">

                {/* Grid size selector (Host only) */}
                {isHost && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300 mr-2">
                            Kích thước bảng:
                        </span>

                        <div className="flex rounded-xl overflow-hidden border border-white/10">
                            {[5, 6, 7].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setGridSize(size as 5 | 6 | 7)}
                                    className={`
              px-4 py-2 text-sm font-medium transition-all
              ${gridSize === size
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
                                        }
            `}
                                >
                                    {size}×{size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 w-full">
                    <button className={baseBtn} onClick={handleSuffleGrid}>
                        Xáo trộn bảng
                    </button>

                    <button className={baseBtn} onClick={handleConfirmGrid}>
                        Xác nhận bảng
                    </button>

                    <button className={baseBtn} onClick={hanldeOpenBuzz}>
                        Mở bấm chuông
                    </button>
                </div>

            </div>


            {showMediaModal && currentQuestion?.imgUrl && (
                <MediaModal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)}>
                    {renderMediaContent()}
                </MediaModal>
            )}

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