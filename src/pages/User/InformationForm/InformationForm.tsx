import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { joinRoom } from "./services";
import { usePlayer } from "../../../context/playerContext";
import { User } from "../../../type";

const InformationForm = () => {

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const roomId = searchParams.get("roomid")
    const [username, setUsername] = useState("");
    const [playerNumber, setPlayerNumber] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const { setPlayers, players, setRoomId, setPlayerArray } = usePlayer()

    const defaultAvatar = "https://via.placeholder.com/100"; // Default avatar link

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };
    const handleSubmit = async () => {
        if (username && playerNumber && roomId && avatar) {
            console.log("Username:", username);
            console.log("Player Number:", playerNumber);
            console.log("Avatar:", avatar || defaultAvatar);

            const result = await joinRoom(roomId, {
                userName: username,
                stt: playerNumber,
                avatar: avatar
            })
            setPlayers(result.players)
            setRoomId(roomId)
            console.log("players", players)
            console.log("result", result)
            navigate(`/play?round=1&roomId=${roomId}`)
        } else {
            alert("Vui lòng nhập tên người dùng và chọn số thứ tự!");
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
                        src={avatar || defaultAvatar}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full mx-auto mb-2"
                    />
                    <label className="block">
                        <span className="sr-only">Chọn ảnh đại diện</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                        <span className="px-4 py-2 text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-600">
                            Tải ảnh đại diện
                        </span>
                    </label>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Xác nhận
                </button>
            </div>
        </div>
    );
};

export default InformationForm;
