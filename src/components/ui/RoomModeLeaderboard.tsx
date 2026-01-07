import { ExternalLink, Trophy, Medal, Award } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useEffect, useMemo } from "react";
import useFirebaseListener from "../../shared/hooks/firebase/useFirebaseListener";
import { useSearchParams } from "react-router-dom";

interface PlayerResult {
    id: number;
    name: string;
    score: number;
    avatar?: string;
    answerHistory?: ("correct" | "wrong" | "pending")[];
}

interface LeaderboardProps {
    isHost?: boolean;
    currentQuestion?: number;
    onOpenNewTab?: () => void;
}

const RoomModeLeaderboard = ({ isHost = false, currentQuestion = 0, onOpenNewTab }: LeaderboardProps) => {
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
    }, []);


    const sortedScoresRanking = Array.isArray(scoresRanking)
        ? [...scoresRanking].sort(
            (a, b) => (b.score ?? 0) - (a.score ?? 0)
        )
        : [];

    console.log("sortedScoresRanking", sortedScoresRanking)

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 0:
                return <Trophy className="w-5 h-5 text-amber-400" />;
            case 1:
                return <Medal className="w-5 h-5 text-slate-300" />;
            case 2:
                return <Award className="w-5 h-5 text-amber-600" />;
            default:
                return <span className="w-5 h-5 flex items-center justify-center text-white/50 text-sm font-medium">{rank + 1}</span>;
        }
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    {/* <Trophy className="w-5 h-5 text-amber-400" /> */}
                    Bảng Xếp Hạng
                </h3>
                {onOpenNewTab && (
                    <button
                        onClick={onOpenNewTab}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 text-white/70 text-sm hover:bg-slate-600 transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Mở tab mới
                    </button>
                )}
            </div>

            {/* Player List - Luôn hiển thị đúng 4 slot (thật + placeholder nếu cần) */}
            <div className="flex-1 overflow-hidden p-4 pt-2">
                <div className="space-y-3">
                    {/* Luôn lấy tối đa 4 người chơi đầu tiên */}
                    {sortedScoresRanking.slice(0, 4).map((player, idx) => (
                        <div
                            key={player.uid}
                            className={`rounded-xl p-4 transition-all duration-300 shadow-md ${idx === 0
                                    ? "bg-amber-500/20 border-2 border-amber-500/50"
                                    : idx === 1
                                        ? "bg-slate-400/15 border border-slate-400/40"
                                        : idx === 2
                                            ? "bg-amber-700/20 border border-amber-700/50"
                                            : "bg-slate-700/40 border border-white/20"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                {/* <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-inner">
                                    {getRankIcon(idx)}
                                </div> */}

                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                                    {player.avatar ? (
                                        <img src={player.avatar} alt={player.userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold text-lg">
                                            {player.userName?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Name & Score */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold truncate">
                                        {player.userName}
                                    </p>
                                    <p className="text-cyan-300 text-lg font-bold">
                                        {player.score} điểm
                                    </p>
                                </div>

                                {/* Trophy cho top 1 */}
                                {/* {idx === 0 && <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />} */}
                            </div>
                        </div>
                    ))}

                    {/* Placeholder để đủ 4 slot nếu thiếu người */}
                    {[...Array(Math.max(0, 4 - sortedScoresRanking.length))].map((_, i) => (
                        <div
                            key={`placeholder-${i}`}
                            className="rounded-xl p-4 bg-slate-800/30 border border-dashed border-white/20 flex items-center gap-4 opacity-60"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-700/50" />
                            <div className="w-12 h-12 rounded-full bg-slate-700/50" />
                            <div className="flex-1">
                                <div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div>
                                <div className="h-5 bg-slate-700/40 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nếu có >4 người → hiển thị thông báo nhỏ bên dưới */}
                {sortedScoresRanking.length > 4 && (
                    <div className="mt-4 pt-3 border-t border-white/10 text-center">
                        <p className="text-white/60 text-sm">
                            Và {sortedScoresRanking.length - 4} người chơi khác...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomModeLeaderboard;
