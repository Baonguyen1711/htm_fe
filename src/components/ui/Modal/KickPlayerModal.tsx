import React from 'react';
import { PlayerData } from '../../../shared/types';

interface KickPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  player: PlayerData | null;
  isLoading?: boolean;
}

const KickPlayerModal: React.FC<KickPlayerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  player,
  isLoading = false
}) => {
  if (!player || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-auto m-4 shadow-xl">
        <div className="text-center">
          {/* Player Avatar */}
          <div className="mx-auto w-20 h-20 mb-4">
            <img
              src={player.avatar}
              alt={player.userName}
              className="w-20 h-20 rounded-full object-cover border-4 border-red-200"
            />
          </div>

          {/* Warning Icon */}
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Xác nhận loại bỏ người chơi
          </h3>

          {/* Player Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">Người chơi:</p>
            <p className="font-semibold text-gray-900">{player.userName}</p>
            <p className="text-sm text-gray-500">Player_{player.stt}</p>
          </div>

          {/* Warning Message */}
          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc chắn muốn loại bỏ người chơi này khỏi phòng?
            <br />
            <span className="text-red-600 font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Loại bỏ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KickPlayerModal;
