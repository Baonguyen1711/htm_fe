import React from 'react';
import PlayerAnswerInput from '../ui/Input/PlayerAnswerInput';
import Cell from './Cell';
import { useAppSelector } from '../../app/store';
import { Button } from '../../shared/components/ui';


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
  grid?: string[][],
  cellStyles: Record<string, CellStyle>;
  hintWords: HintWord[];
  obstacleWord?: string;
  menu: MenuState;
  menuRef: React.RefObject<HTMLDivElement>;
  isHost: boolean;
  isOpenAll: boolean,
  isSpectator: boolean;
  showModal: boolean;

  onNumberClick: (row: number, col: number) => void;
  onMenuAction: (action: 'open' | 'correct' | 'incorrect', row: number, col: number, cellValue: string) => void;
  onOpenObstacle: () => void;
  onShuffleGrid: () => void;
  onConfirmGrid: () => void;
}

const GameGridRound2: React.FC<GameGridRound2Props> = ({
  grid,
  cellStyles,
  hintWords,
  obstacleWord,
  menu,
  menuRef,
  isHost,
  isOpenAll,
  showModal,
  isSpectator,
  onNumberClick,
  onMenuAction,
  onOpenObstacle,
  onShuffleGrid,
  onConfirmGrid,
}) => {
  const baseBtn =
    "w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 \
   hover:bg-slate-700/60 hover:border-white/20 transition-all duration-200 \
   disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"

  const { round2Grid } = useAppSelector(state => state.game);


  return (
    <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-4 w-full max-w-3xl mx-auto"
      style={{
        zoom: 0.9
      }}
    >

      {/* CNV Display for Host */}
      {isHost && obstacleWord && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-400/50 rounded-lg">
          <div className="text-red-300 text-sm font-medium mb-1">Chướng ngại vật (CNV):</div>
          <div className="text-red-400 text-lg font-bold tracking-wider">
            {obstacleWord.toUpperCase()}
          </div>
        </div>
      )}

      {
        round2Grid?.grid && round2Grid.grid.length > 0 && round2Grid.grid[0].length > 0 && (
          <div
            className="grid [grid-template-columns:repeat(var(--cols),32px)] [grid-auto-rows:max-content] gap-1 max-h-[750px] overflow-y-auto overflow-visible"
            style={{ '--cols': round2Grid?.grid[0]?.length || 1 } as React.CSSProperties}
          >
            {round2Grid?.grid && round2Grid.grid.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const cellStyle = cellStyles[cellKey] || {
                    background: cell === '' || cell === ' ' ? 'transparent' : 'bg-white',
                    textColor: typeof cell === 'string' && cell.includes('number') ? 'text-blue-400' : (isHost ? 'text-black' : isOpenAll ? 'text-black' : 'text-transparent'),
                  };
                  // console.log("cellStyle", cellStyle);

                  return (
                    <Cell
                      key={cellKey}
                      cell={cell}
                      cellStyle={cellStyle}
                      hintWords={hintWords}
                      menu={menu}
                      menuRef={menuRef as React.RefObject<HTMLDivElement>}
                      isHost={isHost}
                      colIndex={colIndex}
                      rowIndex={rowIndex}
                      onNumberClick={onNumberClick}
                      onMenuAction={onMenuAction}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )
      }




      {isHost && (
        <div className="flex gap-2 mt-4 w-full">
          <button className={baseBtn} onClick={onOpenObstacle}>
            Mở CNV
          </button>

          <button className={baseBtn} onClick={onShuffleGrid}>
            Xáo trộn hàng ngang
          </button>
          <button className={baseBtn} onClick={onConfirmGrid}>
            Xác nhận hàng ngang
          </button>

        </div>
      )}


    </div>
  );
};

export default GameGridRound2;