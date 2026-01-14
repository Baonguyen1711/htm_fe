import { BarChart3, ExternalLink, Music } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useEffect, useState } from "react";
import useFirebaseListener from "../../shared/hooks/firebase/useFirebaseListener";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useGameApi from "../../shared/hooks/api/useGameApi";

interface LeaderboardProps {
    isHost?: boolean;
    currentQuestion?: number;
    isRanking?: boolean;
    onOpenNewTab?: () => void;
}

const AfterRoundRanking = ({ onOpenNewTab, isRanking = false, isHost }: LeaderboardProps) => {
    const [params] = useSearchParams();
    const roomId = params.get("roomId") || "1";

    const { scoresRanking } = useAppSelector(state => state.game);
    const { listenToScoresRanking, listenToPlayerColors, listenToCurrentTurn } = useFirebaseListener();

    const [playerColors, setPlayerColors] = useState<any>({});
    const [currentTurn, setCurrentTurn] = useState<number>(0);

    // 👉 số card đang được hiển thị
    const [visibleCount, setVisibleCount] = useState(0);
    const { startRound } = useGameApi()

    useEffect(() => {
        if (isRanking) {
            setPlayerColors({});
            setCurrentTurn(0);
            return;
        }

        const unsubscribeScores = listenToScoresRanking(() => { });

        return () => {
            unsubscribeScores();
        };
    }, [roomId, isRanking]);

    const sortedScoresRanking = Array.isArray(scoresRanking)
        ? [...scoresRanking].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        : [];

    const top4Players = sortedScoresRanking.slice(0, 4);

    /**
     * ⏱ Animation vào card:
     * 2s / card – từ hạng 4 → 1
     */
    useEffect(() => {
        if (isRanking) return;

        setVisibleCount(0);

        const interval = setInterval(() => {
            setVisibleCount(prev => {
                if (prev >= top4Players.length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 2500);

        return () => clearInterval(interval);
    }, [top4Players.length, roomId, isRanking]);

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden h-fit flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-around">
                <h3 className="text-white font-bold text-lg">
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
                    <AnimatePresence>
                        {[0, 1, 2, 3].map(slotIndex => {
                            const player = top4Players[slotIndex]; // rank 1 → 4
                            const isVisible = visibleCount >= 4 - slotIndex;

                            if (!player) {
                                return (
                                    <div
                                        key={`empty-${slotIndex}`}
                                        className="rounded-xl p-4 bg-slate-800/30 border border-dashed border-white/20 h-[88px]"
                                    />
                                );
                            }

                            return (
                                <motion.div
                                    key={player.uid}
                                    initial={{ opacity: 0, x: 120 }}
                                    animate={{
                                        opacity: isVisible ? 1 : 0,
                                        x: isVisible ? 0 : 120
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 28
                                    }}
                                    className="rounded-xl p-4 shadow-md border-2"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm
                        ${slotIndex === 0
                                                    ? "bg-amber-400 text-amber-900"
                                                    : slotIndex === 1
                                                        ? "bg-slate-300 text-slate-800"
                                                        : slotIndex === 2
                                                            ? "bg-orange-500 text-orange-950"
                                                            : "bg-white/10 text-white/50"
                                                }`}
                                        >
                                            {slotIndex + 1}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden ring-2 ring-white/20">
                                            {player.avatar ? (
                                                <img src={player.avatar} className="w-full h-full object-cover" />
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
                                    </div>
                                </motion.div>
                            );
                        })}
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

export default AfterRoundRanking;
