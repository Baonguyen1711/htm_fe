import React, { useState } from 'react';

interface SimpleColorPickerProps {
  playerStt?: string;
  isHost: boolean;
  currentColor?: string;
  onColorChange: (playerStt: string, color: string) => void;
  usedColors: Set<string>;
}

const COLORS = [
  { name: 'Đỏ', value: '#FF4444' },
  { name: 'Xanh lá', value: '#44FF44' },
  { name: 'Xanh dương', value: '#4444FF' },
  { name: 'Vàng', value: '#FFFF44' },
  { name: 'Tím', value: '#FF44FF' },
  { name: 'Cam', value: '#FF8844' },
  { name: 'Hồng', value: '#FF88CC' },
  { name: 'Xanh lam', value: '#44FFFF' },
];

const SimpleColorPicker: React.FC<SimpleColorPickerProps> = ({
  playerStt,
  currentColor,
  isHost,
  onColorChange,
  usedColors
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    console.log('handleColorSelect called:', { playerStt, color });
    if(playerStt)
    onColorChange(playerStt, color);
    setIsOpen(false);
  };

  const handleRemoveColor = () => {
    if(playerStt)
    onColorChange(playerStt, '');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Color display button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
        style={{ 
          backgroundColor: currentColor || '#666666',
          opacity: currentColor ? 1 : 0.5
        }}
        title={currentColor ? 'Thay đổi màu' : 'Chọn màu'}
      />

      {/* Color picker dropdown */}
      {isOpen && isHost && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-8 left-0 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-2 min-w-[200px]">
            <div className="text-white text-xs mb-2 font-medium">Chọn màu:</div>
            
            {/* Color grid */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {COLORS.map((color) => {
                const isUsed = usedColors.has(color.value);
                const isSelected = currentColor === color.value;
                const isDisabled = isUsed && !isSelected;
                
                return (
                  <button
                    key={color.value}
                    onClick={() => !isDisabled && handleColorSelect(color.value)}
                    disabled={isDisabled}
                    className={`
                      w-8 h-8 rounded border-2 transition-all
                      ${isSelected 
                        ? 'border-white scale-110' 
                        : isDisabled 
                          ? 'border-gray-600 opacity-50 cursor-not-allowed' 
                          : 'border-gray-400 hover:border-white hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={isDisabled ? `${color.name} đã được sử dụng` : color.name}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Remove color button */}
            {currentColor && (
              <button
                onClick={handleRemoveColor}
                className="w-full text-xs text-red-400 hover:text-red-300 py-1 border-t border-slate-600 mt-1"
              >
                Xóa màu
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleColorPicker;
