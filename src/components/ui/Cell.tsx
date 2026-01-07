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
    menuRef: React.RefObject<HTMLDivElement>;
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

    const displayChar = typeof cell === 'string'
      ? cell.includes('number')
        ? cell.replace('number', '')
        : cell
      : '';

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-visible">
        <div
          className={`
            w-full h-full flex items-center justify-center 
            text-sm sm:text-base font-bold select-none rounded-lg
            transition-all duration-200
            ${typeof cell === 'string' && cell.includes('number') 
              ? 'text-blue-400' 
              : cellStyle.background}
            ${typeof cell === 'string' && cell.includes('number') 
              ? '' 
              : isHost 
                ? 'text-black' 
                : cellStyle.textColor}
          `}
          onClick={() => {
            if (isHost && typeof cell === 'string' && cell.includes('number')) {
              onNumberClick(rowIndex, colIndex);
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
          {displayChar}
        </div>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 flex space-x-2 bg-slate-900 border border-blue-400/50 rounded shadow-lg p-1 z-50 whitespace-nowrap"
          >
            <button
              className="px-3 py-1.5 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => onMenuAction('open', rowIndex, colIndex, (cell as string).replace('number', ''))}
            >
              SELECT
            </button>
            <button
              className="px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => onMenuAction('correct', rowIndex, colIndex, (cell as string).replace('number', ''))}
            >
              Correct
            </button>
            <button
              className="px-3 py-1.5 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => onMenuAction('incorrect', rowIndex, colIndex, (cell as string).replace('number', ''))}
            >
              Incorrect
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default Cell