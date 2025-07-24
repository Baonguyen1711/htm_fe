// MIGRATED VERSION: GameGrid using Redux and new hooks
import React from 'react';
import { useAppSelector } from '../../app/store';
import { GameState } from '../../shared/types';

interface GameGridProps {
  initialGrid: string[][];
  gridColors: string[][];
  menu: { visible: boolean; rowIndex?: number; colIndex?: number };
  isSpectator?: boolean;
  isHost?: boolean;
  showModal: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onCellClick: (row: number, col: number) => void;
  onMenuAction: (action: 'select' | 'red' | 'green' | 'blue' | 'yellow', row: number, col: number) => void;
  onCloseModal: () => void;
  buzzedPlayer?: string;
  staredPlayer?: string;
}

const GameGrid: React.FC<GameGridProps> = ({
  initialGrid,
  gridColors,
  menu,
  isSpectator = false,
  isHost = false,
  showModal,
  onCellClick,
  onMenuAction,
  onCloseModal,
  menuRef,
  buzzedPlayer: propBuzzedPlayer = "",
  staredPlayer: propStaredPlayer = ""
}) => {
  // Redux state
  const {
    players,
    currentTurn,
    round4Grid
  } = useAppSelector((state) => state.game as GameState);

  // Get current player info
  const currentPlayer = players.find(p => p.stt === currentTurn.toString());
  const buzzedPlayer = propBuzzedPlayer || currentPlayer?.userName || "";
  const staredPlayer = propStaredPlayer || ""; // This would come from game state if needed

  // Use Redux grid data if available, otherwise use props
  const grid = round4Grid?.cells || initialGrid;
  const colors = gridColors; // Use props gridColors since Round4Grid doesn't have cellColors

  // Validate grid dimensions
  if (
    !grid ||
    grid.length !== 5 ||
    grid.some((row: any) => row.length !== 5) ||
    !colors ||
    colors.length !== 5 ||
    colors.some((row: any) => row.length !== 5)
  ) {
    return (
      <div className="text-red-500 text-center p-4 border border-red-300 rounded-lg">
        <div className="text-2xl mb-2">⚠️</div>
        <p>Invalid grid data</p>
        <p className="text-sm mt-1">Grid must be 5x5</p>
      </div>
    );
  }

  // Get cell background color
  const getCellBackgroundColor = (row: number, col: number) => {
    const color = colors[row][col];
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-white';
    }
  };

  // Get cell text color
  const getCellTextColor = (row: number, col: number) => {
    const color = colors[row][col];
    return color && color !== 'yellow' ? 'text-white' : 'text-gray-800';
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isSpectator || grid[row][col] === '') return;
    onCellClick(row, col);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Column labels (1, 2, 3, 4, 5) */}
      <div className="grid grid-cols-6 mb-2 w-fit">
        <div className="w-14 h-14"></div>
        {['1', '2', '3', '4', '5'].map((label) => (
          <div
            key={label}
            className="w-14 h-14 flex items-center justify-center font-bold text-lg text-gray-700"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid with row labels */}
      <div className="grid grid-cols-6 gap-1 w-fit">
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {/* Row label (A, B, C, D, E) */}
            <div className="w-14 h-14 flex items-center justify-center font-bold text-lg text-gray-700">
              {String.fromCharCode(65 + rowIndex)}
            </div>
            
            {/* Grid cells */}
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-14 h-14 border-2 border-gray-400 flex items-center justify-center 
                  text-2xl font-bold cursor-pointer transition-all duration-200
                  hover:border-gray-600 hover:shadow-md
                  ${getCellBackgroundColor(rowIndex, colIndex)}
                  ${getCellTextColor(rowIndex, colIndex)}
                  ${isSpectator ? 'cursor-not-allowed opacity-75' : ''}
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                title={`Cell ${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`}
              >
                {typeof cell === 'string' ? cell : (cell as any)?.symbol || '!'}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Context Menu */}
      {menu.visible && menu.rowIndex !== undefined && menu.colIndex !== undefined && (
        <div
          ref={menuRef}
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50"
          style={{
            top: `${(menu.rowIndex + 1) * 60 + 100}px`,
            left: `${(menu.colIndex + 1) * 60 + 100}px`,
          }}
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onMenuAction('select', menu.rowIndex!, menu.colIndex!)}
              className="px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
            >
              Select Cell
            </button>
            <hr className="my-1" />
            <button
              onClick={() => onMenuAction('red', menu.rowIndex!, menu.colIndex!)}
              className="px-3 py-2 text-left hover:bg-red-100 rounded text-sm text-red-700"
            >
              🔴 Red
            </button>
            <button
              onClick={() => onMenuAction('green', menu.rowIndex!, menu.colIndex!)}
              className="px-3 py-2 text-left hover:bg-green-100 rounded text-sm text-green-700"
            >
              🟢 Green
            </button>
            <button
              onClick={() => onMenuAction('blue', menu.rowIndex!, menu.colIndex!)}
              className="px-3 py-2 text-left hover:bg-blue-100 rounded text-sm text-blue-700"
            >
              🔵 Blue
            </button>
            <button
              onClick={() => onMenuAction('yellow', menu.rowIndex!, menu.colIndex!)}
              className="px-3 py-2 text-left hover:bg-yellow-100 rounded text-sm text-yellow-700"
            >
              🟡 Yellow
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Cell Selected
              </h3>
              <p className="text-gray-600 mb-4">
                A cell has been selected for the current question.
              </p>
              
              {buzzedPlayer && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <span className="font-medium">Current Player:</span> {buzzedPlayer}
                  </p>
                </div>
              )}
              
              {staredPlayer && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">
                    <span className="font-medium">Starred Player:</span> {staredPlayer}
                  </p>
                </div>
              )}
              
              <button
                onClick={onCloseModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Status */}
      <div className="mt-4 text-center">
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Red</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Green</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Blue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Yellow</span>
          </div>
        </div>
        
        {currentPlayer && (
          <div className="mt-2 text-sm text-gray-700">
            Current Turn: <span className="font-medium">{currentPlayer.userName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameGrid;
