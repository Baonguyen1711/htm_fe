import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { joinRoom } from "./services";
import { usePlayer } from "../../../context/playerContext";
import { uploadFile } from "../../../services/uploadAssestServices";
import roomService from "../../../services/room.service";
import useTokenRefresh from "../../../hooks/useTokenRefresh";

const InformationForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomid");
  const [username, setUsername] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null); // sẽ lưu key trả về
  const [uploading, setUploading] = useState(false);
  const [password, setPassword] = useState(searchParams.get("password") || "");
  const { setPlayers, setRoomId, setPosition, setCurrentPlayerName, setCurrentPlayerAvatar } = usePlayer();

  const defaultAvatar = "https://via.placeholder.com/100";

  // Initialize token refresh for player
  useTokenRefresh();

  // Xử lý upload file lên S3 và lưu key trả về
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedKey = await uploadFile(file, "User avatar");
      console.log(`https://d1fc7d6en42vzg.cloudfront.net/${uploadedKey}`);

      setAvatar(`https://d1fc7d6en42vzg.cloudfront.net/${uploadedKey}`); // lưu key ảnh
      setUploading(false);
    } catch (error) {
      setUploading(false);
      alert("Upload ảnh đại diện thất bại. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (username && playerNumber && roomId && avatar) {
      try {
        const result = await roomService.joinRoom(roomId, {
          userName: username,
          stt: playerNumber,
          avatar: avatar,
        }, password || undefined);

        console.log("result", result);

        const currentPlayer = result.players.find((player: any) => player.stt === playerNumber);

        console.log("currentPlayer", currentPlayer);
        localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
        localStorage.setItem("currentAvatar", JSON.stringify(avatar));

        setCurrentPlayerName(username);
        setCurrentPlayerAvatar(avatar)
        setPlayers(result.players);
        setPosition(playerNumber);
        setRoomId(roomId);
        navigate(`/play?round=1&roomId=${roomId}`);
      } catch (error) {
        alert("Tham gia phòng thất bại.");
        console.error(error);
      }
    } else {
      alert("Vui lòng nhập tên người dùng, chọn số thứ tự và tải ảnh đại diện!");
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
              Nhập thông tin để tham gia phòng thi
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Thông tin
            </h2>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="email">
                  Name
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    id="email"
                    placeholder="Nhập tên của bạn "
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/50">
                    📧
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="password">
                  Số thứ tự
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"

                    id="password"
                    placeholder="Nhập số thứ tự"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/50">
                    🔒
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="roomPassword">
                  Mật khẩu phòng
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    type="password"
                    id="roomPassword"
                    placeholder="Nhập mật khẩu phòng (nếu có)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300/50">
                    🔐
                  </span>
                </div>
                <p className="text-blue-300/60 text-xs mt-1">
                  Để trống nếu phòng không có mật khẩu
                </p>
              </div>

              <div className="mb-4 text-center">
                <img
                  src={avatar ? `${avatar}` : defaultAvatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                />
                <label className="block cursor-pointer">
                  <span className="sr-only">Chọn ảnh đại diện</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <span
                    className={`px-4 py-2 text-white rounded cursor-pointer ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    {uploading ? "Đang tải..." : "Tải ảnh đại diện"}
                  </span>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={uploading}
              >
                Xác nhận
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationForm;
