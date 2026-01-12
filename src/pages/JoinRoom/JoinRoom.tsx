
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../shared/hooks/auth/useAuth';
import useRoomApi from '../../shared/hooks/api/useRoomApi';
import { Button } from '../../shared/components/ui';
import { toast } from 'react-toastify';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { signInWithoutPassword, authenticateUserManually, isAuthenticated } = useAuth();
  const { validateRoom } = useRoomApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleJoinRoom = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isLoading) return; // Prevent multiple login attempts

    setIsLoading(true); // Set loading state to true
    const toastId = toast.info('Đang lấy thông tin phòng, vui lòng chờ...', {
      position: 'top-right',
      autoClose: false, // Keep toast until manually dismissed or updated
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
    });

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
      if (!isAuthenticated()) {
        await signInWithoutPassword();
      }

      await new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve();
        }, 800);
      });

      toast.dismiss(toastId); // Dismiss the loading toast
      toast.success('Đã lấy thông tin phòng thành công!', {
        position: 'top-right',
        autoClose: 3000,
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
        toast.dismiss(toastId); // Dismiss the loading toast
        toast.error('Lỗi khi lấy thông tin phòng', {
          position: 'top-right',
          autoClose: 3000,
        });
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
                </div>
                <p className="text-blue-300/60 text-xs mt-1 text-center">
                  Để trống nếu phòng không có mật khẩu
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

            {/* <div className="mt-6 text-center">
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

            <div className="mt-6 text-center">
              <p className="text-blue-200/70 text-sm">
                Bạn muốn lưu lại kết quả thi đấu?{' '}
                <Link
                  to="/register"
                  className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                >
                  Đăng ký tài khoản tại đây
                </Link>
              </p>
            </div> */}

            <div className="mt-6 text-center text-sm text-blue-200/70">
              <p>
                Muốn lưu lại kết quả thi đấu hoặc tổ chức trận đấu?{""}
                <br />
                <Link to="/register" className="text-cyan-300 hover:text-cyan-200 font-medium">
                  Đăng ký tài khoản
                </Link>
                {" "}hoặc{" "}
                <Link to="/login" className="text-cyan-300 hover:text-cyan-200 font-medium">
                  đăng nhập
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-blue-200/70 text-sm">
                Hoặc{' '}
                <Link
                  to="/practice/create"
                  className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                >
                  Tự luyện tập
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

export default JoinRoom;
