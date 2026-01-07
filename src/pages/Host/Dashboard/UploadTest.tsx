import { useState } from "react";
import useTestApi from "../../../shared/hooks/api/useTestApi";
import { toast } from 'react-toastify';
import { Button } from '../../../shared/components/ui';

const UploadTest: React.FC = () => {
  const { uploadTestToServer, uploadMultiplayerTestToServer } = useTestApi();
  const [type, setType] = useState<"single" | "multi">("single");
  const [isPublic, setIsPublic] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fileInput = document.getElementById("fileUpload") as HTMLInputElement;
    const testNameInput = (document.getElementById("testName") as HTMLInputElement).value;
    const file = fileInput.files?.[0];

    if (!file) {
      toast.error("Vui lòng chọn một file!");
      return;
    }

    if (!testNameInput.trim()) {
      toast.error("Vui lòng nhập tên bộ đề!");
      return;
    }

    try {
      toast.info("Đang tải lên bộ đề...");

      if (type === "single") {
        await uploadTestToServer(testNameInput, file);
      } else {
        await uploadMultiplayerTestToServer(testNameInput, file, isPublic);
      }

      toast.success(`Tải lên bộ đề "${testNameInput}" thành công!`);

      // Reset form
      (document.getElementById("testName") as HTMLInputElement).value = "";
      fileInput.value = "";
      setType("single");
      setIsPublic(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Tải lên bộ đề thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== CARD 1: TYPE / MODE ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-medium text-white">Loại đề thi</h3>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setType("single")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${type === "single"
                ? "bg-white text-slate-900"
                : "bg-slate-700/50  hover:bg-slate-700"
              }`}
          >
            Phòng thi đơn
          </button>

          <button
            type="button"
            onClick={() => setType("multi")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${type === "multi"
                ? "bg-white text-slate-900"
                : "bg-slate-700/50  hover:bg-slate-700"
              }`}
          >
            Nhiều người chơi
          </button>
        </div>

        {type === "multi" && (
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`px-5 py-2 rounded-lg ${!isPublic
                  ? "bg-white text-slate-900"
                  : "bg-slate-700/50 "
                }`}
            >
              Riêng tư
            </button>

            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`px-5 py-2 rounded-lg ${isPublic
                  ? "bg-white text-slate-900"
                  : "bg-slate-700/50 "
                }`}
            >
              Công khai
            </button>
          </div>
        )}
      </div>

      {/* ===== CARD 2: UPLOAD FORM ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-medium text-white">Tải lên đề thi</h3>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm ">File Excel</label>
            <input
              id="fileUpload"
              type="file"
              accept=".xlsx"
              className="w-full px-4 py-3 bg-slate-700/60 border border-cyan-500/40 rounded-lg text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm ">Tên bộ đề</label>
            <input
              id="testName"
              type="text"
              className="w-full px-4 py-3 bg-slate-700/60 border border-cyan-500/40 rounded-lg text-white"
              placeholder="Ví dụ: Đề thi thử Toán 2025"
            />
          </div>

          <Button type="submit" className="bg-slate-700/50 hover:bg-slate-700 h-11 px-6">
            Tải lên đề thi
          </Button>
        </form>
      </div>

      {/* ===== CARD 3: GUIDE ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-medium text-white">Hướng dẫn</h3>
        </div>

        <ul className="space-y-2 text-sm">
          <li>• Chỉ chấp nhận file Excel (.xlsx)</li>
          <li>• Sử dụng đúng file mẫu để tránh lỗi</li>
          <li>• Đề nhiều người chơi có thể chọn công khai</li>
        </ul>

        <a
          href="/templates/mau-de-thi.xlsx"
          download
          className="inline-block mt-4 hover:underline"
        >
          📄 Tải file mẫu Excel
        </a>
      </div>
    </div>
  );

};

export default UploadTest;