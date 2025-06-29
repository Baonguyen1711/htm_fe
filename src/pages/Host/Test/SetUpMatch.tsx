import React, { useEffect, useState } from 'react';
import { createRoom, getRoomById, deactivateRoom } from './service';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';
import { useHost } from '../../../context/hostContext';
import roomService from '../../../services/room.service';
import authService from '../../../services/auth.service';
import { setRoomRules } from './service';

interface Room {
  roomId: string;
  isActive: boolean;
  mode: 'manual' | 'auto' | "adaptive";
  roundScores: {
    round1: number[];
    round2: number[];
    round3: number;
    round4: number[]
  };
}

const SetupMatch: React.FC = () => {
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState<string>('');
  const [selectedTestName, setSelectedTestName] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [roomPassword, setRoomPassword] = useState<string>('');

  const [createdRoomId, setCreatedRoomId] = useState<string>('');
  const [testList] = useState<[]>(JSON.parse(localStorage.getItem('testList') || '[]'));
  const { setRoomId } = usePlayer();
  const { mode, setMode, rules, setRules } = useHost()

  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTestName(event.target.value);
  };

  const handleStartClick = async (roomId: string, testName: string) => {
    setRoomId(roomId);
    const response = await authService.getAccessToken({
      roomId: roomId,
    });

    console.log('response', response);

    const accessToken = response.accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem(`mode_${roomId}`, mode)
    setRoomRules(roomId, rules)
    navigate(`/host?round=1&roomId=${roomId}&testName=${testName}`);
  };

  useEffect(() => {
    const getRooms = async () => {
      const data = await roomService.getRoomByUser();
      console.log('rooms', data.rooms);
      setRooms(
        data.rooms.map((room: { roomId: string; isActive: boolean }) => ({
          ...room,
          mode: 'manual',
          roundScores: {
            round1: [15, 10, 10, 10],
            round2: [15, 10, 10, 10],
            round3: 10,
            round4: [10, 20, 30]
          },
        })),
      );
    };

    getRooms();
  }, []);

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleConfirmCreateRoom = async () => {
    const data = await roomService.createRoom(2, roomPassword || undefined);
    const newRoom: Room = {
      roomId: data.result.roomId,
      isActive: data.result.isActive,
      mode: 'manual',
      roundScores: {
        round1: [15, 10, 10, 10],
        round2: [15, 10, 10, 10],
        round3: 10,
        round4: [10, 20, 30]
      },
    };
    setRooms([...rooms, newRoom]);
    setCreatedRoomId(data.result.roomId);
    setShowCreateModal(false);
    setRoomPassword('');
    setShowModal(true);
  };

  const handleModeChange = (roomId: string, mode: 'manual' | 'auto' | "adaptive") => {
    setRooms(rooms.map((room) => (room.roomId === roomId ? { ...room, mode } : room)));
  };

  const handleScoreChange = (
    roomId: string,
    round: 'round1' | 'round2' | 'round3' | 'round4',
    index: number | null,
    value: number,
  ) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.roomId === roomId) {
          let newRoundScores;

          if (round === 'round3') {
            newRoundScores = {
              ...room.roundScores,
              round3: value,
            };
          } else {
            const newScores = [...room.roundScores[round]];
            if (index !== null) {
              newScores[index] = value;
            }
            newRoundScores = {
              ...room.roundScores,
              [round]: newScores,
            };
          }

          console.log("new roundScores:", newRoundScores);
          setRules(newRoundScores)

          return {
            ...room,
            roundScores: newRoundScores,
          };
        }
        return room;
      })
    );
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
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Chế Độ</th>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.roomId} className="border-t border-blue-400/20 hover:bg-slate-600/30 transition-colors">
                  <td className="px-6 py-4 text-white font-mono">{room.roomId}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${room.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                    >
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
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`mode-${room.roomId}`}
                          value="manual"
                          checked={room.mode === 'manual'}
                          onChange={() => {
                            handleModeChange(room.roomId, 'manual')
                            setMode('manual')
                          }}
                          className="text-blue-400 focus:ring-blue-400"
                        />
                        <span className="text-white">Thủ công</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`mode-${room.roomId}`}
                          value="auto"
                          checked={room.mode === 'auto'}
                          onChange={() => {
                            handleModeChange(room.roomId, 'auto')
                            setMode("auto")
                          }}
                          className="text-blue-400 focus:ring-blue-400"
                        />
                        <span className="text-white">Tự động chấm theo thời gian</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`mode-${room.roomId}`}
                          value="adaptive"
                          checked={room.mode === 'adaptive'}
                          onChange={() => {
                            handleModeChange(room.roomId, 'adaptive')
                            setMode("adaptive")
                          }}
                          className="text-blue-400 focus:ring-blue-400"
                        />
                        <span className="text-white">Tự động chấm theo số lượng</span>
                      </label>
                    </div>
                    {room.mode === 'auto' && (
                      <div className="mt-4 bg-slate-600/30 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Cấu hình điểm</h4>
                        {/* Round 1 */}
                        <div className="mb-4">
                          <h5 className="text-blue-200 font-medium">Vòng 1</h5>
                          <div className="grid grid-cols-4 gap-2">
                            {['Top 1', 'Top 2', 'Top 3', 'Top 4'].map((label, index) => (
                              <div key={index} className="flex flex-col">
                                <label className="text-blue-200 text-sm">{label}</label>
                                <input
                                  type="number"
                                  value={room.roundScores.round1[index]}
                                  onChange={(e) =>
                                    handleScoreChange(room.roomId, 'round1', index, parseInt(e.target.value))
                                  }
                                  className="w-full px-2 py-1 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  min="0"
                                />
                              </div>
                            ))}

                          </div>
                        </div>
                        {/* Round 2 */}
                        <div className="mb-4">
                          <h5 className="text-blue-200 font-medium">Vòng 2</h5>
                          <div className="grid grid-cols-4 gap-2">
                            {['Top 1', 'Top 2', 'Top 3', 'Top 4'].map((label, index) => (
                              <div key={index} className="flex flex-col">
                                <label className="text-blue-200 text-sm">{label}</label>
                                <input
                                  type="number"
                                  value={room.roundScores.round2[index]}
                                  onChange={(e) =>
                                    handleScoreChange(room.roomId, 'round2', index, parseInt(e.target.value))
                                  }
                                  className="w-full px-2 py-1 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  min="0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Round 3 */}
                        <div className="mb-4">
                          <h5 className="text-blue-200 font-medium">Vòng 3</h5>
                          <div className="flex flex-col">
                            <label className="text-blue-200 text-sm">Điểm cho tất cả câu hỏi</label>
                            <input
                              type="number"
                              value={room.roundScores.round3}
                              onChange={(e) =>
                                handleScoreChange(room.roomId, 'round3', null, parseInt(e.target.value))
                              }
                              className="w-full px-2 py-1 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                              min="0"
                            />
                          </div>
                        </div>
                        {/* Round 4 */}
                        {/* Round 4 */}
                        <div className="mb-4">
                          <h5 className="text-blue-200 font-medium">Vòng 4</h5>
                          <div className="grid grid-cols-3 gap-2">
                            {['Dễ', 'Trung bình', 'Khó'].map((label, index) => (
                              <div key={index} className="flex flex-col">
                                <label className="text-blue-200 text-sm">{label}</label>
                                <input
                                  type="number"
                                  value={room.roundScores.round4[index]}
                                  onChange={(e) =>
                                    handleScoreChange(room.roomId, 'round4', index, parseInt(e.target.value))
                                  }
                                  className="w-full px-2 py-1 bg-slate-600/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  min="0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {room.mode === "adaptive" && (
                      <div className="mt-4 bg-slate-600/30 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Số điểm giảm dần theo số lượng thí sinh trả lời đúng</h4>
                      </div>
                    )}
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
                  <td colSpan={5} className="text-center p-8 text-blue-200/70">
                    Chưa có phòng thi nào được tạo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/50 rounded-xl p-8 shadow-2xl sm:max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Tạo Phòng Mới</h3>
              <p className="text-blue-200/70 mb-4">Nhập mật khẩu cho phòng (tùy chọn):</p>
              <input
                type="password"
                placeholder="Mật khẩu phòng (để trống nếu không cần)"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium transition-colors duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmCreateRoom}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-600 font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                >
                  Tạo Phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-baseline justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/50 rounded-xl p-8 shadow-2xl sm:max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Tạo Phòng thành công!</h3>
              <p className="text-blue-200/70 mb-2">Mã phòng của bạn:</p>
              <p className="text-cyan-400 font-mono text-xl font-bold mb-6 bg-gray-800/50 py-3 px-4 rounded-md">{createdRoomId}</p>
              <button
                onClick={handleCloseModal}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-medium transition-colors duration-300 shadow-lg hover:shadow-blue-600/30"
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