import { ExternalLink, Trophy, Medal, Award } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useMemo } from "react";

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

const Leaderboard = ({ isHost = false, currentQuestion = 0, onOpenNewTab }: LeaderboardProps) => {
    const { scoresRanking } = useAppSelector(state => state.game)
    console.log("scoresRanking inside leader board", scoresRanking)
    const sortedPlayers = useMemo(() => {
        if (!Array.isArray(scoresRanking)) return []
        return [...scoresRanking].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    }, [scoresRanking])

    console.log("sortedPlayers", sortedPlayers)

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
                    <Trophy className="w-5 h-5 text-amber-400" />
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

            {/* Player List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sortedPlayers.map((player, idx) => (
                    <div
                        key={player.uid}
                        className={`rounded-xl p-4 transition-all ${idx === 0
                            ? "bg-amber-500/20 border border-amber-500/30"
                            : idx === 1
                                ? "bg-slate-400/10 border border-slate-400/20"
                                : idx === 2
                                    ? "bg-amber-700/20 border border-amber-700/30"
                                    : "bg-slate-700/30 border border-white/5"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                                {getRankIcon(idx)}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                                {player.avatar ? (
                                    <img src={player.avatar} alt={player.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white/60 font-medium">{player.userName?.charAt(0)}</span>
                                )}
                            </div>

                            {/* Name & Score */}
                            <div className="flex-1">
                                <p className="text-white font-medium">{player.userName}</p>
                                <p className="text-cyan-400 text-sm font-bold">{player.score} điểm</p>
                            </div>
                        </div>

                        {/* Answer History - Only for host */}
                        {isHost && player.answers && player.answers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                                <p className="text-white/50 text-xs mb-2">Lịch sử trả lời:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {player.answers.map((answer, qIdx) => (
                                        <div
                                            key={qIdx}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${qIdx === currentQuestion - 1
                                                ? "ring-2 ring-white ring-offset-1 ring-offset-slate-800"
                                                : ""
                                                } ${answer.isCorrect
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-rose-500 text-white"
                                                }`}
                                        >
                                            {qIdx + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
