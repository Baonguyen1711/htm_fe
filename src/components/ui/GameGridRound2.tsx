import React from 'react';
import PlayerAnswerInput from './PlayerAnswerInput'; // Adjust import path as needed
import { Question } from '../../type';

interface CellStyle {
  background: string;
  textColor: string;
}

interface MenuState {
  visible: boolean;
  rowIndex?: number;
  colIndex?: number;
}

interface HintWord {
  x?: number;
  y?: number;
}

interface GameGridRound2Props {
  grid: (string | number)[][];
  cellStyles: Record<string, CellStyle>;
  hintWords: HintWord[];
  obstacleWord?: string;
  menu: MenuState;
  menuRef: React.RefObject<HTMLDivElement | null>;
  isHost: boolean;
  isSpectator: boolean;
  showModal: boolean;
  buzzedPlayer: string;
  currentQuestion: Question | undefined;
  onCellClick: (row: number, col: number) => void;
  onNumberClick: (row: number, col: number) => void;
  onMenuAction: (action: 'open' | 'correct' | 'incorrect', row: number, col: number, cellValue: string) => void;
  onOpenObstacle: () => void;
  onShuffleGrid: () => void;
  onCloseModal: () => void;
}

const GameGridRound2: React.FC<GameGridRound2Props> = ({
  grid,
  cellStyles,
  hintWords,
  obstacleWord,
  menu,
  menuRef,
  isHost,
  isSpectator,
  showModal,
  buzzedPlayer,
  currentQuestion,
  onCellClick,
  onNumberClick,
  onMenuAction,
  onOpenObstacle,
  onShuffleGrid,
  onCloseModal,
}) => {
  // Validate grid
  if (!grid || !Array.isArray(grid) || !grid.every((row) => Array.isArray(row))) {
    return <div className="text-white">Invalid grid data</div>;
  }

  return (
    <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full max-w-3xl mx-auto">
      <div
        className="grid [grid-template-columns:repeat(var(--cols),32px)] [grid-auto-rows:max-content] gap-1 max-h-[750px] overflow-y-auto overflow-visible"
        style={{ '--cols': grid[0]?.length || 1 } as React.CSSProperties}
      >
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const cellStyle = cellStyles[cellKey] || {
                background: cell === '' || cell === ' ' ? 'transparent' : 'bg-white',
                textColor: typeof cell === 'string' && cell.includes('number') ? 'text-blue-400' : 'text-transparent',
              };

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
                      ${typeof cell === 'string' && cell.includes('number') ? 'text-blue-400' : cellStyle.textColor}
                      ${
                        obstacleWord?.includes(cell as string) &&
                        cellStyle.textColor === 'text-black' &&
                        typeof cell === 'string' &&
                        !cell.includes('number') &&
                        isNaN(Number(cell))
                          ? 'font-bold text-red-400'
                          : ''
                      }`}
                    onClick={() => {
                      if (isHost) {
                        if (typeof cell === 'string' && cell.includes('number')) {
                          onNumberClick(rowIndex, colIndex);
                        } else {
                          onCellClick(rowIndex, colIndex);
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
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {!isSpectator && (
        <PlayerAnswerInput isHost={isHost} question={currentQuestion} />
      )}

      {isHost && (
        <div className="flex gap-2 mt-4 w-full">
          <button
            onClick={onOpenObstacle}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
          >
            Mở CNV
          </button>
          <button
            onClick={onShuffleGrid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
          >
            Xáo trộn hàng ngang
          </button>
        </div>
      )}

      {showModal && buzzedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {`${buzzedPlayer} đã nhấn chuông trả lời`}
            </h2>
            <div className="flex justify-center">
              <button
                onClick={onCloseModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameGridRound2;