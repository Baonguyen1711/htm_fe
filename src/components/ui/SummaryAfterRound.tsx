import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, Crown, Home, BarChart3, Music, LogOut } from "lucide-react";
import { useAppSelector } from "../../app/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoomModeLeaderboard from ".././ui/RoomModeLeaderboard";
import useConfirmModal from "../../shared/hooks/ui/useConfirmModal";
import useRoomApi from "../../shared/hooks/api/useRoomApi";
import useGameApi from "../../shared/hooks/api/useGameApi";
import { useFirebaseListener } from "../../shared/hooks";
import { toast } from "react-toastify";
import { useSounds } from "../../context/soundContext";
import AfterRoundRanking from "./AfterRoundRanking";
import Header from "./Header";

interface FinalRankingProps {
    isHost: boolean;
}

const SummaryAfterRound: React.FC<FinalRankingProps> = ({ isHost }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const roomId = searchParams.get("roomId") || "";

    const { setGameHistory, startRound } = useGameApi();
    const { playSound } = useRoomApi();
    const sounds = useSounds()

    // Logic cho Host
    const { modalState, showConfirmModal, closeModal } = useConfirmModal();
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [podiumRevealed, setPodiumRevealed] = useState([false, false, true, true]);
    const [isShowLeaderboard, setIsShowLeaderboard] = useState<boolean>(false)
    const { scoresRanking } = useAppSelector((state) => state.game);
    const { listenToSound, deletePath, listenToRoundStart } = useFirebaseListener()

    useEffect(() => {
        const unsubscribeRoundStart = listenToRoundStart(
            (round) => {
                if (round === "summary") {
                    setIsShowLeaderboard(true)
                    const audio = sounds["final"];
                    if (audio) {
                        audio.play();
                    }
                    deletePath("sound")
                    return
                }

                if (!isHost) {
                    navigate(`/play?round=${round}&roomId=${roomId}`, { replace: true });
                }
            }
        )

        return () => {
            unsubscribeRoundStart();
        };
    }, []);

    const handleEndGameclick = () => {
        let timeId: NodeJS.Timeout
        showConfirmModal({
            text: 'Bạn có chắc chắn muốn kết thúc trận đấu? Tất cả dữ liệu sẽ được lưu và bạn sẽ quay về trang quản lý.',
            onConfirm: async () => {
                try {
                    await setGameHistory(roomId);
                    toast.success('Đã lưu lịch sử trận đấu thành công!');
                    setCountdown(5);
                    setShowCountdown(true);
                } catch (error) {
                    toast.error('Có lỗi xảy ra khi lưu lịch sử');
                }
            },
            confirmText: 'Kết thúc trận đấu',
            confirmVariant: 'danger'
        });
    }
    const topPlayers = [...(scoresRanking || [])]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 4);

    useEffect(() => {
        const timer1 = setTimeout(() => setPodiumRevealed([false, false, true, true]), 600);
        const timer2 = setTimeout(() => setPodiumRevealed([false, true, true, true]), 1400);
        const timer3 = setTimeout(() => setPodiumRevealed([true, true, true, true]), 2200);
        const timer4 = setTimeout(() => setShowLeaderboard(true), 5500);

        return () => {
            [timer1, timer2, timer3, timer4].forEach(clearTimeout);
        };
    }, []);

    const StarBackground = () => {
        // Sinh ra khoảng 100 ngôi sao với các thuộc tính ngẫu nhiên
        const [stars] = useState(() =>
            [...Array(100)].map((_, i) => ({
                id: i,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                size: Math.random() * 2 + 1 + "px", // Kích thước từ 1px đến 3px
                delay: Math.random() * 5 + "s",     // Độ trễ hiệu ứng lấp lánh
                duration: Math.random() * 3 + 2 + "s", // Thời gian một chu kỳ lấp lánh
                opacity: Math.random() * 0.7 + 0.3,
            }))
        );

        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white animate-twinkle"
                        style={{
                            top: star.top,
                            left: star.left,
                            width: star.size,
                            height: star.size,
                            opacity: star.opacity,
                            animationDelay: star.delay,
                            animationDuration: star.duration,
                        }}
                    />
                ))}
            </div>
        );
    };


    return (
        <div className="h-screen bg-slate-900 relative overflow-hidden flex flex-col font-sans">
            {/* Background Decor */}
            {/* 1. Lớp nền gradient tối */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />

            {/* 2. Lớp sao ngẫu nhiên (Thay cho pattern cũ) */}
            <StarBackground />

            {/* 3. Lớp ánh sáng xanh mờ tạo chiều sâu */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,78,99,0.3)_0%,transparent_70%)]" />
            {/* Bubbles Animation */}

            {/* Header */}
            <header className="relative z-20 shrink-0 backdrop-blur-md bg-slate-900/50 border-b border-white/10">
                {
                    isHost && (
                        <div className="container mx-auto px-6 py-5 text-center">
                            <Header isHost={true} />
                        </div>
                    )
                }
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-3xl h-full animate-fade-in py-4">
                    {
                        isShowLeaderboard && (
                            <AfterRoundRanking isHost={isHost} />
                        )
                    }
                </div>
            </main>

            {/* Control Footer */}
            <footer className="relative z-20 shrink-0 p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">

                    {/* CHỈ HIỆN NẾU LÀ HOST */}
                    {isHost && (
                        <>
                            <button
                                onClick={() => startRound(roomId)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <BarChart3 className="w-5 h-5" />
                                HIỂN THỊ ĐIỂM TỔNG KẾT SAU VÒNG THI
                            </button>
                        </>
                    )}
                </div>
            </footer>


            <style>{`
      @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  .animate-twinkle {
    animation: twinkle linear infinite;
  }
        // @keyframes float {
        //   0% { transform: translateY(0); opacity: 0; }
        //   20% { opacity: 0.2; }
        //   80% { opacity: 0.2; }
        //   100% { transform: translateY(-100vh); opacity: 0; }
        // }
        // .animate-float { animation: float linear infinite; }
        
        // @keyframes bounce-slow {
        //   0%, 100% { transform: translateY(0); }
        //   50% { transform: translateY(-12px); }
        // }
        // .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }

        // @keyframes fade-in {
        //   from { opacity: 0; transform: scale(0.95); }
        //   to { opacity: 1; transform: scale(1); }
        // }
        // .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
        </div>
    );
};

export default SummaryAfterRound;