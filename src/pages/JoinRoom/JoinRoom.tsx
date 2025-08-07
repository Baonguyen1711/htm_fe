
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../shared/hooks/auth/useAuth';
import useRoomApi from '../../shared/hooks/api/useRoomApi';
import { Button } from '../../shared/components/ui';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { signInWithoutPassword, authenticateUserManually } = useAuth();
  const { validateRoom } = useRoomApi();

  const handleJoinRoom = async () => {
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      if (!roomId.trim()) {
        alert("Vui lòng nhập mã phòng");
        return;
      }

      // Validate room and password first
      try {
        console.log("roomId", roomId);
        const params: any = { room_id: roomId };
        if (password) {
          params.password = password;
        }

        await validateRoom(roomId, password);
      } catch (error: any) {
        if (error.response?.status === 404) {
          alert("Phòng không tồn tại");
          return;
        } else if (error.response?.status === 403) {
          alert("Mật khẩu phòng không đúng");
          return;
        } else {
          alert("Lỗi khi kiểm tra phòng");
          return;
        }
      }

      // Sign in anonymously and wait for auth token to be set
      await signInWithoutPassword();

      await new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve();
        }, 800);
      });

      // Manually authenticate to set cookies
      await authenticateUserManually();

      // Get access token for the room
      try {

        const params = new URLSearchParams({ roomid: roomId });
        if (password) {
          params.append('password', password);
        }
        navigate(`/user/info?${params.toString()}`);
      } catch (tokenError) {
        console.error("Error getting access token:", tokenError);
        alert("Lỗi khi lấy quyền truy cập phòng");
        return;
      }
    } catch (error) {
      console.error("Error during joining room:", error);
      alert("Lỗi khi tham gia phòng");
    } finally {
      // Clear the timeout if it exists to prevent memory leaks
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
              Tham gia phòng thi trực tuyến
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

              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="password">
                  Mật khẩu phòng
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    type="password"
                    id="password"
                    placeholder="Nhập mật khẩu phòng (nếu có)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/50">
                    🔐
                  </span>
                </div>
                <p className="text-blue-300/60 text-xs mt-1 text-center">
                  Để trống nếu phòng không có mật khẩu
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

            <div className="mt-6 text-center">
              <p className="text-blue-200/70 text-sm">
                Bạn muốn tổ chức trận đấu?{' '}
                <Link
                  to="/login"
                  className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                >
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
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

export default JoinRoom;
