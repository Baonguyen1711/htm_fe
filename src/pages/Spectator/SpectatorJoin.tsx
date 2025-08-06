
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

              <Button
                type="button"
                onClick={handleJoinRoom}
                variant="primary"
                size="lg"
                fullWidth
                className="font-medium shadow-lg"
              >
                Tham gia phòng
              </Button>
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
    </div>
  );
};

export default SpectatorJoin;
