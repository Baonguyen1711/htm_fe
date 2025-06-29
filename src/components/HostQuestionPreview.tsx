import React from 'react';
import { useHost } from '../context/hostContext';
import { usePlayer } from '../context/playerContext';

const HostQuestionPreview: React.FC = () => {
  const { currentAnswer, prefetchedQuestion, prefetchedAnswer, showCurrentAnswer, currentQuestionIndex } = useHost();
  const { currentQuestion } = usePlayer();

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-blue-400/30">
      {/* Prefetched Question Preview */}
      {prefetchedQuestion && (
        <div className="bg-blue-600/20 border border-blue-400/50 rounded-lg p-4">
          <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Câu hỏi tiếp theo (Câu {prefetchedQuestion.stt})
          </h3>
          <div className="space-y-2">
            <p className="text-blue-100 text-sm">
              <span className="font-medium">Câu {prefetchedQuestion.stt}:</span> {prefetchedQuestion.question}
            </p>
            {prefetchedQuestion.imgUrl && (
              <img src={prefetchedQuestion.imgUrl} alt="Next Question" className="max-w-xs rounded mt-2" />
            )}
            {prefetchedQuestion.packetName && (
              <p className="text-blue-200/70 text-xs">
                Chủ đề: {prefetchedQuestion.packetName}
              </p>
            )}
            {prefetchedQuestion.difficulty && (
              <p className="text-blue-200/70 text-xs">
                Độ khó: {prefetchedQuestion.difficulty}
              </p>
            )}
            {prefetchedAnswer && (
              <div className="mt-3 p-2 bg-blue-700/30 rounded border border-blue-500/30">
                <p className="text-blue-200 text-xs font-medium mb-1">🎯 Đáp án:</p>
                <p className="text-blue-100 text-sm font-medium">{prefetchedAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!prefetchedQuestion && (
        <div className="text-blue-300/60 text-center py-8">
          <p className="text-lg mb-2">🎮 Sẵn sàng bắt đầu!</p>
          <p className="text-sm">Nhấn "Câu hỏi tiếp theo" để hiển thị câu hỏi đầu tiên</p>
        </div>
      )}

      {prefetchedQuestion && (
        <div className="text-blue-300/60 text-xs">
          <p>💡 Đáp án hiển thị ngay bên dưới câu hỏi trong khung chính</p>
          <p>🔮 Câu hỏi tiếp theo được tải sẵn để luồng game mượt mà hơn</p>
        </div>
      )}
    </div>
  );
};

export default HostQuestionPreview;
