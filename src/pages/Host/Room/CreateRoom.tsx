import React, { useState, useEffect } from "react";

import banner from "../../../assets/banner.jpg";
import card from "../../../assets/card.jpg"

import Footer from "../../../components/ui/Footer";
import Header from "../../../components/ui/Header";

function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="bg-white text-black">
      {/* Banner */}
      {/* <div
        className="relative w-full h-[400px] bg-cover bg-center"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div> */}
      {/* <Header/> */}

      {/* Cards */}
      {/* <div className="relative flex justify-center gap-6 py-10 -mt-40 max-w-5xl mx-auto">
        {[
          "Bản Lĩnh Hải Vương",
          "Vượt Thái Bình Dương",
          "Chinh Phục Đỉnh Cao",
          "Đương đầu Thử Thách",
        ].map((title, index) => (
          <div
            key={index}
            className="relative bg-white shadow-lg rounded-xl overflow-hidden w-52 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            <img
              src={card}
              alt={title}
              className="w-full h-60 object-cover rounded-xl"
            />
            <div className="absolute bottom-0 w-full bg-black/50 text-white text-sm font-semibold text-center py-1">
              {title}
            </div>
          </div>
        ))}
      </div> */}

      {/* Input fields for creating a room */}
      <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg mt-10 mb-10">
        <h2 className="text-xl font-bold text-center mb-6">
          Tạo Phòng Thi
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Tên Phòng"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Mã Phòng"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Mật Khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <button className="p-3 bg-black text-white rounded-lg hover:bg-gray-800">
            Tạo Phòng
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CreateRoom;
