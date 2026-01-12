import { ExternalLink, Trophy, Medal, Award } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useEffect, useState } from "react";
import useFirebaseListener from "../../shared/hooks/firebase/useFirebaseListener";
import { useSearchParams } from "react-router-dom";
// 1. Import Framer Motion
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardProps {
    isHost?: boolean;
    currentQuestion?: number;
    onOpenNewTab?: () => void;
}

const RoomModeLeaderboard = ({ onOpenNewTab }: LeaderboardProps) => {
    const [params] = useSearchParams();
    const roomId = params.get("roomId") || "1";
    const { scoresRanking } = useAppSelector(state => state.game);
    const { listenToScoresRanking, listenToPlayerColors, listenToCurrentTurn } = useFirebaseListener();
    const [playerColors, setPlayerColors] = useState<any>();
    const [currentTurn, setCurrentTurn] = useState<Number>(0);

    useEffect(() => {
        const unsubscribePlayerColors = listenToPlayerColors(colors => setPlayerColors(colors || {}));
        const unsubscribePlayerTurn = listenToCurrentTurn(turn => setCurrentTurn(turn || 0));
        const unsubscribeScores = listenToScoresRanking(() => { });

        return () => {
            unsubscribePlayerColors();
            unsubscribePlayerTurn();
            unsubscribeScores();
        };
    }, [roomId]);

    const sortedScoresRanking = Array.isArray(scoresRanking)
        ? [...scoresRanking].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        : [];

    const top4Players = sortedScoresRanking.slice(0, 4);

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden h-fit flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-around">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
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
            <div className="flex-1 overflow-hidden p-4 pt-2">
                <div className="space-y-3 flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {top4Players.map((player, idx) => {
                            const isCurrent = currentTurn !== null && Number(currentTurn) - 1 === idx;
                            const color = playerColors && playerColors[player?.stt || ""];

                            return (
                                <motion.div
                                    // Bắt buộc key phải là duy nhất (uid) để Framer Motion nhận diện đổi chỗ
                                    key={player.uid}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        scale: isCurrent ? 1.02 : 1 // Nhấn nhẹ khi tới lượt
                                    }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                        mass: 1
                                    }}
                                    className={`rounded-xl p-4 transition-shadow duration-300 shadow-md border-2  ${isCurrent ? "ring-4 ring-yellow-400 z-10" : "z-0"}`}
                                    style={{
                                        // Sử dụng color từ firebase cho border nếu có
                                        borderColor: color || undefined, 
                                        backgroundColor: isCurrent ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.4)'
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* 1. Ô số thứ hạng (Rank Number) */}
                                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-black text-sm
                                        ${idx === 0 ? "bg-amber-400 text-amber-900" : 
                                          idx === 1 ? "bg-slate-300 text-slate-800" : 
                                          idx === 2 ? "bg-orange-500 text-orange-950" : "bg-white/10 text-white/50"}`}
                                    >
                                        {idx + 1}
                                    </div>
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
                                                {player.userName || player.playerName}
                                            </p>
                                            <p className="text-white text-lg font-bold">
                                                {player.score} điểm
                                            </p>
                                        </div>

                                        {/* Hiển thị Rank Icon nếu là top 3 */}
                                        {/* <div className="flex items-center justify-center">
                                            {idx === 0 && <Trophy className="w-6 h-6 text-amber-400" />}
                                            {idx === 1 && <Medal className="w-6 h-6 text-slate-300" />}
                                            {idx === 2 && <Award className="w-6 h-6 text-amber-600" />}
                                            {idx > 2 && <span className="text-white/40 font-bold">{idx + 1}</span>}
                                        </div> */}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Placeholder logic giữ nguyên style DASHED */}
                        {[...Array(Math.max(0, 4 - top4Players.length))].map((_, i) => (
                            <motion.div
                                key={`placeholder-${i}`}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                className="rounded-xl p-4 bg-slate-800/30 border border-dashed border-white/20 flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-700/50" />
                                <div className="w-12 h-12 rounded-full bg-slate-700/50" />
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div>
                                    <div className="h-5 bg-slate-700/40 rounded w-20"></div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {sortedScoresRanking.length > 4 && (
                    <motion.div 
                        layout
                        className="mt-4 pt-3 border-t border-white/10 text-center"
                    >
                        <p className="text-white/60 text-sm">
                            Và {sortedScoresRanking.length - 4} người chơi khác...
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default RoomModeLeaderboard;