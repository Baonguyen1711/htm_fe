import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


import useTokenRefresh from "../../../shared/hooks/auth/useTokenRefresh";
import { useAppDispatch, useAppSelector } from "../../../app/store";
import { joinRoom } from "../../../app/store/slices/roomSlice";
import { setCurrentPlayer } from "../../../app/store/slices/gameSlice";
import authService from "../../../services/auth.service";
import tokenRefreshService from "../../../shared/services/auth/tokenRefresh";
import { useOptimizedUpload } from "../../../shared/hooks/useOptimizedUpload";
import { roomApi } from "../../../shared/services/room/roomApi";
import { toast } from 'react-toastify';
import { Button } from '../../../shared/components/ui';

const InformationForm = () => {
  const defaultAvatar = "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomid");
  const roomMode = searchParams.get("roomMode") || "room";
  const testName = searchParams.get("testName") || "";
  const isRoomOwner = searchParams.get("isRoomOwner") === "true";
  const [username, setUsername] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [avatar, setAvatar] = useState<string | null>(defaultAvatar); // sẽ lưu key trả về
  const [password, setPassword] = useState(searchParams.get("password") || "");
  const dispatch = useAppDispatch();
  const { currentPlayer } = useAppSelector(state => state.game);
  const [isLoading, setIsLoading] = useState(false);

  // Room info state
  const [roomInfo, setRoomInfo] = useState<{
    max_players: number;
    room_mode: string;
    current_players_count: number;
    occupied_positions: number[];
    available_positions: number[];
    status: string,
    test_name: string,
    current_players: Array<{
      uid: string;
      userName: string;
      stt: string;
      avatar: string;
    }>;
  } | null>(null);
  const [loadingRoomInfo, setLoadingRoomInfo] = useState(true);

  // Initialize token refresh for player
  useTokenRefresh();

  // Use optimized upload hook
  const { uploading, error: uploadError, uploadFileOptimized } = useOptimizedUpload();

  // useEffect(()=> {
  //   localStorage.removeItem("currentPlayer")
  // },[])

  // Fetch room info on component mount
  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (!roomId) return;

      try {
        setLoadingRoomInfo(true);
        const info = await roomApi.getRoomInfo(roomId, password);
        console.log("info", info)
        setRoomInfo(info);

        // Auto-select first available position if none selected
        if (!playerNumber && info.available_positions.length > 0) {
          setPlayerNumber(info.available_positions[0].toString());
        }

      } catch (error: any) {
        console.error('Failed to fetch room info:', error);
        if (error.response?.status === 404) {
          toast.error('Phòng không tồn tại');
        } else if (error.response?.status === 403) {
          toast.error('Mật khẩu phòng không đúng');
        } else {
          toast.error('Không thể tải thông tin phòng');
        }
      } finally {
        setLoadingRoomInfo(false);
      }
    };

    fetchRoomInfo();
  }, [roomId, password]);

  // Xử lý upload file lên S3 và lưu key trả về (Optimized)
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log(`🚀 Starting optimized avatar upload for: ${file.name}`);
      const uploadedKey = await uploadFileOptimized(file, "User avatar");
      console.log(`✅ Avatar uploaded successfully: https://d1fc7d6en42vzg.cloudfront.net/${uploadedKey}`);

      setAvatar(`https://d1fc7d6en42vzg.cloudfront.net/${uploadedKey}`); // lưu key ảnh
    } catch (error) {
      toast.error('Tải lên ảnh đại diện thất bại. Vui lòng thử lại với ảnh khác', {
        position: 'top-right',
        autoClose: 3000,
      });
      console.error("❌ Avatar upload failed:", error);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return; // Prevent multiple login attempts
    if(roomInfo?.status === "started") {
      toast.error('Phòng đã bắt đầu, không thể tham gia!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    setIsLoading(true); // Set loading state to true
    const toastId = toast.info('Đang tham gia phòng, vui lòng chờ...', {
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
    });

    if (username && playerNumber && roomId && avatar) {
      try {
        const uid = currentPlayer?.uid;

        const userJoinRoomInfo = {
          uid: uid,
          userName: username,
          stt: playerNumber,
          avatar: avatar,
          password: password,
          roomId: roomId,
        };

        const result = await dispatch(joinRoom(userJoinRoomInfo));
        console.log("result", result);

        const tokenResponse = await authService.getAccessToken({ roomId });
        console.log("Access token obtained:", tokenResponse);

        // Store access token
        localStorage.setItem('accessToken', tokenResponse.accessToken);

        // Start auto-refresh timer for the new access token
        tokenRefreshService.startAutoRefresh(tokenResponse.accessToken);
        if (roomInfo?.room_mode === "multiplayer") {
          navigate(`/lobby?roomId=${roomId}&roomMode=multiplayer&testName=${roomInfo.test_name}`);
          toast.dismiss(toastId); // Dismiss the loading toast
          toast.success('Tham gia phòng thành công!', {
            position: 'top-right',
            autoClose: 3000,
          });
          return;
        }
        if (roomMode === "practice" || roomInfo?.room_mode === "practice") {
          let baseUrl = `/play?roomId=${roomId}&roomMode=practice&playMode=auto&testName=${testName}`
          if (isRoomOwner) {
            baseUrl += `&isRoomOwner=true`
          }

          navigate(baseUrl);
          toast.dismiss(toastId); // Dismiss the loading toast
          toast.success('Tham gia phòng thành công!', {
            position: 'top-right',
            autoClose: 3000,
          });
          return;
        }
        navigate(`/play?round=1&roomId=${roomId}&testName=${roomInfo?.test_name}`);
        toast.dismiss(toastId); // Dismiss the loading toast
        toast.success('Tham gia phòng thành công!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } catch (error: any) {
        console.error(error);
        toast.dismiss(toastId); // Dismiss the loading toast
        setIsLoading(false); // Reset loading state to allow retry
        toast.error(error.message || 'Tham gia phòng thất bại. Vui lòng thử lại.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setIsLoading(false); // Ensure loading state is reset in all cases
      }
    } else {
      toast.dismiss(toastId); // Dismiss the loading toast
      setIsLoading(false); // Reset loading state
      toast.error('Vui lòng nhập tên người dùng, chọn số thứ tự và tải ảnh đại diện!', {
        position: 'top-right',
        autoClose: 3000,
      });
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
                </div>
              </div>
              {
                roomMode !== "multiplayer" && (
                  <div className="mb-6">
                    <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="playerPosition">
                      Số thứ tự
                    </label>
                    {loadingRoomInfo ? (
                      <div className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-blue-300/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-2"></div>
                        Đang tải thông tin phòng...
                      </div>
                    ) : roomInfo ? (
                      <div className="relative">
                        <select
                          id="playerPosition"
                          className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm appearance-none"
                          value={playerNumber}
                          onChange={(e) => setPlayerNumber(e.target.value)}
                        >
                          <option value="" disabled className="text-gray-400">
                            Chọn vị trí
                          </option>
                          {roomInfo.available_positions.map((position) => (
                            <option key={position} value={position.toString()} className="text-white bg-slate-700">
                              Vị trí {position}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-blue-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-red-700/50 border border-red-400/30 rounded-lg text-red-300 text-center">
                        Không thể tải thông tin phòng
                      </div>
                    )}
                    {roomInfo && (
                      <p className="text-blue-300/60 text-xs mt-1">
                        Phòng có tối đa {roomInfo.max_players} người chơi.
                        Hiện tại có {roomInfo.current_players_count} người đã tham gia.
                        {roomInfo.occupied_positions.length > 0 && (
                          <span className="block mt-1">
                            Vị trí đã có người: {roomInfo.occupied_positions.join(', ')}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )
              }


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

              <Button
                onClick={handleSubmit}
                variant="success"
                size="lg"
                fullWidth
                isDisabled={uploading}
                isLoading={uploading}
              >
                Xác nhận
              </Button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationForm;
