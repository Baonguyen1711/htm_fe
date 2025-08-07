import React from 'react';
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface HostGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: string;
}

const GUIDE_CONTENT = {
  "1": {
    title: "HƯỚNG DẪN HOST - VÒNG 1: NHỔ NEO",
    steps: [
      "1. Bấm 'Bắt đầu vòng thi' để bắt đầu vòng thi",
      "2. Bấm 'Chạy âm thanh bắt đầu vòng thi'",
      "3. Bấm 'Câu hỏi tiếp theo' để hiển thị câu hỏi",
      "4. Bấm 'Đếm giờ' để bắt đầu thời gian trả lời (15s)",
      "5. Sau khi hết giờ, bấm 'Hiện đáp án' để hiển thị đáp án của thí sinh",
      "5. Sau khi hết giờ, bấm 'Hiện đáp án đúng' để hiển thị đáp án đúng của câu hỏi",
      "6. Bấm 'Chấm điểm' (tự động theo thời gian hoặc thủ công tùy theo mode đã chọn)",
      "7. Lặp lại bước 3-6 cho 10 câu hỏi"
    ]
  },
  "2": {
    title: "HƯỚNG DẪN HOST - VÒNG 2: VƯỢT SÓNG",
    steps: [
      "1. Bấm 'Bắt đầu vòng thi' để bắt đầu vòng thi",
      "2. Bấm 'Chạy âm thanh bắt đầu vòng thi'",
      "3. Bấm vào số thứ tự hàng ngang để mở menu hành động",
      "4. Bấm 'SELECT' để hiển thị câu hỏi cho hàng ngang",
      "5. Bấm 'Đếm giờ' để bắt đầu thời gian trả lời",
      "6. Sau khi hết giờ, bấm 'Hiện đáp án thí sinh' để hiển thị câu trả lời của thí sinh",
      "7. Bấm vào số thứ tự hàng ngang để mở menu hành động, chọn correct nếu có thí sinh trả lời đúng và incorrect nếu không ai trả lời đúng",
      "8. Bấm 'Chấm điểm tự động'",
      "9. <b>Đặc biệt:</b> Nếu thí sinh trả lời đúng chướng ngại vật:",
      "   - Bấm 'Mở chướng ngại vật' trước",
      "   - Chọn thí sinh đã trả lời đúng",
      "   - Bấm 'Cập nhật lượt thi'",
      "   - Bấm 'Chấm điểm CNV' với điểm thưởng tương ứng",
      "10. Lặp lại cho các câu hỏi còn lại"
    ]
  },
  "3": {
    title: "HƯỚNG DẪN HOST - VÒNG 3: BỨT PHÁ",
    steps: [
      "1. <b>Giai đoạn phân lượt:</b>",
      "   - Xác định thứ tự thi thông qua phần thi phân lượt",
      "   - Ghi nhận thứ tự thí sinh qua thanh điều khiển dưới mỗi thí sinh",
      "2. <b>Giai đoạn thi chính:</b>",
      "   - Bấm 'Bắt đầu vòng thi'",
      "   - Chọn thí sinh theo thứ tự đã xác định",
      "   - Thí sinh chọn gói",
      "   - Chọn gói tương ứng",
      "   - Bấm 'Câu hỏi tiếp theo' để chạy câu đầu tiên (60s)",
      "3. <b>Trong quá trình thi:</b>",
      "   - Với các câu tiếp theo: chỉ cần bấm 'Đúng'/'Sai'",
      "   - Hệ thống sẽ tự động chuyển câu khi bấm đúng/sai",
      "   - Mỗi câu đúng = 10 điểm (hoặc theo cấu hình)",
      "4. Lặp lại cho tất cả thí sinh (2 lượt/người)"
    ]
  },
  "4": {
    title: "HƯỚNG DẪN HOST - VÒNG 4: CHINH PHỤC",
    steps: [
      "1. <b>Chuẩn bị:</b>",
      "   - Chọn màu cho từng thí sinh trước khi bắt đầu",
      "   - Màu sẽ hiển thị trong ô thí sinh",
      "2. <b>Giai đoạn phân lượt:</b>",
      "   - Sau khi kết thúc vòng thi phân lượt, yêu cầu thí sinh chọn thứ tự thi cho mình dựa theo thành tích ở vòng phân lượt",
      "3. <b>Giai đoạn thi chính:</b>",
      "   - Chọn thí sinh theo lượt",
      "   - Thí sinh chọn 1 ô trên bảng 5x5",
      "   - Bấm 'Select' trên ô đã chọn",
      "   - Bấm 'Câu hỏi tiếp theo'",
      "4. <b>Xử lý kết quả:</b>",
      "   - Bấm vào thí sinh đang thi",
      "   - Bấm 'Cập nhật lượt chơi'",
      "   - Bấm 'Đúng'/'Sai'/'Sai NSHV' tương ứng",
      "5. <b>Khi có thí sinh sai hoặc sai NSHV:</b>",
      "   - Hệ thống tự động mở chuông",
      "   - Nếu có thí sinh giành lượt: chọn ô của thí sinh đó (KHÔNG bấm cập nhật lượt)",
      "   - Bấm 'Giành lượt đúng'/'Giành lượt sai'",
      "6. <b>Khi thí sinh trả lời đúng:</b>",
      "   - Chọn ô đã trả lời đúng",
      "   - Tô màu tương ứng với thí sinh",
      "7. Lặp lại cho đến khi hoàn thành trò chơi"
    ]
  },
  "turn": {
    title: "HƯỚNG DẪN HOST - VÒNG PHÂN LƯỢT",
    steps: [
      "1. Bấm 'Bắt đầu vòng phân lượt'",
      "2. Bấm 'Câu hỏi tiếp theo' để hiển thị câu hỏi",
      "3. Bấm 'Đếm giờ' để bắt đầu thời gian",
      "4. Sau khi hết giờ, bấm 'Hiện đáp án' để hiển thị đáp án và thời gian trả lời của thí sinh",
      "5. Xác định thứ tự thí sinh dựa trên tốc độ trả lời",
      "6. Ghi nhận thứ tự qua thanh điều khiển",
      "7. Chuyển sang vòng thi chính"
    ]
  }
};

const HostGuideModal: React.FC<HostGuideModalProps> = ({ isOpen, onClose, round }) => {
  if (!isOpen) return null;

  const guide = GUIDE_CONTENT[round as keyof typeof GUIDE_CONTENT];

  if (!guide) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-green-400/30 max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
            <h2 className="text-xl font-bold text-white">
              {guide.title}
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
          <div className="space-y-4">
            {guide.steps.map((step: string, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/70 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div 
                  className="text-gray-200 text-base leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              </div>
            ))}
          </div>
          
          {/* Additional Tips */}
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-400/30">
            <h3 className="text-blue-200 font-semibold mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Lưu ý quan trọng:
            </h3>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• Luôn kiểm tra mode chấm điểm (thủ công/tự động) trước khi bắt đầu</li>
              <li>• Quan sát phản ứng của thí sinh để điều chỉnh tốc độ phù hợp</li>
              <li>• Sử dụng nút "Hiển thị luật thi" khi cần thiết</li>
              <li>• Kiểm tra kết nối mạng của tất cả thí sinh trước khi bắt đầu</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 px-6 py-4 border-t border-slate-600/50">
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostGuideModal;
