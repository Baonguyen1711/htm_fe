import React from 'react';
import { Waves, Users, Clock } from 'lucide-react'

const FallBack = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ocean/Starry Night Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
        {/* Stars overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
        {/* Ocean waves effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse wave-animation"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          
          {/* Main Animation Container */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="w-24 h-24 border-4 border-blue-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
              
              {/* Inner pulsing circle */}
              <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                <Waves className="w-8 h-8 text-white animate-bounce" />
              </div>
              
              {/* Floating dots around the circle */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                <div className="w-3 h-3 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Đang chờ người chơi...
          </h2>

          {/* Status message */}
          <p className="text-blue-200/80 mb-6 leading-relaxed">
            Vui lòng đợi trong khi chúng tôi chuẩn bị trò chơi cho bạn
          </p>

          {/* Animated status indicators */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-cyan-300">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Kết nối</span>
            </div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="flex items-center space-x-2 text-blue-300">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Chờ đợi</span>
            </div>
          </div>

          {/* Progress dots animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-3 h-3 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Secondary message */}
          <p className="text-blue-300/60 text-sm mt-6">
            Trò chơi sẽ bắt đầu sớm thôi...
          </p>
        </div>
      </div>
    </div>
  );
};

export default FallBack;