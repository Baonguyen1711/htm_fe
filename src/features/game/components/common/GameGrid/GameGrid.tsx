// Feature-based Game Grid component
import React from 'react';
import { useAppSelector } from '../../../../../app/store';
import { GameGrid as GameGridType } from '../../../../../shared/types';

interface GameGridProps {
  grid?: GameGridType;
  onCellClick?: (row: number, col: number) => void;
  isInteractive?: boolean;
  className?: string;
}

const GameGrid: React.FC<GameGridProps> = ({
  grid,
  onCellClick,
  isInteractive = false,
  className = ''
}) => {
  // Get grid from Redux if not provided
  const { round2Grid, round4Grid, currentRound } = useAppSelector(state => state.game);
  
  const activeGrid = grid || (currentRound === 2 ? round2Grid : round4Grid);

  if (!activeGrid) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🎯</div>
          <p>No grid available</p>
        </div>
      </div>
    );
  }

  const handleCellClick = (row: number, col: number) => {
    if (isInteractive && onCellClick) {
      onCellClick(row, col);
    }
  };

  return (
    <div className={`game-grid ${className}`}>
      <div className="grid gap-1 p-4 bg-slate-800 rounded-lg">
        {activeGrid.cells.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 rounded border-2 font-bold text-sm
                  ${isInteractive 
                    ? 'hover:bg-blue-500 hover:text-white cursor-pointer' 
                    : 'cursor-default'
                  }
                  ${typeof cell === 'string' 
                    ? 'bg-blue-600 text-white border-blue-400' 
                    : 'bg-gray-600 text-gray-300 border-gray-400'
                  }
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!isInteractive}
              >
                {typeof cell === 'string' ? cell : cell.id}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameGrid;
