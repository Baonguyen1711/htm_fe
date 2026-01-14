import React, { useEffect } from 'react';
import { useFirebaseListener } from '../../shared/hooks';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import { Button } from '../../shared/components/ui';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { setCurrentTurn } from '../../app/store/slices/gameSlice';

interface GameGridProps {
    initialGrid: string[][];
    gridColors: string[][];
    menu: { visible: boolean; rowIndex?: number; colIndex?: number };
    isHost: boolean;
    isSpectator?: boolean;
    showModal: boolean;
    buzzedPlayer: string;
    staredPlayer: string;
    menuRef: React.RefObject<HTMLDivElement | null>;
    onCellClick: (row: number, col: number) => void;
    onMenuAction: (
        action: 'select' | 'red' | 'green' | 'blue' | 'yellow',
        row: number,
        col: number
    ) => void;
    onCloseModal: () => void;
}

const GameGridRound4: React.FC<GameGridProps> = ({
    initialGrid,
    gridColors,
    menu,
    isHost,
    isSpectator = false,
    showModal,
    buzzedPlayer,
    staredPlayer,
    onCellClick,
    onMenuAction,
    onCloseModal,
    menuRef
}) => {
    const { listenToTimeStart } = useFirebaseListener();
    const { startTimer } = useTimeStart();
    const sounds = useSounds();
    const {sendCurrentTurn} = useGameApi()
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "1"
    const dispatch = useAppDispatch()

    const gridSize = initialGrid?.length || 0;

    useEffect(() => {
        const unsubscribe = listenToTimeStart(() => {
            const audio = sounds['timer_4'];
            audio?.play();
            startTimer(15);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        
        return () => {
            const resetCurrentTurn = async () => {
                dispatch(setCurrentTurn(0))
                if(isHost) {
                    await sendCurrentTurn(roomId, 0);
                }
            }

            resetCurrentTurn()
        }
    },[])

    // ===== VALIDATION =====
    const isValidGrid =
        Array.isArray(initialGrid) &&
        initialGrid.length === gridSize &&
        initialGrid.every(
            row => Array.isArray(row) && row.length === gridSize
        );

    const isValidColors =
        Array.isArray(gridColors) &&
        gridColors.length === gridSize &&
        gridColors.every(
            row => Array.isArray(row) && row.length === gridSize
        );

    if (!isValidGrid || !isValidColors) {
        console.error('Invalid grid data:', {
            gridSize,
            initialGrid,
            gridColors,
        });
        return (
            <div className="text-red-500 text-center">
                Invalid grid data
            </div>
        );
    }

    const columnLabels = Array.from({ length: gridSize }, (_, i) => (i + 1).toString());
    const rowLabels = Array.from({ length: gridSize }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    return (
        <>
            {/* COLUMN LABELS */}
            <div
                className="grid mb-2 w-fit"
                style={{ gridTemplateColumns: `repeat(${gridSize + 1}, 3.5rem)` }}
            >
                <div />
                {columnLabels.map(label => (
                    <div
                        key={label}
                        className="flex items-center justify-center font-bold text-cyan-100 w-14 h-14"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* GRID */}
            <div className="flex flex-col gap-2">
                {rowLabels.map((rowLabel, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                        {/* ROW LABEL */}
                        <div className="flex items-center justify-center font-bold text-cyan-100 w-14 h-14">
                            {rowLabel}
                        </div>

                        {/* CELLS */}
                        {initialGrid[rowIndex].map((cell, colIndex) => {
                            const showMenu =
                                menu.visible &&
                                menu.rowIndex === rowIndex &&
                                menu.colIndex === colIndex;

                            return (
                                <div key={`${rowIndex}-${colIndex}`} className="relative">
                                    <div
                                        onClick={() =>
                                            isHost &&
                                            !isSpectator &&
                                            onCellClick(rowIndex, colIndex)
                                        }
                                        className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 transition
                                            ${isHost && !isSpectator
                                                ? 'cursor-pointer hover:scale-105'
                                                : 'cursor-not-allowed'
                                            }`}
                                        style={{
                                            backgroundColor: gridColors[rowIndex][colIndex],
                                            borderColor: showMenu ? '#38bdf8' : '#334155'
                                        }}
                                    >
                                        <span className="text-black text-lg font-semibold">
                                            {cell}
                                        </span>
                                    </div>

                                    {/* CONTEXT MENU */}
                                    {showMenu && isHost && !isSpectator && (
                                        <div
                                            ref={menuRef as React.RefObject<HTMLDivElement>}
                                            className="absolute left-16 top-1/2 -translate-y-1/2 flex gap-1 bg-white border rounded shadow-lg p-1 z-10"
                                        >
                                            <Button
                                                size="xs"
                                                onClick={() =>
                                                    onMenuAction('select', rowIndex, colIndex)
                                                }
                                            >
                                                SELECT
                                            </Button>
                                            {['red', 'green', 'blue', 'yellow'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`w-6 h-6 rounded bg-${color}-500`}
                                                    onClick={() =>
                                                        onMenuAction(
                                                            color as any,
                                                            rowIndex,
                                                            colIndex
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* MODALS */}
            {(showModal && (buzzedPlayer || staredPlayer)) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
                        <h2 className="font-semibold mb-4">
                            {buzzedPlayer
                                ? `${buzzedPlayer} đã nhấn chuông`
                                : `${staredPlayer} đã chọn ngôi sao`}
                        </h2>
                        <Button onClick={onCloseModal}>Đóng</Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GameGridRound4;
