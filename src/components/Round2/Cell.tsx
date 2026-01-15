import React, { useLayoutEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
interface MenuState {
    visible: boolean;
    rowIndex?: number;
    colIndex?: number;
}

interface HintWord {
    x?: number;
    y?: number;
}

interface CellProps {
    cell: string | number;
    cellStyle: { background: string; textColor: string };
    hintWords: HintWord[];
    menu: MenuState;
    menuRef: React.RefObject<HTMLDivElement>;
    isHost: boolean;
    colIndex: number
    rowIndex: number
    onNumberClick: (row: number, col: number) => void;
    onMenuAction: (action: 'open' | 'correct' | 'incorrect', row: number, col: number, cellValue: string) => void;
}

const Cell = React.memo(({
    cell,
    cellStyle,
    hintWords,
    menu,
    menuRef, // Lưu ý: menuRef này nên được xử lý cẩn thận nếu dùng Portal
    isHost,
    colIndex,
    rowIndex,
    onNumberClick,
    onMenuAction,
}: CellProps) => {
    const cellRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const isCurrentMenu = 
        menu.visible &&
        menu.rowIndex === rowIndex &&
        menu.colIndex === colIndex &&
        typeof cell === 'string' &&
        cell.includes('number');

    // Cập nhật vị trí của menu dựa trên vị trí của Cell trong viewport
    useLayoutEffect(() => {
        if (isCurrentMenu && cellRef.current) {
            const rect = cellRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + rect.height / 2, // Giữa cell theo chiều dọc
                left: rect.left + rect.width + 8, // Bên phải cell 8px
            });
        }
    }, [isCurrentMenu]);

    return (
        <div
            ref={cellRef}
            className="relative w-8 h-8 flex items-center justify-center"
            key={colIndex}
        >
            <div
                className={`w-8 h-8 flex items-center justify-center text-lg font-semibold select-none rounded-lg
                  ${typeof cell === 'string' && cell.includes('number') ? 'text-blue-400 border-none' : ''}
                  ${typeof cell === 'string' && cell.includes('number') ? '' : cellStyle.background}
                  ${typeof cell === 'string' && cell.includes('number') ? 'text-blue-400' : (isHost ? 'text-black' : cellStyle.textColor)}
                `}
                onClick={() => {
                    if (isHost && typeof cell === 'string' && cell.includes('number')) {
                        onNumberClick(rowIndex, colIndex);
                    }
                }}
                style={{
                    cursor: isHost && (typeof cell === 'string' && (cell.includes('number') || hintWords.some(word => word.y === rowIndex || word.x === colIndex))) ? 'pointer' : 'default',
                }}
            >
                {typeof cell === 'string' && cell.includes('number') ? cell.replace('number', '') : cell}
            </div>

            {/* Sử dụng Portal để đưa Menu ra ngoài cùng của DOM */}
            {isCurrentMenu && createPortal(
                <div
                    ref={menuRef as React.RefObject<HTMLDivElement>}
                    className="fixed flex space-x-2 bg-slate-900 border border-blue-400/50 rounded shadow-2xl p-1 z-[9999]"
                    style={{
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        transform: 'translateY(-50%)',
                        pointerEvents: 'auto'
                    }}
                >
                    <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                        onClick={() => onMenuAction('open', rowIndex, colIndex, (cell as string).replace('number', ''))}
                    >
                        SELECT
                    </button>
                    <button
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap"
                        onClick={() => onMenuAction('correct', rowIndex, colIndex, (cell as string).replace('number', ''))}
                    >
                        Correct
                    </button>
                    <button
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                        onClick={() => onMenuAction('incorrect', rowIndex, colIndex, (cell as string).replace('number', ''))}
                    >
                        Incorrect
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
});
export default Cell