import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ScoreRule } from '../../../shared/types';

// interface RoomRules {
//   round1: number[];
//   round2: number[];
//   round3: number;
//   round4: number[];
// }

interface RulesModalProps {
  isOpen: boolean;
  isHost?: boolean
  onClose: () => void;
  round: string;
  mode?: 'manual' | 'auto' | 'adaptive';
  roomRules: ScoreRule | null;
}

// Generate dynamic rules content based on room settings
const generateRulesContent = (mode: 'manual' | 'auto' | 'adaptive' = 'adaptive', roomRules?: ScoreRule | null) => {
  const defaultRules = {
    round1: [15, 10, 10, 10],
    round2: [15, 10, 10, 10],
    round3: 10,
    round4: [10, 20, 30]
  };

  const rules = roomRules || defaultRules;

  return {
    "1": {
      title: "LUẬT THI VÒNG 1 - NHỔ NEO",
      content: [
        `Tất cả các thí sinh trả lời 10 câu hỏi hình ảnh, audio hoặc video, mỗi câu hỏi trong vòng 15s.`,
        ...(mode === 'manual' ? [
          `<b>Chế độ chấm thủ công:</b> Host sẽ chấm điểm cho từng thí sinh dựa trên câu trả lời.`
        ] : mode === 'auto' ? [
          `<b>Chế độ chấm theo thời gian:</b>`,
          `- Thí sinh trả lời nhanh nhất: <b>${rules.round1[0]} điểm</b>`,
          `- Thí sinh trả lời nhanh thứ 2: <b>${rules.round1[1]} điểm</b>`,
          `- Thí sinh trả lời nhanh thứ 3: <b>${rules.round1[2]} điểm</b>`,
          `- Thí sinh trả lời nhanh thứ 4: <b>${rules.round1[3]} điểm</b>`
        ] : [
          `<b>Chế độ chấm theo số lượng:</b>`,
          `- Nếu có 1 thí sinh trả lời đúng: <b>20 điểm</b>`,
          `- Nếu có 2 thí sinh trả lời đúng: mỗi thí sinh được <b>15 điểm</b>`,
          `- Nếu có 3 thí sinh trả lời đúng: mỗi thí sinh được <b>10 điểm</b>`,
          `- Nếu có 4 thí sinh trả lời đúng: mỗi thí sinh được <b>5 điểm</b>`
        ])
      ]
    },
    "2": {
      title: "LUẬT THI VÒNG 2 - VƯỢT SÓNG",
      content: [
        `Các thí sinh sẽ phải tìm ra một CNV nhưng <b>không cho biết số lượng chữ cái</b> của CNV, 6 hàng ngang gợi ý liên quan đến CNV được sắp xếp ngang dọc tùy ý và có thể giao nhau ở các kí tự chung.`,
        `Mở mỗi hàng ngang có các ô <b>được tô màu xanh gợi ý các chữ cái có trong CNV</b>. Các thí sinh ấn chuông giành quyền trả lời CNV bất cứ lúc nào nhưng sai sẽ bị loại khỏi phần thi.`,
        ...(mode === 'manual' ? [
          `<b>Chế độ chấm thủ công:</b> Host sẽ chấm điểm cho từng thí sinh dựa trên câu trả lời.`
        ] : mode === 'auto' ? [
          `<b>Chế độ chấm theo thời gian:</b>`,
          `- Thí sinh trả lời nhanh nhất: <b>${rules.round2[0]} điểm</b>`,
          `- Thí sinh trả lời nhanh thứ 2: <b>${rules.round2[1]} điểm</b>`,
          `- Thí sinh trả lời nhanh thứ 3: <b>${rules.round2[2]} điểm</b>`,
          `- Thí sinh trả lời nhanh thứ 4: <b>${rules.round2[3]} điểm</b>`
        ] : [
          `<b>Chế độ chấm theo số lượng:</b>`,
          `- Nếu có 1 thí sinh trả lời đúng: <b>20 điểm</b>`,
          `- Nếu có 2 thí sinh trả lời đúng: mỗi thí sinh được <b>15 điểm</b>`,
          `- Nếu có 3 thí sinh trả lời đúng: mỗi thí sinh được <b>10 điểm</b>`,
          `- Nếu có 4 thí sinh trả lời đúng: mỗi thí sinh được <b>5 điểm</b>`
        ]),
        `- Trả lời đúng CNV sau khi mở n hàng ngang được <b>(7-n)*15 điểm</b>.`,
        `- Sau khi mở tất cả các hàng ngang mà vẫn chưa có thí sinh nào trả lời đúng CNV. Cơ hội sẽ dành cho khán giả.`
      ]
    },
    "3": {
      title: "LUẬT THI VÒNG 3 - BỨT PHÁ",
      content: [
        `Các thí sinh giành lượt đi trước bằng <b>câu hỏi phân lượt</b>, thí sinh nào trả lời đúng và nhanh hơn sẽ giành được quyền ưu tiên trong phần thi này.`,
        `Các thí sinh sẽ thi đấu 2 lượt. Sẽ có những gói câu hỏi thuộc nhiều lĩnh vực và tới lượt mỗi thí sinh, chọn 1 lĩnh vực trong số những lĩnh vực chưa được chọn trước đó và trả lời trong vòng 60s.`,
        `Tối đa 12 câu trong mỗi gói, trả lời đúng mỗi câu được <b>${rules.round3} điểm</b>.`
      ]
    },
    "4": {
      title: "LUẬT THI VÒNG 4 - CHINH PHỤC",
      content: [
        `Các thí sinh tiếp tục giành quyền chọn thứ tự của mình bằng <b>câu hỏi phân lượt</b>. Ai trả lời đúng và nhanh hơn theo thứ tự sẽ <b>được chọn thứ tự của mình</b>.`,
        `Sẽ có một bảng số gồm 5x5 ô vuông gồm các ô vuông chấm than và ô vuông chấm hỏi với các mức điểm tương ứng lần lượt là <b>${rules.round4[1]}, ${rules.round4[2]}</b>.`,
        `Mỗi thí sinh tới lượt mình chọn một ô và trả lời câu hỏi, đúng được tô màu của mình vào ô đó, sai các thí sinh khác ấn chuông giành quyền trả lời sau hiệu lệnh của MC.`,
        `Trả lời đúng được tô màu của mình vào ô đó và lấy đi số điểm của câu hỏi từ người chọn. Sai sẽ bị trừ một nửa số điểm của câu hỏi.`,
        `Mỗi thí sinh có quyền đặt <b>ngôi sao hy vọng</b> vào bất kỳ lúc nào (chỉ được đặt một lần). Trả lời đúng câu hỏi có NSHV được thêm 1.5 lần số điểm câu hỏi và được chọn thêm một ô nữa để trả lời, trả lời sai bị trừ số điểm bằng số điểm của câu hỏi.`,
        `Mỗi thí có 5 lượt chơi và nếu có một thí sinh tạo được một đường ngang dọc hoặc chéo với 4 ô màu của mình liên tiếp thì sẽ được cộng thêm 50 điểm. Mỗi thí sinh chỉ được + 50 điểm một lần.`
      ]
    }
  };
};

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, round, mode = 'adaptive', roomRules, isHost }) => {
  if (!isOpen) return null;

  const rulesContent = generateRulesContent(mode, roomRules || null);
  const rules = rulesContent[round as keyof typeof rulesContent];

  if (!rules) {
    return null;
  }

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={onClose}
    />

    {/* Modal */}
    <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg border border-gray-200">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {rules.title}
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        {rules.content.map((rule: string, index: number) => (
          <div key={index} className="flex gap-3">
            <div className="text-gray-400 font-medium min-w-[24px]">
              {index + 1}.
            </div>
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: rule }}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      {isHost && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition"
          >
            Đã hiểu
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default RulesModal;
