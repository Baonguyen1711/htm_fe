import { Trophy, Medal, Award } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAppSelector } from "../app/store";
import { useSearchParams } from "react-router-dom";
import { useFirebaseListener } from "../shared/hooks";

export function ScoreRanking() {
  const [params] = useSearchParams();
  const round = params.get("round") || "1";
  const roomId = params.get("roomId") || "1";
  const isRoomOwner = params.get("isRoomOwner") === "true";
  const roomMode = params.get("roomMode") || "manual";
  const playMode = params.get("playMode") || "manual";
  const { scoresRanking } = useAppSelector(state => state.game);

  const { listenToScoresRanking } = useFirebaseListener()

  useEffect(() => {
    const unsubscribeScores = listenToScoresRanking(() => { });
    return () => {
      unsubscribeScores();
    };
  }, [roomId]);


  const sortedScoresRanking = Array.isArray(scoresRanking)
    ? [...scoresRanking].sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0)
    )
    : [];

  console.log("sortedScoresRanking", sortedScoresRanking)

  // const sortedPlayers = useMemo(() => {
  //   if (!Array.isArray(scoresRanking)) return [];
  //   return [...scoresRanking].sort(
  //     (a, b) => (b.score ?? 0) - (a.score ?? 0)
  //   );
  // }, [scoresRanking]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="text-yellow-400" size={18} />;
      case 1:
        return <Medal className="text-gray-300" size={18} />;
      case 2:
        return <Award className="text-orange-400" size={18} />;
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center text-cyan-300 text-xs">
            {index + 1}
          </div>
        );
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border-yellow-400/50 shadow-lg shadow-yellow-500/10";
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-slate-500/20 border-gray-400/50 shadow-lg shadow-gray-400/10";
      case 2:
        return "bg-gradient-to-r from-orange-500/20 to-amber-700/20 border-orange-400/50 shadow-lg shadow-orange-500/10";
      default:
        return "bg-blue-900/30 border-cyan-600/30";
    }
  };

  return (
  <div className="bg-gradient-to-br from-cyan-800/40 to-blue-900/40 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl">
    
    {/* CONTENT */}
    <div
      className="
        space-y-2
        min-h-[260px]     /* 👈 luôn đủ 4 hàng */
        flex
        flex-col
        justify-start
      "
    >
      {sortedScoresRanking.map((player, index) => (
        <div
          key={player.uid}
          className={`relative overflow-hidden rounded-lg border-2 p-2.5 transition-all duration-300 hover:scale-105 ${getRankStyle(index)}`}
        >
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm border-2 border-cyan-400/50 shadow-lg flex-shrink-0 overflow-hidden">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {player.userName?.charAt(0)}
                </span>
              )}
            </div>

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <div className="text-cyan-50 text-sm truncate pr-6">
                {player.userName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="text-cyan-300 text-xs">Score:</div>
                <div className="text-cyan-100 text-xs font-bold">
                  {player.score}
                </div>
              </div>
            </div>
          </div>

          {/* Background rank number */}
          {index < 3 && (
            <div className="absolute bottom-0 right-0 opacity-10 text-6xl leading-none pr-1 pb-0 select-none pointer-events-none text-white">
              {index + 1}
            </div>
          )}
        </div>
      ))}

      {/* 👇 Fill empty slots nếu < 4 */}
      {sortedScoresRanking.length < 4 &&
        Array.from({ length: 4 - sortedScoresRanking.length }).map(
          (_, i) => (
            <div
              key={`empty-${i}`}
              className="h-[56px] rounded-lg border border-cyan-500/20 bg-blue-900/20 opacity-40"
            />
          )
        )}
    </div>
  </div>
);

}
