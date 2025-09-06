import React, { useEffect, useRef, useState } from 'react'
import GameGridRound2 from './GameGridRound2';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import { useSearchParams } from 'react-router-dom';

import { useRound2 } from '../../shared/hooks/round/useRound2';
import { useFirebaseListener } from '../../shared/hooks';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { useAppDispatch, useAppSelector } from '../../app/store';

import { setBuzzedPlayer, setIsRound2GridConfirmed } from '../../app/store/slices/gameSlice';
import { useConfirmModal } from '../../shared/hooks/ui/useConfirmModal';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal/Modal';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';


interface ButtonConfig {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface ModalState {
    isOpen: boolean;
    text: string;
    buttons: ButtonConfig[];
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
};


interface ObstacleQuestionBoxProps {
    obstacleWord?: string;
    hintWordArray?: string[];
    isHost?: boolean;
    initialGrid?: string[][];
    isSpectator?: boolean;
}

const HostQuestionBoxRound2: React.FC<ObstacleQuestionBoxProps> = ({
    obstacleWord,
    hintWordArray,
    initialGrid,
    isSpectator = false,
    isHost = false,
}) => {
    
    // search params
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";

    //context
    const { startTimer} = useTimeStart();
    const sounds = useSounds();

    // Confirmation modal hook
    const { modalState: confirmModalState, showConfirmModal, closeModal } = useConfirmModal();
    
    //local state
    const [grid, setGrid] = useState<string[][]>([[]]);
    const [hintWords, setHintWords] = useState<WordObj[]>([]);
    const [cellStyles, setCellStyles] = useState<
        Record<string, { background: string; textColor: string }>
    >({}); // Tracks background and text styles
    const [menu, setMenu] = useState<{
        visible: boolean;
        rowIndex?: number;
        colIndex?: number;
    }>({ visible: false });
    const [markedCharacters, setMarkedCharacters] = useState<Record<string, number[]>>({});
    const [highlightedCharacters, setHighlightedCharacters] = useState<Record<string, number[]>>({});
    const [showModal, setShowModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    //global state
    const dispatch = useAppDispatch();
    const { round2Grid, currentQuestion, isRound2GridConfirmed } = useAppSelector(state => state.game);

    //firebase listener
    const { listenToTimeStart} = useFirebaseListener()

    //custom hook
    const { revealCells, generateInitialGrid } = useRound2({
        roomId,
        grid,
        isHost: true,
        hintWordArray,
        obstacleWord,

        setShowModal,
        setCellStyles,
        setMarkedCharacters,
        setHighlightedCharacters,
    })

    const { resetBuzz, sendGrid, openObstacle } = useGameApi()


    useEffect(() => {
        const generateGrid = async () => {
            await generateInitialGrid(hintWordArray)
        }

        generateGrid()
    }, [hintWordArray, obstacleWord, initialGrid])

    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                const audio = sounds['timer_2'];
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


    const handleSuffleGrid = async () => {
        await generateInitialGrid(hintWordArray)
    }

    const handleConfirmGrid = () => {
        if (!round2Grid?.blankGrid) return;

        showConfirmModal({
            text: 'Bạn có chắc chắn muốn xác nhận hàng ngang? Hành động này sẽ gửi hàng ngang cho tất cả người chơi.',
            onConfirm: async () => {
                if (round2Grid?.blankGrid) {
                    console.log("round2Grid?.blankGrid", round2Grid.blankGrid);
                    dispatch(setIsRound2GridConfirmed(true));
                    await sendGrid(round2Grid.blankGrid, roomId);
                    toast.success('Đã xác nhận hàng ngang !');
                }
            },
            confirmText: 'Xác nhận hàng ngang',
            confirmVariant: 'primary'
        });
    }

    const handleConfirmOpenObstacle = () => {
        if (!round2Grid?.blankGrid) return;

        showConfirmModal({
            text: 'Bạn có chắc chắn muốn mở CNV? Hành động này sẽ mở tất cả hàng ngang cho tất cả người chơi.',
            onConfirm: async () => {
                if (obstacleWord && round2Grid?.grid) {
                    console.log("round2Grid?.grid", round2Grid?.grid);
                    await openObstacle(roomId, round2Grid?.grid, obstacleWord);
                    toast.success('Đã mở chướng ngại vật !');
                }
            },
            confirmText: 'Xác nhận mở chướng ngại vật',
            confirmVariant: 'primary'
        });
    }

    // Handle number click to show menu
    const handleNumberClick = (rowIndex: number, colIndex: number) => {
        if (!isHost) return;
        setMenu({
            visible: true,
            rowIndex,
            colIndex,
        });
    };

    // Handle menu actions
    const handleMenuAction = (
        action: "open" | "correct" | "incorrect",
        rowIndex: number,
        colIndex: number,
        hintWordNumber: string
    ) => {
        console.log("handleMenuAction", action, rowIndex, colIndex, hintWordNumber);
        revealCells(rowIndex, colIndex, action, hintWordNumber);
        setMenu({ visible: false });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        dispatch(setBuzzedPlayer(""));
        resetBuzz(roomId)
    };


    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenu({ visible: false });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4 relative">
            <QuestionAndAnswer
                currentQuestion={currentQuestion}
            />
            
            <GameGridRound2
                grid={round2Grid?.grid}
                obstacleWord={obstacleWord}
                hintWords={hintWords}

                cellStyles={cellStyles}
                menu={menu}
                menuRef={menuRef as React.RefObject<HTMLDivElement>}
                isHost={true}
                isOpenAll={false}
                showModal={showModal}
                isSpectator={isSpectator}


                onNumberClick={handleNumberClick}
                onMenuAction={handleMenuAction}
                onOpenObstacle={handleConfirmOpenObstacle}
                onShuffleGrid={handleSuffleGrid}
                onConfirmGrid={handleConfirmGrid}

            />

            {/* Confirmation Modal */}
            {confirmModalState.isOpen && (
                <Modal
                    text={confirmModalState.text}
                    buttons={confirmModalState.buttons}
                    onClose={closeModal}
                />
            )}

        </div>
    )
}

export default HostQuestionBoxRound2