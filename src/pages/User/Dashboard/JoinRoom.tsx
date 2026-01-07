import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../shared/hooks/auth/useAuth';
import useRoomApi from '../../../shared/hooks/api/useRoomApi';
import { Button } from '../../../shared/components/ui';
import { toast } from 'react-toastify';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithoutPassword, authenticateUserManually, isAuthenticated } = useAuth();
  const { validateRoom } = useRoomApi();
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = async () => {
    if (isLoading || !roomId.trim()) return;
    setIsLoading(true);
    const loadingToast = toast.info('Đang kiểm tra phòng...', { autoClose: false });

    try {
      await validateRoom(roomId, password || undefined);
      if (!isAuthenticated) await signInWithoutPassword();
      await new Promise(r => setTimeout(r, 600));
      await authenticateUserManually();

      toast.dismiss(loadingToast);
      toast.success('Tham gia thành công!');

      const params = new URLSearchParams({ roomid: roomId });
      if (password) params.append('password', password);
      navigate(`/user/info?${params.toString()}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      if (error.response?.status === 404) toast.error('Phòng không tồn tại');
      else if (error.response?.status === 403) toast.error('Mật khẩu sai');
      else toast.error('Lỗi khi tham gia phòng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto px-4">
      {/* ===== CARD 1: HEADER ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Tham gia phòng chơi</h2>
        <p className="">
          Nhập mã phòng để bắt đầu tham gia trò chơi
        </p>
      </div>

      {/* ===== CARD 2: FORM ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* Mã phòng */}
          <div className="space-y-2">
            <label className="text-sm font-medium ">
              Mã phòng
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="ABC123"
              className="w-full px-5 py-4 bg-slate-700/60 border border-cyan-500/40 rounded-lg text-white  text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Mật khẩu */}
          <div className="space-y-2">
            <label className="text-sm font-medium ">
              Mật khẩu phòng (nếu có)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống nếu không cần"
              className="w-full px-5 py-4 bg-slate-700/60 border border-cyan-500/40 rounded-lg text-white  focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Button */}
          <Button
            onClick={handleJoinRoom}
            disabled={isLoading || !roomId.trim()}
            size="lg"
            fullWidth
            className="h-12 text-lg font-semibold shadow-xl"
          >
            {isLoading ? "Đang tham gia..." : "Tham gia ngay"}
          </Button>
        </div>
      </div>

      {/* ===== CARD 3: FOOTER ===== */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6 text-center space-y-4">
        <p className="">
          Muốn lưu kết quả hoặc tạo phòng riêng?{" "}
          <Link to="/register" className="font-bold text-white hover:underline">
            Đăng ký
          </Link>{" "}
          hoặc{" "}
          <Link to="/login" className="font-bold text-white hover:underline">
            Đăng nhập
          </Link>
        </p>

        <Link
          to="/"
          className="inline-block  hover:text-white transition-colors"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  );

};

export default JoinRoom;