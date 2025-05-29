import React, { useEffect, useState } from 'react';
import { createRoom, getRoomById, deactivateRoom } from './service';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';

interface Room {
  roomId: string;
  isActive: boolean;
}

const SetupMatch: React.FC = () => {
  const navigate = useNavigate()
  const [currentRound, setCurrentRound] = useState<string>('');
  const [selectedTestName, setSelectedTestName] = useState<string>("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [createdRoomId, setCreatedRoomId] = useState<string>('');
  const [testList, setTestLits] = useState<[]>(JSON.parse(localStorage.getItem("testList") || ""))
  const {setRoomId} = usePlayer()

  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTestName(event.target.value);
  };

  const handleStartClick = (roomId: string, testName: string) => {
    setRoomId(roomId)
    navigate(`/host?round=1&roomId=${roomId}&testName=${testName}`)
  }

  useEffect(() => {
    const getRooms = async () => {
      const data = await getRoomById()
      console.log("rooms", rooms)
      setRooms(data.rooms)
    }

    getRooms()
  }, [])

  const handleCreateRoom = async () => {
    const data = await createRoom(2)
    const newRoom = { roomId: data.result.roomId, isActive: data.result.isActive };
    setRooms([...rooms, newRoom]);
    setCreatedRoomId(data.result.roomId);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Current Round:', currentRound);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="relative p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Thiết Lập Phòng Thi</h2>
        <p className="text-blue-200/80">Tạo và quản lý các phòng thi trực tuyến</p>
      </div>

      {/* Create Room Button */}
      <div className="mb-8">
        <button
          onClick={handleCreateRoom}
          className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-600 font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/25"
        >
          🏠 Tạo Phòng Mới
        </button>
      </div>

      {/* Update Round Form */}
      <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Cập Nhật Vòng Thi</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="currentRound" className="block text-blue-200 text-sm font-medium mb-2">
              Vòng Thi Hiện Tại
            </label>
            <input
              type="text"
              id="currentRound"
              value={currentRound}
              onChange={(e) => setCurrentRound(e.target.value)}
              className="w-full px-4 py-3 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              placeholder="Nhập vòng thi"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              Cập Nhật
            </button>
          </div>
        </form>
      </div>

      {/* Rooms Table */}
      <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-blue-400/30">
          <h3 className="text-xl font-semibold text-white">Danh Sách Phòng Thi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Mã Phòng</th>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Trạng Thái</th>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Bộ Đề</th>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.roomId} className="border-t border-blue-400/20 hover:bg-slate-600/30 transition-colors">
                  <td className="px-6 py-4 text-white font-mono">{room.roomId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      room.isActive 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {room.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      id="testSelect"
                      name="testSelect"
                      className="bg-slate-600/50 border border-blue-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      value={selectedTestName}
                      onChange={handleTestChange}
                    >
                      <option value="" disabled className="bg-slate-700">
                        -- Chọn bộ đề --
                      </option>
                      {testList.map((test) => (
                        <option key={test} value={test} className="bg-slate-700">
                          {test}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-700 hover:to-orange-600 font-medium transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                      onClick={() => handleStartClick(room.roomId, selectedTestName)}
                    >
                      🚀 BẮT ĐẦU
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-blue-200/70">
                    Chưa có phòng thi nào được tạo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-baseline justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/30 rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Tạo Phòng Thành Công!</h3>
              <p className="text-blue-200/80 mb-2">Mã phòng của bạn:</p>
              <p className="text-cyan-300 font-mono text-xl font-bold mb-6 bg-slate-700/50 py-2 px-4 rounded-lg">
                {createdRoomId}
              </p>
              <button
                onClick={handleCloseModal}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-600 font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupMatch;