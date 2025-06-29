import React, { useState } from 'react';
import UploadExam from './UploadTest';
import ViewTest from './ViewTest';
import SetupMatch from './SetUpMatch';
import ViewHistory from './History';
import useAuth from '../../../hooks/useAuth';

const HostManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const {getToken} = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ocean/Starry Night Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
        {/* Stars overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
        {/* Ocean waves effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-6xl mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
              Bảng Điều Khiển 
            </h1>
            <p className="text-blue-200/90 text-lg">
              Quản lý đề thi và phòng thi
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl p-2 mb-6 shadow-xl">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'upload' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
                }`}
              >
                Tải Lên Đề Thi
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'view' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
                }`}
              >
                Xem Đề Thi
              </button>
              <button
                onClick={() => setActiveTab('setup')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'setup' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
                }`}
              >
                Thiết Lập Phòng
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'history' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' 
                    : 'text-blue-200 hover:bg-blue-600/20 hover:text-white'
                }`}
              >
                Lịch sử trận đấu
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800/70 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl">
            {activeTab === 'upload' && <UploadExam/>}
            {activeTab === 'view' && <ViewTest />}
            {activeTab === 'setup' && <SetupMatch />}
            {activeTab === 'history' && <ViewHistory />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostManagement;