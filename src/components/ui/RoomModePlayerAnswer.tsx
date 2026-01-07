import { ExternalLink, Trophy, Medal, Award } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useEffect, useMemo } from "react";
import useFirebaseListener from "../../shared/hooks/firebase/useFirebaseListener";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useGameApi from "../../shared/hooks/api/useGameApi";

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

const RoomModePlayerAnswer = ({ isHost = false, currentQuestion = 0, onOpenNewTab }: LeaderboardProps) => {
    const [params] = useSearchParams();
    const round = params.get("round") || "1";
    const roomId = params.get("roomId") || "1";
    const isRoomOwner = params.get("isRoomOwner") === "true";
    const roomMode = params.get("roomMode") || "manual";
    const playMode = params.get("playMode") || "manual";
    const { players } = useAppSelector(state => state.game);
    const { listenToScoresRanking, listenToBroadcastedAnswer } = useFirebaseListener()
    const { updateGameState } = useGameApi();

    const closeLeaderboard = async () => {
        try {
            await updateGameState(roomId, { phase: "QUESTION" });
            toast.success("Đã đóng câu trả lời thí sinh");
        } catch {
            toast.error("Không thể đóng câu trả lời thí sinh");
        }
    };

    const { scoresRanking } = useAppSelector(state => state.game);
    
      const sortedPlayers = useMemo(() => {
        if (!Array.isArray(scoresRanking)) return [];
        return [...scoresRanking].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      }, [scoresRanking]);


    // const sortedScoresRanking = Array.isArray(scoresRanking)
    //     ? [...scoresRanking].sort(
    //         (a, b) => (b.score ?? 0) - (a.score ?? 0)
    //     )
    //     : [];

    // console.log("sortedScoresRanking", sortedScoresRanking)

    // const getRankIcon = (rank: number) => {
    //     switch (rank) {
    //         case 0:
    //             return <Trophy className="w-5 h-5 text-amber-400" />;
    //         case 1:
    //             return <Medal className="w-5 h-5 text-slate-300" />;
    //         case 2:
    //             return <Award className="w-5 h-5 text-amber-600" />;
    //         default:
    //             return <span className="w-5 h-5 flex items-center justify-center text-white/50 text-sm font-medium">{rank + 1}</span>;
    //     }
    // };

    return (
        <div className="h-full flex flex-col rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-3">
                    Câu trả lời thí sinh
                </h3>
                {isHost && (
                    <button
                        onClick={closeLeaderboard}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/70 text-white/70 text-sm hover:bg-slate-600 transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Đóng câu trả lời thí sinh
                    </button>
                )}
            </div>

            {/* Player List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sortedPlayers.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                        Chưa có dữ liệu 
                    </div>
                ) : (
                    sortedPlayers.map((player, idx) => (
                        <div
                            key={player.uid}
                            className={`rounded-xl p-4 transition-all border ${idx === 0
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
                                {/* <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center shadow-inner">
                                    {getRankIcon(idx)}
                                </div> */}

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

                                    <div className="mt-2 space-y-1">
                                        {player.answer ? (
                                            <>
                                                <p className="text-cyan-300 text-sm">
                                                    <span className="font-medium">Câu trả lời:</span> {player.answer}
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
                                </div>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RoomModePlayerAnswer;
