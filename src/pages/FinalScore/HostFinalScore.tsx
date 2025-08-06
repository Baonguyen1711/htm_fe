import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import FinalScore from '../../components/FinalScore/FinalScore';
import { useSearchParams, useNavigate } from 'react-router-dom';


import useGameApi from '../../shared/hooks/api/useGameApi';
import useRoomApi from '../../shared/hooks/api/useRoomApi';
import { useConfirmModal } from '../../shared/hooks/ui/useConfirmModal';
import Modal from '../../components/ui/Modal/Modal';
import { toast } from 'react-toastify';

const ButtonComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const round = searchParams.get("round") || "1";
  const roomId = searchParams.get("roomId") || "";
  const { setGameHistory, startRound} = useGameApi();
  const {playSound} = useRoomApi();

  // Confirmation modal hook
  const { modalState, showConfirmModal, closeModal } = useConfirmModal();

  // State for countdown modal
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Countdown effect
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      // Navigate to dashboard after countdown
      navigate('/host/dashboard');
    }
  }, [showCountdown, countdown, navigate]);

  const handleEndGameclick = () => {
    showConfirmModal({
      text: 'Bạn có chắc chắn muốn kết thúc trận đấu? Tất cả dữ liệu sẽ được lưu và bạn sẽ quay về trang chủ.',
      onConfirm: async () => {
        try {
          // Save game history
          await setGameHistory(roomId);
          toast.success('Đã lưu lịch sử trận đấu thành công!');

          // Show countdown modal
          setShowCountdown(true);
          setCountdown(5);
        } catch (error) {
          console.error('Error saving game history:', error);
          toast.error('Có lỗi xảy ra khi lưu lịch sử trận đấu');
        }
      },
      confirmText: 'Kết thúc trận đấu',
      confirmVariant: 'danger'
    });
  }

  const handleShowFinalScore = async () => {
    await startRound(roomId)
  }

  return (
    <div className="flex gap-2 mt-4 w-full">
      <button
        onClick={handleShowFinalScore}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
      >
        Hiển thị điểm tổng kết
      </button>
      <button
        onClick={() => {
          playSound(roomId, "final");
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
      >
        Phát nhạc tổng kết
      </button>
      <button
        onClick={handleEndGameclick}
        className="bg-red-600 hover:bg-red-700 text-white p-2 flex-1 rounded-md whitespace-nowrap transition-colors"
      >
        Kết thúc trận đấu
      </button>

      {/* Confirmation Modal */}
      {modalState.isOpen && (
        <Modal
          text={modalState.text}
          buttons={modalState.buttons}
          onClose={closeModal}
        />
      )}

      {/* Countdown Modal */}
      {showCountdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto m-4 shadow-xl text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trận đấu đã kết thúc!
              </h3>
              <p className="text-gray-600 mb-4">
                Lịch sử trận đấu đã được lưu thành công.
              </p>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {countdown}
                </div>
                <p className="text-sm text-gray-500">
                  Đang chuyển về trang chủ...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const HostFinalScore: React.FC = () => {

  return (
    <FinalScore
      isHost={true}
      buttonComponent={<ButtonComponent />}
    />
  );
};



export default HostFinalScore;