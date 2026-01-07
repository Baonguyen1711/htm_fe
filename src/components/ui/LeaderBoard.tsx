import React from "react";
import { ExternalLink, Trophy, Medal, Award } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useMemo } from "react";

interface PlayerResult {
  uid: string;
  userName: string;
  score?: number;
  avatar?: string;
  answers?: { isCorrect: boolean }[]; // cho multiplayer
  answer?: string;     // cho room mode (tự luận)
  time?: number;       // thời gian trả lời (giây)
}

interface LeaderboardProps {
  isHost?: boolean;
  currentQuestion?: number;
  onOpenNewTab?: () => void;
  isRoomMode?: boolean; // mới thêm
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  isHost = false,
  currentQuestion = 0,
  onOpenNewTab,
  isRoomMode = false,
}) => {
  const { scoresRanking } = useAppSelector(state => state.game);

  const sortedPlayers = useMemo(() => {
    if (!Array.isArray(scoresRanking)) return [];
    return [...scoresRanking].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [scoresRanking]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="w-6 h-6 text-amber-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-slate-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-white/60">{rank + 1}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400" />
          Bảng Xếp Hạng
        </h3>
        {onOpenNewTab && (
          <button
            onClick={onOpenNewTab}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/70 text-white/70 text-sm hover:bg-slate-600 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Mở tab mới
          </button>
        )}
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedPlayers.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            Chưa có dữ liệu xếp hạng
          </div>
        ) : (
          sortedPlayers.map((player, idx) => (
            <div
              key={player.uid}
              className={`rounded-xl p-4 transition-all border ${
                idx === 0
                  ? "bg-amber-500/20 border-amber-500/40"
                  : idx === 1
                  ? "bg-slate-400/10 border-slate-400/30"
                  : idx === 2
                  ? "bg-amber-700/20 border-amber-700/40"
                  : "bg-slate-700/40 border-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center shadow-inner">
                  {getRankIcon(idx)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 flex-shrink-0 ring-2 ring-white/20">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-white font-bold text-lg">
                      {player.userName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{player.userName}</p>

                  {/* === ROOM MODE: hiển thị answer + time === */}
                  {isRoomMode ? (
                    <div className="mt-2 space-y-1">
                      {player.answer ? (
                        <>
                          <p className="text-cyan-300 text-sm">
                            <span className="font-medium">Trả lời:</span> {player.answer}
                          </p>
                          {player.time !== undefined && (
                            <p className="text-amber-400 text-sm">
                              <span className="font-medium">Thời gian:</span> {player.time.toFixed(1)}s
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-white/50 text-sm italic">Chưa trả lời</p>
                      )}
                    </div>
                  ) : (
                    /* === MULTIPLAYER MODE: hiển thị điểm === */
                    <p className="text-2xl font-bold text-cyan-300 mt-1">
                      {player.score ?? 0} điểm
                    </p>
                  )}
                </div>
              </div>

              {/* === Lịch sử trả lời - chỉ hiện khi multiplayer và isHost === */}
              {!isRoomMode && isHost && player.answers && player.answers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-white/60 text-xs mb-2">Lịch sử trả lời:</p>
                  <div className="flex flex-wrap gap-2">
                    {player.answers.map((ans, qIdx) => (
                      <div
                        key={qIdx}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                          qIdx === currentQuestion - 1
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800"
                            : ""
                        } ${ans.isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                      >
                        {qIdx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;