import React, { useEffect, useState } from 'react';
import tokenRefreshService from '../../../shared/services/auth/tokenRefresh';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/auth.service';
import { useAppDispatch } from '../../../app/store';
import { setMode, setScoreRules } from '../../../app/store/slices/gameSlice';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import useRoomApi from '../../../shared/hooks/api/useRoomApi';
import { Button } from '../../../shared/components/ui';
import useAuthApi from '../../../shared/hooks/auth/useAuth';

interface Room {
  roomId: string;
  isActive: boolean;
  mode: 'manual' | 'auto' | "adaptive";
  selectedTestName: string;
  roundScores: {
    round1: number[];
    round2: number[];
    round3: number;
    round4: number[]
  };
  round4Levels?: {
    easy: boolean;
    medium: boolean;
    hard: boolean;
  };
}

const SetupMatch: React.FC = () => {
  const navigate = useNavigate();
  const [currentRound, setCurrentRound] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [roomPassword, setRoomPassword] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);

  const [createdRoomId, setCreatedRoomId] = useState<string>('');
  const [testList] = useState<[]>(JSON.parse(localStorage.getItem('testList') || '[]'));
  const dispatch = useAppDispatch();
  const { setGameScoreRules } = useGameApi();
  const { createRoom, getRoomsByUid } = useRoomApi();
  const handleTestChange = (roomId: string, testName: string) => {
    setRooms(rooms.map((room) =>
      room.roomId === roomId ? { ...room, selectedTestName: testName } : room
    ));
  };

  const handleStartClick = async (roomId: string, testName: string) => {
    // Find the room to check configuration
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) {
      alert('Không tìm thấy thông tin phòng!');
      return;
    }

    // Check if we have enough questions for Round 4
    const minQuestionsNeeded = maxPlayers * 5 * 3; // n * 5 * 3
    if (minQuestionsNeeded > 60) {
      alert(`Số lượng người chơi quá lớn! Cần tối thiểu ${minQuestionsNeeded} câu hỏi nhưng chỉ có 60 câu hỏi trong bộ đề. Vui lòng giảm số lượng người chơi xuống tối đa ${Math.floor(60 / 15)} người.`);
      return;
    }

    const response = await authService.getAccessToken({
      roomId: roomId,
    });

    console.log('response', response);

    const accessToken = response.accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem(`mode_${roomId}`, room.mode)

    // Start auto-refresh timer for the new access token
    tokenRefreshService.startAutoRefresh(accessToken);

    // Save room configuration including round4Levels
    const roomConfig = {
      ...room.roundScores,
      round4Levels: room.round4Levels
    };

    console.log("roomConfig", roomConfig);
    localStorage.setItem(`scoreRules_${roomId}`, JSON.stringify(roomConfig))
    dispatch(setScoreRules(roomConfig))
    await setGameScoreRules(roomConfig, roomId)

    navigate(`/host?round=1&roomId=${roomId}&testName=${testName}`);
  };

  useEffect(() => {
    const getRooms = async () => {
      const data = await getRoomsByUid();
      console.log('rooms', data);
      setRooms(
        data.map((room: { roomId: string; isActive: boolean }) => ({
          ...room,
          mode: 'manual',
          roundScores: {
            round1: [15, 10, 10, 10],
            round2: [15, 10, 10, 10],
            round3: 10,
            round4: [10, 20, 30]
          },
          round4Levels: {
            easy: true,
            medium: true,
            hard: true
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
    const data = await createRoom({
      expired_time: 2,
      max_players: maxPlayers,
      password: roomPassword || undefined,
    });
    console.log("data",data);
    
    const newRoom: Room = {
      roomId: data.roomId,
      isActive: data.isActive,
      mode: 'manual',
      selectedTestName: '',
      roundScores: {
        round1: [15, 10, 10, 10],
        round2: [15, 10, 10, 10],
        round3: 10,
        round4: [10, 20, 30]
      },
      round4Levels: {
        easy: true,
        medium: true,
        hard: true
      },
    };
    setRooms([...rooms, newRoom]);
    setCreatedRoomId(data.roomId);
    setShowCreateModal(false);
    setRoomPassword('');
    setMaxPlayers(4);
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

          return {
            ...room,
            roundScores: newRoundScores,
          };
        }
        return room;
      })
    );
  };

  const handleRound4LevelChange = (
    roomId: string,
    level: 'easy' | 'medium' | 'hard',
    checked: boolean
  ) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.roomId === roomId) {
          const currentLevels = room.round4Levels || { easy: true, medium: true, hard: true };
          const newLevels = {
            ...currentLevels,
            [level]: checked
          };

          // Ensure at least one level is selected
          const selectedCount = Object.values(newLevels).filter(Boolean).length;
          if (selectedCount === 0) {
            return room; // Don't allow deselecting all levels
          }

          return {
            ...room,
            round4Levels: newLevels,
          };
        }
        return room;
      })
    );
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log('Current Round:', currentRound);
  // };

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
        <Button
          onClick={handleCreateRoom}
          variant="success"
          size="lg"
          className="font-medium shadow-lg"
        >
          🏠 Tạo Phòng Mới
        </Button>
      </div>

      {/* Update Round Form */}
      {/* <div className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 mb-8">
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
      </div> */}

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
                {/* <th className="px-6 py-4 text-left text-blue-200 font-medium">Trạng Thái</th> */}
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Bộ Đề</th>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Chế Độ</th>
                <th className="px-6 py-4 text-left text-blue-200 font-medium">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.roomId} className="border-t border-blue-400/20 hover:bg-slate-600/30 transition-colors">
                  <td className="px-6 py-4 text-white font-mono">{room.roomId}</td>
                  {/* <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${room.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                    >
                      {room.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td> */}
                  <td className="px-6 py-4">
                    <select
                      id={`testSelect-${room.roomId}`}
                      name={`testSelect-${room.roomId}`}
                      className="bg-slate-600/50 border border-blue-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      value={room.selectedTestName}
                      onChange={(e) => handleTestChange(room.roomId, e.target.value)}
                    >
                      <option value="" disabled className="bg-slate-700">
                        -- Chọn bộ đề --
                      </option>
                      {testList && testList.map((test) => (
                        <option key={test} value={test} className="bg-slate-700">
                          {test}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">Chế độ chấm điểm (Vòng 1 & 2)</h4>
                      <div className="flex gap-4">
                        {/* <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`mode-${room.roomId}`}
                            value="manual"
                            checked={room.mode === 'manual'}
                            onChange={() => {
                              handleModeChange(room.roomId, 'manual')
                              dispatch(setMode("manual"))
                            }}
                            className="text-blue-400 focus:ring-blue-400"
                          />
                          <span className="text-white">Thủ công</span>
                        </label> */}
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`mode-${room.roomId}`}
                            value="auto"
                            checked={room.mode === 'auto'}
                            onChange={() => {
                              handleModeChange(room.roomId, 'auto')
                              dispatch(setMode("auto"))
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
                              dispatch(setMode("adaptive"))
                            }}
                            className="text-blue-400 focus:ring-blue-400"
                          />
                          <span className="text-white">Tự động chấm theo số lượng</span>
                        </label>
                      </div>
                    </div>
                    {/* Configuration for all rounds */}
                    <div className="mt-4 bg-slate-600/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Cấu hình điểm</h4>

                      {/* Round 1 & 2 - Only show when auto mode */}
                      {room.mode === 'auto' && (
                        <>
                          {/* Round 1 */}
                          <div className="mb-4">
                            <h5 className="text-blue-200 font-medium">Vòng 1 (Chấm theo thời gian)</h5>
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
                            <h5 className="text-blue-200 font-medium">Vòng 2 (Chấm theo thời gian)</h5>
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
                        </>
                      )}

                      {/* Round 3 & 4 - Always show */}
                      {/* Round 3 */}
                      <div className="mb-4">
                        <h5 className="text-blue-200 font-medium">Vòng 3 (Custom)</h5>
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
                      <div className="mb-4">
                        <h5 className="text-blue-200 font-medium">Vòng 4 - Điểm số (Custom)</h5>
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

                      {/* Round 4 Levels */}
                      <div className="mb-4">
                        <h5 className="text-blue-200 font-medium mb-2">Vòng 4 - Mức độ câu hỏi</h5>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'easy', label: 'Dễ (ô trống)', symbol: '□' },
                            { key: 'medium', label: 'Trung bình (!)', symbol: '!' },
                            { key: 'hard', label: 'Khó (?)', symbol: '?' }
                          ].map((level) => (
                            <div key={level.key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${room.roomId}-${level.key}`}
                                checked={room.round4Levels?.[level.key as keyof typeof room.round4Levels] || false}
                                onChange={(e) =>
                                  handleRound4LevelChange(room.roomId, level.key as 'easy' | 'medium' | 'hard', e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 bg-slate-600 border-blue-400 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`${room.roomId}-${level.key}`} className="text-blue-200 text-sm flex items-center">
                                <span className="mr-1 font-mono text-lg">{level.symbol}</span>
                                {level.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-blue-300 text-xs mt-2">
                          * Cần tối thiểu {(room.round4Levels?.easy ? 1 : 0) + (room.round4Levels?.medium ? 1 : 0) + (room.round4Levels?.hard ? 1 : 0) > 1 ?
                            `${Math.ceil(60 / ((room.round4Levels?.easy ? 1 : 0) + (room.round4Levels?.medium ? 1 : 0) + (room.round4Levels?.hard ? 1 : 0)))} câu hỏi mỗi mức` :
                            '60 câu hỏi'} cho {maxPlayers} người chơi
                        </p>
                      </div>
                    </div>


                  </td>
                  <td className="px-6 py-4">
                    <Button
                      onClick={() => handleStartClick(room.roomId, room.selectedTestName)}
                      variant="warning"
                      size="md"
                      className="font-medium shadow-lg"
                    >
                      🚀 BẮT ĐẦU
                    </Button>
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
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm z-50 pt-20">
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
                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm mb-4"
              />
              <div className="mb-6">
                <label className="block text-blue-200/70 text-sm mb-2">Số lượng người chơi tối đa:</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                >
                  <option value={4}>4 người chơi</option>
                  <option value={5}>5 người chơi</option>
                  <option value={6}>6 người chơi</option>
                  <option value={7}>7 người chơi</option>
                  <option value={8}>8 người chơi</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                  size="lg"
                  className="flex-1 font-medium"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmCreateRoom}
                  variant="success"
                  size="lg"
                  className="flex-1 font-medium shadow-lg"
                >
                  Tạo Phòng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 backdrop-blur-sm z-40 pt-20">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-400/50 rounded-xl p-8 shadow-2xl sm:max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Tạo Phòng thành công!</h3>
              <p className="text-blue-200/70 mb-2">Mã phòng của bạn:</p>
              <p className="text-cyan-400 font-mono text-xl font-bold mb-6 bg-gray-800/50 py-3 px-4 rounded-md">{createdRoomId}</p>
              <Button
                onClick={handleCloseModal}
                variant="primary"
                size="lg"
                className="font-medium shadow-lg"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupMatch;