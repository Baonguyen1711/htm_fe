import React, { useEffect, useState } from 'react';
import { useFirebaseListener } from '../../shared/hooks';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import { Button } from '../../shared/components/ui';

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
    onMenuAction: (action: 'select' | 'red' | 'green' | 'blue' | 'yellow', row: number, col: number) => void;
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
    const [grid, setGrid] = useState<string[][]>([[]])
    const { listenToTimeStart, listenToSound, listenToRound4Grid, deletePath } = useFirebaseListener()
    const { startTimer } = useTimeStart();
    const sounds = useSounds();
    // Validate grid dimensions
    
    


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




    if (
        !initialGrid ||
        initialGrid.length !== 5 ||
        initialGrid.some((row) => row.length !== 5) ||
        !gridColors ||
        gridColors.length !== 5 ||
        gridColors.some((row) => row.length !== 5)

    ) {
        console.error("Invalid grid data:", grid, gridColors);
        return <div className="text-red-500 text-center">Invalid grid data</div>;
    }
    return (
        <>
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
                            const showMenu = menu.visible && menu.rowIndex === rowIndex && menu.colIndex === colIndex;

                            return (
                                <div className="relative flex items-center" key={`${rowIndex}-${colIndex}`}>
                                    <div
                                        onClick={() => isHost && !isSpectator && onCellClick(rowIndex, colIndex)}
                                        className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 transition-all duration-150 ${isHost && !isSpectator
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

                                    {showMenu && isHost && !isSpectator && menuRef && (
                                        <div
                                            ref={menuRef}
                                            className="absolute left-20 top-1/2 transform -translate-y-1/2 flex space-x-2 bg-white border border-gray-300 rounded shadow-lg p-1 z-10"
                                        >
                                            <Button
                                                onClick={() => onMenuAction('select', rowIndex, colIndex)}
                                                variant="primary"
                                                size="xs"
                                            >
                                                SELECT
                                            </Button>
                                            <button
                                                className="w-6 h-6 bg-red-500 rounded"
                                                onClick={() => onMenuAction('red', rowIndex, colIndex)}
                                            />
                                            <button
                                                className="w-6 h-6 bg-green-500 rounded"
                                                onClick={() => onMenuAction('green', rowIndex, colIndex)}
                                            />
                                            <button
                                                className="w-6 h-6 bg-blue-500 rounded"
                                                onClick={() => onMenuAction('blue', rowIndex, colIndex)}
                                            />
                                            <button
                                                className="w-6 h-6 bg-yellow-500 rounded"
                                                onClick={() => onMenuAction('yellow', rowIndex, colIndex)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Modal for buzzed player */}
            {showModal && buzzedPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            {`${buzzedPlayer} đã nhấn chuông trả lời`}
                        </h2>
                        <div className="flex justify-center">
                            <Button
                                onClick={onCloseModal}
                                variant="primary"
                                size="md"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for starred player */}
            {showModal && staredPlayer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            {`${staredPlayer} đã nhấn chọn ngôi sao hy vọng`}
                        </h2>
                        <div className="flex justify-center">
                            <Button
                                onClick={onCloseModal}
                                variant="primary"
                                size="md"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GameGridRound4;