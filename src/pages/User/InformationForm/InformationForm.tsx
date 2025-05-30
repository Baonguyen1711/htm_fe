import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { joinRoom } from "./services";
import { usePlayer } from "../../../context/playerContext";
import { uploadFile } from "../../../services/uploadAssestServices";

const InformationForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomid");
  const [username, setUsername] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null); // sẽ lưu key trả về
  const [uploading, setUploading] = useState(false);
  const { setPlayers, setRoomId, setPosition, setCurrentPlayerName } = usePlayer();

  const defaultAvatar = "https://via.placeholder.com/100";

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
        const result = await joinRoom(roomId, {
          userName: username,
          stt: playerNumber,
          avatar: avatar,
        });

        console.log("result", result);

        const currentPlayer = result.players.find((player: any) => player.stt === playerNumber);

        console.log("currentPlayer", currentPlayer);
        localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));

        setCurrentPlayerName(username);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-1/4 mx-auto p-4 bg-gray-100 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4 text-center">Nhập thông tin</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Nhập tên người dùng"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium" htmlFor="playerNumber">
            Số thứ tự
          </label>
          <select
            id="playerNumber"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
          >
            <option value="" disabled>
              Chọn số thứ tự
            </option>
            {[1, 2, 3, 4].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
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
              className={`px-4 py-2 text-white rounded cursor-pointer ${
                uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
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
      </div>
    </div>
  );
};

export default InformationForm;
