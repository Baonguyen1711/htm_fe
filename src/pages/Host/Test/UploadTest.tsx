import React from "react";
import { uploadTestToServer } from "./service";
import testManageMentService from "../../../services/testManagement.service";

const UploadTest: React.FC = () => {
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fileInput = document.getElementById("fileUpload") as HTMLInputElement;
    const testNameInput = (document.getElementById("testName") as HTMLInputElement).value;
    const file = fileInput.files?.[0];

    if (!file) {
      alert("Vui lòng chọn một file!");
      return;
    }

    const response = await testManageMentService.uploadTestToServer(testNameInput,file)

  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Tải Lên Đề Thi</h2>
        <p className="text-blue-200/80">Tải lên file Excel chứa câu hỏi thi</p>
      </div>

      {/* Upload Form */}
      <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-8">
        <form method="POST" encType="multipart/form-data" onSubmit={(event) => handleFormSubmit(event)}>
          <div className="mb-6">
            <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="fileUpload">
              📄 Tải Lên File Excel
            </label>
            <div className="relative">
              <input
                type="file"
                id="fileUpload"
                name="excelFile"
                accept=".xlsx"
                className="w-full px-4 py-3 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                required
              />
            </div>
            <p className="text-blue-300/60 text-xs mt-1">
              Chỉ chấp nhận file .xlsx
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="testName">
              📝 Tên Bộ Đề
            </label>
            <div className="relative">
              <input
                id="testName"
                name="testName"
                className="w-full px-4 py-3 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                placeholder="Nhập tên bộ đề thi"
                required
              />
            </div>
          </div>

          {/* Template Download */}
          <div className="mb-6">
            <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <p className="text-blue-200 font-medium">Cần mẫu file Excel?</p>
                  <a 
                    href="/example-template" 
                    className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors underline"
                  >
                    Tải xuống file mẫu tại đây
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            🚀 Tải Lên Đề Thi
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-slate-700/30 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6">
        <h3 className="text-blue-200 font-medium mb-3 text-center">
          📋 Hướng dẫn tải lên
        </h3>
        <ul className="text-blue-200/80 text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-cyan-300 mr-2">•</span>
            File phải có định dạng .xlsx (Excel)
          </li>
          <li className="flex items-start">
            <span className="text-cyan-300 mr-2">•</span>
            Sử dụng file mẫu để đảm bảo định dạng đúng
          </li>
          <li className="flex items-start">
            <span className="text-cyan-300 mr-2">•</span>
            Tên bộ đề nên ngắn gọn và dễ nhớ
          </li>
        </ul>
      </div>
    </div>
  );
}

export default UploadTest;