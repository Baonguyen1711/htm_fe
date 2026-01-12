import React, { useEffect, useState } from 'react';
import useRoomApi from '../../../shared/hooks/api/useRoomApi';

interface PlayerRound {
  avatar: string;
  isCorrect: boolean | null;
  isModified: boolean | null;
  playerName: string;
  roundScore: number;
  stt: string;
}

interface RoomData {
  created_at: string;
  room_id: string;
  round_1: PlayerRound[];
  round_2: PlayerRound[];
  round_3: PlayerRound[] | null;
  round_4: PlayerRound[];
}

const ViewHistory: React.FC = () => {
  const [roomDataList, setRoomDataList] = useState<RoomData[]>([]);
  const { retrieveHistory } = useRoomApi();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await retrieveHistory();
        setRoomDataList(history);
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };
    fetchHistory();
  }, []);

  const calculateTotalScore = (playerName: string, room: RoomData): number => {
    let total = 0;
    const rounds: (PlayerRound[] | null)[] = [room.round_1, room.round_2, room.round_3, room.round_4];
    rounds.forEach(round => {
      if (round) {
        const player = round.find(p => p.playerName === playerName);
        if (player) total += player.roundScore;
      }
    });
    return total;
  };

  const getUniquePlayers = (room: RoomData): PlayerRound[] => {
    const map = new Map<string, PlayerRound>();
    [room.round_1, room.round_2, room.round_3, room.round_4].forEach(round => {
      if (round) {
        round.forEach(p => {
          if (!map.has(p.playerName)) map.set(p.playerName, p);
        });
      }
    });
    return Array.from(map.values());
  };

  if (roomDataList.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-8xl mb-8 opacity-40">📜</div>
        <h2 className="text-3xl font-bold text-white mb-4">Chưa có lịch sử trận đấu</h2>
        <p className="text-xl ">Khi bạn tổ chức trận đấu, kết quả sẽ hiển thị tại đây</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Title */}
      {/* <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Lịch Sử Trận Đấu</h2>
        <p className="text-lg ">Xem chi tiết kết quả các trận đã tổ chức</p>
      </div> */}

      {/* Room Cards */}
      {roomDataList.map((room) => (
        <div
          key={room.room_id}
          className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Room Header */}
          <div className="p-6 border-b border-cyan-700/30 bg-slate-700/40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🏠</span>
                Phòng {room.room_id}
              </h3>
              <p className=" text-base">
                {new Date(room.created_at).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-stale font-medium text-sm">Người chơi</th>
                  <th className="px-6 py-4 text-center text-stale font-medium text-sm">Vòng 1</th>
                  <th className="px-6 py-4 text-center text-stale font-medium text-sm">Vòng 2</th>
                  <th className="px-6 py-4 text-center text-stale font-medium text-sm">Vòng 3</th>
                  <th className="px-6 py-4 text-center text-stale font-medium text-sm">Vòng 4</th>
                  <th className="px-6 py-4 text-center text-stale font-medium text-sm">Tổng điểm</th>
                </tr>
              </thead>
              <tbody>
                {getUniquePlayers(room).map((player) => (
                  <tr
                    key={player.playerName}
                    className="border-t border-cyan-700/20 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={player.avatar}
                          alt={player.playerName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400/50"
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/48?text=Avatar')}
                        />
                        <span className="text-white font-medium text-lg">{player.playerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-white text-lg">
                      {room.round_1
                        ? room.round_1.find(p => p.playerName === player.playerName)?.roundScore ?? '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-5 text-center text-white text-lg">
                      {room.round_2
                        ? room.round_2.find(p => p.playerName === player.playerName)?.roundScore ?? '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-5 text-center text-white text-lg">
                      {room.round_3
                        ? room.round_3.find(p => p.playerName === player.playerName)?.roundScore ?? '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-5 text-center text-white text-lg">
                      {room.round_4
                        ? room.round_4.find(p => p.playerName === player.playerName)?.roundScore ?? '-'
                        : '-'}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-2xl font-bold ">
                        {calculateTotalScore(player.playerName, room)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewHistory;