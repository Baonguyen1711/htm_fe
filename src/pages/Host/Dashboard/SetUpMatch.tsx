import React, { useEffect, useState } from 'react';
import tokenRefreshService from '../../../shared/services/auth/tokenRefresh';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/auth.service';
import { useAppDispatch } from '../../../app/store';
import { setMode, setScoreRules } from '../../../app/store/slices/gameSlice';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import useRoomApi from '../../../shared/hooks/api/useRoomApi';
import { Button } from '../../../shared/components/ui';
import useTestApi from '../../../shared/hooks/api/useTestApi';
import { toast } from 'react-toastify';

interface Room {
  roomId: string;
  isActive: boolean;
  mode: 'manual' | 'auto' | 'adaptive' | 'multiplayer_manual' | 'multiplayer_auto';
  roomMode: "room" | "multiplayer";
  selectedTestName: string;
  randomQuestionCount?: number;
  catergory?: string;
  roundScores: {
    round1: number[];
    round2: number[];
    round3: number;
    round4: number[];
  };
  round4Levels?: {
    easy: boolean;
    medium: boolean;
    hard: boolean;
  };
}

const SetupMatch: React.FC = () => {
  const ROUND_TYPE_MAP: Record<string, number> = {
    'câu hỏi đơn (tự luận/trắc nghiệm)': 1,
    'vượt chướng ngại vật': 2,
    'gói câu hỏi': 3,
    'đối đầu trực tiếp (tô màu bảng/ câu hỏi đơn)': 4,
  };

  const ROUND_TYPE_NAMES = Object.keys(ROUND_TYPE_MAP);
  const ROUND_TYPE_INVERSE = Object.fromEntries(
    Object.entries(ROUND_TYPE_MAP).map(([k, v]) => [v, k])
  );

  const LEVELS = ['easy', 'medium', 'hard'] as const;
  type LevelKey = typeof LEVELS[number]; // 'easy' | 'medium' | 'hard'

  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [selectedRoomForFormat, setSelectedRoomForFormat] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [roomMode, setRoomMode] = useState<"room" | "multiplayer">("room");
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [testList, setTestList] = useState<string[]>([]);
  const [roundCount, setRoundCount] = useState(4);
  const [roundTypes, setRoundTypes] = useState<Record<string, number[]>>({});
  const defaultMapping = Array.from({ length: roundCount }, (_, i) => i + 1);
  const mapping = roundTypes[selectedRoomForFormat || ""] || defaultMapping;


  const dispatch = useAppDispatch();
  const { setGameScoreRules, addRoundMapping } = useGameApi();
  const { createRoom, getRoomsByUid, addTestNameToRoom } = useRoomApi();
  const { getTestsNameByUserId, getRandomQuestions } = useTestApi();

  // ==================== LOAD DATA ====================
  useEffect(() => {
    const loadData = async () => {
      try {
        const tests = await getTestsNameByUserId();
        localStorage.setItem('testList', JSON.stringify(tests));
        setTestList(tests);

        const data = await getRoomsByUid();
        setRooms(data.map((room: any) => ({
          ...room,
          mode: 'manual' as const,
          selectedTestName: tests.length > 0 ? tests[0] : '',
          roundScores: {
            round1: [15, 10, 10, 10],
            round2: [15, 10, 10, 10],
            round3: 10,
            round4: [10, 20, 30],
          },
          round4Levels: { easy: true, medium: true, hard: true },
        })));
      } catch (err) {
        toast.error('Không thể tải dữ liệu!');
      }
    };
    loadData();
  }, []);

  // ==================== HANDLERS ====================
  const handleTestChange = (roomId: string, testName: string) => {
    setRooms(rooms.map(r => r.roomId === roomId ? { ...r, selectedTestName: testName } : r));
  };

  const handleModeChange = (roomId: string, mode: Room['mode']) => {
    setRooms(rooms.map(r => r.roomId === roomId ? { ...r, mode } : r));
  };

  const handleScoreChange = (roomId: string, round: 'round1' | 'round2' | 'round3' | 'round4', index: number | null, value: number) => {
    setRooms(prev => prev.map(room => {
      if (room.roomId !== roomId) return room;
      if (round === 'round3') {
        return { ...room, roundScores: { ...room.roundScores, round3: value } };
      }
      const scores = [...room.roundScores[round]];
      if (index !== null) scores[index] = value;
      return { ...room, roundScores: { ...room.roundScores, [round]: scores } };
    }));
  };

  const handleRound4LevelChange = (roomId: string, level: 'easy' | 'medium' | 'hard', checked: boolean) => {
    setRooms(prev => prev.map(room => {
      if (room.roomId !== roomId) return room;
      const levels = room.round4Levels || { easy: true, medium: true, hard: true };
      const newLevels = { ...levels, [level]: checked };
      if (Object.values(newLevels).filter(Boolean).length === 0) return room;
      return { ...room, round4Levels: newLevels };
    }));
  };

  const handleStartClick = async (roomId: string, testName: string) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return toast.error('Không tìm thấy phòng!');

    let finalTestName = testName;
    if (testName === "__random__") {
      const result = await getRandomQuestions(room.randomQuestionCount || 10);
      finalTestName = result.testName;
      localStorage.setItem('testId', result.testId);
    }

    try {
      const response = await authService.getAccessToken({
        roomId,
        testName: finalTestName,
        roomMode: room.roomMode,
        playMode: room.mode.includes('multiplayer') ? (room.mode === 'multiplayer_auto' ? 'auto' : 'manual') : undefined,
      });

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem(`mode_${roomId}`, room.mode);
      tokenRefreshService.startAutoRefresh(response.accessToken);

      const scoreRules = { ...room.roundScores, round4Levels: room.round4Levels };
      localStorage.setItem(`scoreRules_${roomId}`, JSON.stringify(scoreRules));
      dispatch(setScoreRules(scoreRules));
      await setGameScoreRules(scoreRules, roomId);
      await addTestNameToRoom(roomId, finalTestName);

      if (room.roomMode === "multiplayer") {
        navigate(`/host/lobby?roomId=${roomId}&testName=${finalTestName}&roomMode=multiplayer&playMode=${room.mode === 'multiplayer_auto' ? 'auto' : 'manual'}`);
      } else {
        navigate(`/host?round=1&roomId=${roomId}&testName=${finalTestName}`);
      }
    } catch (err) {
      toast.error('Lỗi khi bắt đầu trận đấu!');
    }
  };

  const handleCreateRoom = async () => {
    try {
      const data = await createRoom({
        expired_time: 2,
        max_players: maxPlayers,
        password: roomPassword || undefined,
        roomMode,
      });

      const newRoom: Room = {
        roomId: data.roomId,
        isActive: data.isActive,
        mode: 'manual',
        roomMode,
        selectedTestName: testList[0] || '',
        roundScores: { round1: [15, 10, 10, 10], round2: [15, 10, 10, 10], round3: 10, round4: [10, 20, 30] },
        round4Levels: { easy: true, medium: true, hard: true },
      };

      setRooms(prev => [...prev, newRoom]);
      setCreatedRoomId(data.roomId);
      setShowSuccessModal(true);
      setShowCreateModal(false);
      setRoomPassword('');
      setMaxPlayers(4);
    } catch (err) {
      toast.error('Tạo phòng thất bại!');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      {/* <div className="text-center">
        <p className="text-lg">Tạo và quản lý phòng thi trực tuyến</p>
      </div> */}

      {/* Create Button + Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">

        <button
          onClick={() => setShowCreateModal(true)}
          className={`px-6 py-3 rounded-xl font-medium transition-all bg-slate-700/50  hover:bg-slate-700`}
        >
          Tạo Phòng Mới
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setRoomMode("room")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${roomMode === "room" ? "bg-slate-800/60 shadow-lg" : "bg-slate-700/50  hover:bg-slate-700"}`}
          >
            Phòng thi đơn
          </button>
          <button
            onClick={() => setRoomMode("multiplayer")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${roomMode === "multiplayer" ? "bg-slate-800/60  shadow-lg" : "bg-slate-700/50  hover:bg-slate-700"}`}
          >
            Nhiều người chơi
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-cyan-700/30">
          <h3 className="text-xl font-semibold text-white">Danh sách phòng {roomMode === "multiplayer" ? "nhiều người chơi" : "thi đơn"}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/40">
              <tr>
                <th className="px-6 py-4 text-left  font-medium text-sm">Mã phòng</th>
                <th className="px-6 py-4 text-left  font-medium text-sm">Bộ đề</th>
                <th className="px-6 py-4 text-left  font-medium text-sm">Cấu hình</th>
                <th className="px-6 py-4 text-left  font-medium text-sm">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms
                .filter(r => r.roomMode === roomMode)
                .map(room => (
                  <tr key={room.roomId} className="border-t border-cyan-700/20 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-5 font-mono text-white">{room.roomId}</td>
                    <td className="px-6 py-5">
                      <select
                        value={room.selectedTestName}
                        onChange={(e) => handleTestChange(room.roomId, e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/60 border border-cyan-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="">-- Chọn bộ đề --</option>
                        {testList.map(t => <option key={t} value={t}>{t}</option>)}
                        {roomMode === "multiplayer" && <option value="__random__">🎲 Ngẫu nhiên</option>}
                      </select>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {/* Cấu hình chung */}
                      <div className="space-y-5">
                        {roomMode === "room" && (
                          <>
                            <div>
                              <p className=" font-medium mb-2">Chế độ chấm điểm</p>
                              <div className="flex gap-5">
                                <label className="flex items-center gap-2">
                                  <input type="radio" checked={room.mode === 'auto'} onChange={() => handleModeChange(room.roomId, 'auto')} className="text-cyan-400" />
                                  <span className="text-white">Tự động (thời gian)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input type="radio" checked={room.mode === 'adaptive'} onChange={() => handleModeChange(room.roomId, 'adaptive')} className="text-cyan-400" />
                                  <span className="text-white">Tự động (số lượng)</span>
                                </label>
                              </div>
                            </div>

                            {/* Điểm theo vòng - gọn gàng */}
                            <div className="bg-slate-700/40 rounded-xl p-5 space-y-5">
                              <div className="grid grid-cols-2 gap-6">
                                {['Vòng 1', 'Vòng 2'].map((label, i) => (
                                  <div key={i}>
                                    <p className=" font-medium mb-2">{label}</p>
                                    <div className="grid grid-cols-4 gap-2">
                                      {[1, 2, 3, 4].map(pos => (
                                        <input
                                          key={pos}
                                          type="number"
                                          min="0"
                                          value={i === 0 ? room.roundScores.round1[pos - 1] : room.roundScores.round2[pos - 1]}
                                          onChange={(e) => handleScoreChange(room.roomId, i === 0 ? 'round1' : 'round2', pos - 1, parseInt(e.target.value) || 0)}
                                          className="px-2 py-2 bg-slate-600/60 border border-cyan-500/40 rounded-lg text-center text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div>
                                <p className=" font-medium mb-2">Vòng 3 (gói câu hỏi)</p>
                                <input
                                  type="number"
                                  min="0"
                                  value={room.roundScores.round3}
                                  onChange={(e) => handleScoreChange(room.roomId, 'round3', null, parseInt(e.target.value) || 0)}
                                  className="w-32 px-3 py-2 bg-slate-600/60 border border-cyan-500/40 rounded-lg text-white"
                                />
                              </div>

                              <div>
                                <p className=" font-medium mb-2">Vòng 4 (đối đầu)</p>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  {['Dễ', 'Trung bình', 'Khó'].map((l, i) => (
                                    <input
                                      key={i}
                                      type="number"
                                      min="0"
                                      value={room.roundScores.round4[i]}
                                      onChange={(e) => handleScoreChange(room.roomId, 'round4', i, parseInt(e.target.value) || 0)}
                                      className="px-3 py-2 bg-slate-600/60 border border-cyan-500/40 rounded-lg text-center text-white"
                                    />
                                  ))}
                                </div>
                                <div className="flex gap-5">
                                  {LEVELS.map((lvl: any) => (
                                    <label key={lvl} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={room.round4Levels?.[lvl as keyof typeof room.round4Levels] ?? true}
                                        onChange={(e) => handleRound4LevelChange(room.roomId, lvl, e.target.checked)}
                                        className="text-cyan-400"
                                      />
                                      <span className="text-white capitalize">{lvl}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {roomMode === "multiplayer" && (
                          <div>
                            <p className=" font-medium mb-2">Chế độ chuyển câu</p>
                            <div className="flex gap-5">
                              <label className="flex items-center gap-2">
                                <input type="radio" checked={room.mode === 'multiplayer_auto'} onChange={() => handleModeChange(room.roomId, 'multiplayer_auto')} className="text-cyan-400" />
                                <span className="text-white">Tự động</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="radio" checked={room.mode === 'multiplayer_manual'} onChange={() => handleModeChange(room.roomId, 'multiplayer_manual')} className="text-cyan-400" />
                                <span className="text-white">Thủ công</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => handleStartClick(room.roomId, room.selectedTestName)}
                          variant="warning"
                          className="h-12 text-lg font-semibold shadow-xl"
                        >
                          Bắt đầu
                        </Button>
                        {roomMode === "room" && (
                          <Button
                            onClick={() => {
                              setSelectedRoomForFormat(room.roomId);
                              setRoundCount(prev => prev || 4);
                              setShowFormatModal(true);
                            }}
                            variant="secondary"
                            className="text-sm"
                          >
                            ⚙️ Tùy chỉnh format
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {rooms.filter(r => r.roomMode === roomMode).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-cyan-300">
                    Chưa có phòng nào. Hãy tạo phòng mới!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      {/* Tạo phòng */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white text-center mb-6">Tạo Phòng Mới</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setRoomMode("room")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${roomMode === "room" ? "bg-cyan-500  shadow-lg" : "bg-slate-700/50  hover:bg-slate-700"}`}
              >
                Phòng thi đơn
              </button>
              <button
                onClick={() => setRoomMode("multiplayer")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${roomMode === "multiplayer" ? "bg-cyan-500  shadow-lg" : "bg-slate-700/50  hover:bg-slate-700"}`}
              >
                Nhiều người chơi
              </button>
            </div>
            <div className="space-y-6">
              <input
                type="password"
                placeholder="Mật khẩu phòng (tùy chọn)"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-700/60 border border-cyan-500/50 rounded-xl text-white placeholder-cyan-400/50"
              />
              {roomMode === "room" && (
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-slate-700/60 border border-cyan-500/50 rounded-xl text-white"
                >
                  {[4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} người chơi</option>)}
                </select>
              )}
              <div className="flex gap-4">
                <Button onClick={() => setShowCreateModal(false)} variant="secondary" fullWidth className="h-12">
                  Hủy
                </Button>
                <Button onClick={handleCreateRoom} variant="success" fullWidth className="h-12 font-semibold">
                  Tạo phòng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thành công */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-4">Tạo phòng thành công!</h3>
            <p className="text-3xl font-mono text-cyan-400 mb-8 bg-slate-700/50 py-4 px-6 rounded-xl">{createdRoomId}</p>
            <Button onClick={() => setShowSuccessModal(false)} variant="primary" className="h-12 text-lg">
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* Tùy chỉnh format */}
      {showFormatModal && selectedRoomForFormat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Tùy Chỉnh Format - Phòng {selectedRoomForFormat}
            </h3>

            {(() => {
              // Lấy mapping hiện tại của phòng, nếu chưa có thì khởi tạo với 1 vòng mặc định
              let currentMapping = roundTypes[selectedRoomForFormat] || [0]; // ít nhất 1 vòng
              const roundCount = currentMapping.length;

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentMapping.map((currentType, i) => {
                      const roundNum = i + 1;

                      return (
                        <div
                          key={i}
                          className="bg-slate-700/50 rounded-xl p-6 border border-cyan-500/30 relative"
                        >
                          <button
                            onClick={() => {
                              if (roundCount <= 1) return; // không xóa nếu chỉ còn 1 vòng
                              setRoundTypes(prev => ({
                                ...prev,
                                [selectedRoomForFormat]: prev[selectedRoomForFormat].filter((_, idx) => idx !== i)
                              }));
                            }}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition"
                            title="Xóa vòng này"
                            disabled={roundCount <= 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          <h4 className="text-lg font-semibold text-white mb-4 pr-8">
                            Vòng {roundNum}
                          </h4>

                          <select
                            className="w-full px-4 py-3 rounded-lg bg-white text-black border border-gray-300 focus:border-cyan-500 focus:outline-none"
                            value={ROUND_TYPE_INVERSE[currentType] || ""}
                            onChange={(e) => {
                              const newType = ROUND_TYPE_MAP[e.target.value];
                              setRoundTypes(prev => ({
                                ...prev,
                                [selectedRoomForFormat]: prev[selectedRoomForFormat].map((t, idx) =>
                                  idx === i ? newType : t
                                )
                              }));
                            }}
                          >
                            {ROUND_TYPE_NAMES.map(name => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nút Thêm vòng - chỉ hiện khi chưa đủ 5 */}
                  {roundCount < 5 && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => {
                          setRoundTypes(prev => ({
                            ...prev,
                            [selectedRoomForFormat]: [...(prev[selectedRoomForFormat] || [0]), 0] // thêm vòng mới với type mặc định 0
                          }));
                        }}
                        variant="outline"
                        className="h-12 px-8 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm vòng
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 mt-10">
                    <Button
                      onClick={() => setShowFormatModal(false)}
                      variant="secondary"
                      className="h-12 px-8"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={async () => {
                        const mapping = roundTypes[selectedRoomForFormat] || [0];
                        await addRoundMapping(selectedRoomForFormat, mapping);
                        setShowFormatModal(false);
                      }}
                      variant="success"
                      className="h-12 px-8 font-semibold shadow-xl"
                    >
                      Lưu Format
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupMatch;