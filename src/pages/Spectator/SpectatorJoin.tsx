
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../shared/hooks/auth/useAuth';
import authService from '../../services/auth.service';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useFirebaseListener } from '../../shared/hooks';
import { useRoomApi } from '../../shared/hooks/api/useRoomApi';
import { Button } from '../../shared/components/ui';

const SpectatorJoin = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const { signInWithoutPassword } = useAuth();
  const { removeSpectator } = useFirebaseListener();
  const { joinAsSpectator } = useRoomApi();

  const handleJoinRoom = async () => {
    try {
      if (!roomId.trim()) {
        alert("Vui lòng nhập mã phòng");
        return;
      }

      // Sign in anonymously first and wait for auth token to be set
      await signInWithoutPassword();

      // Wait for Firebase auth state to change and authToken cookie to be set
      const auth = getAuth();
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(new Error("Authentication timeout"));
        }, 10000); // 10 second timeout

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Get the Firebase ID token and send it to backend to set cookie
              const token = await user.getIdToken();
              await authService.authenticateUser({ token });
              console.log("Auth token cookie set successfully");
              clearTimeout(timeout);
              unsubscribe();
              resolve();
            } catch (error) {
              console.error("Error setting auth token:", error);
              clearTimeout(timeout);
              unsubscribe();
              reject(error);
            }
          }
        });
      }).catch((authError) => {
        console.error("Authentication failed:", authError);
        alert("Lỗi xác thực. Vui lòng thử lại.");
        return;
      });


      const spectatorPath = await joinAsSpectator(roomId);
      console.log("Successfully joined as spectator, path:", spectatorPath);

      // Store the path for cleanup when leaving
      localStorage.setItem('spectatorPath', spectatorPath);


      navigate(`/spectator?roomId=${roomId}&round=1`);
    } catch (error) {
      console.error("Error during joining room:", error);
    }
  };

  const StarBackground = () => {
    // Sinh ra khoảng 100 ngôi sao với các thuộc tính ngẫu nhiên
    const [stars] = useState(() =>
      [...Array(100)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1 + "px", // Kích thước từ 1px đến 3px
        delay: Math.random() * 5 + "s",     // Độ trễ hiệu ứng lấp lánh
        duration: Math.random() * 3 + 2 + "s", // Thời gian một chu kỳ lấp lánh
        opacity: Math.random() * 0.7 + 0.3,
      }))
    );

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 1. Lớp nền gradient tối */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />

      {/* 2. Lớp sao ngẫu nhiên (Thay cho pattern cũ) */}
      <StarBackground />

      {/* 3. Lớp ánh sáng xanh mờ tạo chiều sâu */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,78,99,0.3)_0%,transparent_70%)]" />
      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
              Hành Trình Magellan
            </h1>
            <p className="text-blue-200/90 text-lg">
              Tham gia với tư cách khán giả
            </p>
          </div>

          {/* Join Room Form */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Tham gia phòng
            </h2>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="roomId">
                  Mã phòng
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm text-center text-lg font-mono tracking-wider"
                    type="text"
                    id="roomId"
                    placeholder="Nhập mã phòng"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                </div>
                <p className="text-blue-300/60 text-xs mt-1 text-center">
                  Nhập mã phòng gồm 6 chữ số
                </p>
              </div>
              <button
                onClick={handleJoinRoom}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all bg-slate-700/50  shadow-lg hover:bg-slate-700`}
              >
                Tham gia phòng
              </button>
              {/* <Button
                type="button"
                onClick={handleJoinRoom}
                variant="primary"
                size="lg"
                fullWidth
                className="font-medium shadow-lg"
              >
                Tham gia phòng
              </Button> */}
            </form>

          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-blue-300/80 hover:text-blue-200 text-sm transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>

      <style>
        {
          `@keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  .animate-twinkle {
    animation: twinkle linear infinite;
  }`
        }
      </style>
    </div>
  );
};

export default SpectatorJoin;
