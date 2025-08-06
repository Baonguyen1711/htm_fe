import React from 'react'

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
    menuRef: React.RefObject<HTMLDivElement | null>;
    isHost: boolean;
    colIndex: number
    rowIndex: number
    onNumberClick: (row: number, col: number) => void;
    onMenuAction: (action: 'open' | 'correct' | 'incorrect', row: number, col: number, cellValue: string) => void;
}

const Cell = React.memo(
    ({
        cell,
        cellStyle,
        hintWords,
        menu,
        menuRef,
        isHost,
        colIndex,
        rowIndex,
        onNumberClick,
        onMenuAction,
    }: CellProps) => {
        const showMenu =
            menu.visible &&
            menu.rowIndex === rowIndex &&
            menu.colIndex === colIndex &&
            typeof cell === 'string' &&
            cell.includes('number');

        return (
            <div
                className="relative w-8 h-8 flex items-center justify-center overflow-visible"
                key={colIndex}
            >
                <div
                    className={`w-8 h-8 flex items-center justify-center text-lg font-semibold select-none rounded-lg overflow-visible
                      ${typeof cell === 'string' && cell.includes('number') ? 'text-blue-400 border-none' : ''}
                      ${typeof cell === 'string' && cell.includes('number') ? '' : cellStyle.background}
                      ${typeof cell === 'string' && cell.includes('number') ? 'text-blue-400' : (isHost ? 'text-black' : cellStyle.textColor)}
`}
                    onClick={() => {
                        if (isHost) {
                            if (typeof cell === 'string' && cell.includes('number')) {
                                onNumberClick(rowIndex, colIndex);
                            }
                        }
                    }}
                    style={{
                        cursor:
                            isHost &&
                                (typeof cell === 'string' &&
                                    (cell.includes('number') ||
                                        hintWords.some((word) => word.y === rowIndex || word.x === colIndex)))
                                ? 'pointer'
                                : 'default',
                    }}
                >
                    {typeof cell === 'string' || typeof cell === 'number'
                        ? typeof cell === 'string' && cell.includes('number')
                            ? cell.replace('number', '')
                            : cell
                        : ''}
                </div>

                {showMenu && (
                    <div
                        ref={menuRef}
                        className="absolute left-12 top-1/2 transform -translate-y-1/2 flex space-x-2 bg-slate-900 border border-blue-400/50 rounded shadow-lg p-1 z-10"
                    >
                        <button
                            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() =>
                                onMenuAction('open', rowIndex, colIndex, (cell as string).replace('number', ''))
                            }
                        >
                            SELECT
                        </button>
                        <button
                            className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() =>
                                onMenuAction('correct', rowIndex, colIndex, (cell as string).replace('number', ''))
                            }
                        >
                            Correct
                        </button>
                        <button
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() =>
                                onMenuAction('incorrect', rowIndex, colIndex, (cell as string).replace('number', ''))
                            }
                        >
                            Incorrect
                        </button>
                    </div>
                )}
            </div>
        )
    }
)

export default Cell