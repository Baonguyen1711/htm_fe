import React, { useState, useEffect } from 'react';
import { XMarkIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

interface PlayerColorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  players: any[];
  onSaveColors: (colors: Record<string, string>) => void;
  currentColors?: Record<string, string>;
}

const AVAILABLE_COLORS = [
  { name: 'Đỏ', value: '#FF0000', bg: 'bg-red-500' },
  { name: 'Xanh lá', value: '#00FF00', bg: 'bg-green-500' },
  { name: 'Xanh dương', value: '#0000FF', bg: 'bg-blue-500' },
  { name: 'Vàng', value: '#FFFF00', bg: 'bg-yellow-500' },
  { name: 'Tím', value: '#800080', bg: 'bg-purple-500' },
  { name: 'Cam', value: '#FFA500', bg: 'bg-orange-500' },
  { name: 'Hồng', value: '#FF69B4', bg: 'bg-pink-500' },
  { name: 'Xanh lam', value: '#00FFFF', bg: 'bg-cyan-500' }
];

const PlayerColorSelector: React.FC<PlayerColorSelectorProps> = ({ 
  isOpen, 
  onClose, 
  players, 
  onSaveColors,
  currentColors = {}
}) => {
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>(currentColors);
  const [usedColors, setUsedColors] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedColors(currentColors);
    setUsedColors(new Set(Object.values(currentColors)));
  }, [currentColors, isOpen]);

  if (!isOpen) return null;

  const handleColorSelect = (playerStt: string, color: string) => {
    const newSelectedColors = { ...selectedColors };
    const newUsedColors = new Set(usedColors);

    // Remove old color if exists
    if (selectedColors[playerStt]) {
      newUsedColors.delete(selectedColors[playerStt]);
    }

    // Add new color
    newSelectedColors[playerStt] = color;
    newUsedColors.add(color);

    setSelectedColors(newSelectedColors);
    setUsedColors(newUsedColors);
  };

  const handleRemoveColor = (playerStt: string) => {
    const newSelectedColors = { ...selectedColors };
    const newUsedColors = new Set(usedColors);

    if (selectedColors[playerStt]) {
      newUsedColors.delete(selectedColors[playerStt]);
      delete newSelectedColors[playerStt];
    }

    setSelectedColors(newSelectedColors);
    setUsedColors(newUsedColors);
  };

  const handleSave = () => {
    onSaveColors(selectedColors);
    onClose();
  };

  const getColorName = (colorValue: string) => {
    const color = AVAILABLE_COLORS.find(c => c.value === colorValue);
    return color ? color.name : colorValue;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-400/30 max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PaintBrushIcon className="w-8 h-8 text-white" />
            <h2 className="text-xl font-bold text-white">
              Chọn màu cho thí sinh - Vòng 4
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.map((player, index) => (
              <div
                key={player.stt || index}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={player.avatar || '/default-avatar.png'}
                      alt={player.userName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="text-white font-semibold">{player.userName}</h3>
                      <p className="text-gray-400 text-sm">Thí sinh {player.stt}</p>
                    </div>
                  </div>
                  
                  {/* Current Color Display */}
                  {selectedColors[player.stt] && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: selectedColors[player.stt] }}
                      ></div>
                      <span className="text-white text-sm">
                        {getColorName(selectedColors[player.stt])}
                      </span>
                      <button
                        onClick={() => handleRemoveColor(player.stt)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Color Options */}
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_COLORS.map((color) => {
                    const isUsed = usedColors.has(color.value);
                    const isSelected = selectedColors[player.stt] === color.value;
                    const isDisabled = isUsed && !isSelected;

                    return (
                      <button
                        key={color.value}
                        onClick={() => !isDisabled && handleColorSelect(player.stt, color.value)}
                        disabled={isDisabled}
                        className={`
                          relative w-12 h-12 rounded-lg border-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-white scale-110 shadow-lg' 
                            : isDisabled 
                              ? 'border-gray-600 opacity-50 cursor-not-allowed' 
                              : 'border-gray-400 hover:border-white hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: color.value }}
                        title={isDisabled ? `${color.name} đã được sử dụng` : color.name}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                        {isDisabled && !isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <XMarkIcon className="w-6 h-6 text-gray-800" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-400/30">
            <h3 className="text-blue-200 font-semibold mb-2">Hướng dẫn:</h3>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• Chọn màu khác nhau cho mỗi thí sinh</li>
              <li>• Màu sẽ được sử dụng để tô các ô trên bảng 5x5 trong vòng 4</li>
              <li>• Màu đã chọn sẽ hiển thị trong ô thí sinh</li>
              <li>• Bấm X để bỏ chọn màu cho thí sinh</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 px-6 py-4 border-t border-slate-600/50">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              Đã chọn: {Object.keys(selectedColors).length}/{players.length} thí sinh
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Lưu màu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerColorSelector;
