import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, Crown, Home, BarChart3, Music, LogOut } from "lucide-react";
import Leaderboard from "./ui/LeaderBoard";
import { useAppSelector } from "../app/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import RoomModeLeaderboard from "./ui/RoomModeLeaderboard";
import useConfirmModal from "../shared/hooks/ui/useConfirmModal";
import useRoomApi from "../shared/hooks/api/useRoomApi";
import useGameApi from "../shared/hooks/api/useGameApi";
import { useFirebaseListener } from "../shared/hooks";
import { toast } from "react-toastify";
import { useSounds } from "../context/soundContext";

interface FinalRankingProps {
  isHost: boolean;
}

const FinalResultPage: React.FC<FinalRankingProps> = ({ isHost }) => {
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
  const [podiumRevealed, setPodiumRevealed] = useState([false, false, false, false]);
  const { scoresRanking } = useAppSelector((state) => state.game);
  const { listenToSound, deletePath } = useFirebaseListener()

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showCountdown && countdown > 0) {
      // Cứ sau 1 giây thì giảm countdown đi 1
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      // Khi về 0 thì chuyển trang
      navigate('/host/dashboard');
    }

    // Cleanup function để tránh rò rỉ bộ nhớ hoặc chạy sai lệch
    return () => clearTimeout(timer);
  }, [showCountdown, countdown, navigate]);

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
    const timer1 = setTimeout(() => setPodiumRevealed([false, false, true, true]), 1000);
    const timer2 = setTimeout(() => setPodiumRevealed([false, true, true, true]), 3000);
    const timer3 = setTimeout(() => setPodiumRevealed([true, true, true, true]), 6600);

    // Sau khi reveal xong (2.2s) → đợi thêm 7s
    const timer4 = setTimeout(() => {
      setShowLeaderboard(true);
    }, 6600 + 7000); // = 9200ms

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

  useEffect(() => {
    const unsubscribeSound = listenToSound(

      (type) => {
        console.log("sound type", type)
        const audio = sounds[`${type}`];
        if (audio) {
          audio.play();
        }
        deletePath("sound")
      }
    );

    return () => {
      unsubscribeSound();
    };
  }, []);

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 0:
        return {
          height: "h-32",
          bg: "bg-gradient-to-t from-amber-600 to-amber-400",
          border: "border-amber-300",
          glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]",
          icon: <Crown className="w-8 h-8 text-amber-100 drop-shadow-lg" />,
          label: "1ST",
        };
      case 1:
        return {
          height: "h-24",
          bg: "bg-gradient-to-t from-slate-500 to-slate-300",
          border: "border-slate-200",
          glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]",
          icon: <Medal className="w-7 h-7 text-slate-100 drop-shadow-md" />,
          label: "2ND",
        };
      default:
        return {
          height: "h-20",
          bg: "bg-gradient-to-t from-amber-800 to-amber-600",
          border: "border-amber-500",
          glow: "shadow-[0_0_20px_rgba(180,83,9,0.2)]",
          icon: <Award className="w-6 h-6 text-amber-200 drop-shadow-sm" />,
          label: rank === 2 ? "3RD" : "4TH",
        };
    }
  };

  // Hàm Avatar đã được sửa để chống méo (aspect-square + flex-shrink-0)
  const getPlayerAvatar = (player: any, sizeClass: string) => (
    <div className={`${sizeClass} aspect-square flex-shrink-0 mx-auto relative`}>
      <div className="w-full h-full rounded-full bg-slate-700 border-4 border-white/20 overflow-hidden shadow-2xl flex items-center justify-center">
        {player.avatar ? (
          <img src={player.avatar} alt={player.userName} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white font-bold text-2xl uppercase">
            {player.userName?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

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
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-float"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 7 + 5}s`,
            }}
          />
        ))}
      </div> */}

      {/* Header */}
      <header className="relative z-20 shrink-0 backdrop-blur-md bg-slate-900/50 border-b border-white/10">
        <div className="container mx-auto px-6 py-5 text-center">
          <h1 className="text-3xl font-black text-white bg-clip-text tracking-widest">
            KẾT QUẢ CHUNG CUỘC
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        {!showLeaderboard ? (
          <div className="w-full max-w-5xl">
            <div className="flex items-end justify-center gap-4 md:gap-8 h-[450px]">

              {/* 2nd Place */}
              {topPlayers[1] && (
                <div className={`flex flex-col items-center transition-all duration-1000 ${podiumRevealed[1] ? "translate-y-0 opacity-100" : "translate-y-40 opacity-0"}`}>
                  <div className="mb-4 text-center">
                    {getPlayerAvatar(topPlayers[1], "w-20 h-20 md:w-24 md:h-24")}
                    <p className="text-slate-200 font-bold mt-3 truncate w-24 md:w-32">{topPlayers[1].userName}</p>
                    <p className="text-cyan-400 font-black text-lg">{topPlayers[1].score}</p>
                  </div>
                  <div className={`w-28 md:w-36 ${getPodiumStyle(1).height} ${getPodiumStyle(1).bg} ${getPodiumStyle(1).glow} rounded-t-3xl border-t-8 ${getPodiumStyle(1).border} flex flex-col items-center justify-center`}>
                    {getPodiumStyle(1).icon}
                    <span className="text-white font-black text-2xl tracking-tighter">{getPodiumStyle(1).label}</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topPlayers[0] && (
                <div className={`flex flex-col items-center transition-all duration-1000 delay-300 ${podiumRevealed[0] ? "translate-y-0 opacity-100" : "translate-y-60 opacity-0"}`}>
                  <div className="mb-6 text-center animate-bounce-slow">
                    {getPlayerAvatar(topPlayers[0], "w-28 h-28 md:w-36 md:h-36")}
                    <p className="text-white font-black text-xl mt-4 truncate w-32 md:w-40 drop-shadow-md">{topPlayers[0].userName}</p>
                    <p className="text-amber-400 font-black text-3xl">{topPlayers[0].score}</p>
                  </div>
                  <div className={`w-36 md:w-48 ${getPodiumStyle(0).height} ${getPodiumStyle(0).bg} ${getPodiumStyle(0).glow} rounded-t-3xl border-t-8 ${getPodiumStyle(0).border} flex flex-col items-center justify-center shadow-2xl`}>
                    <Trophy className="w-12 h-12 text-white mb-2 drop-shadow-lg" />
                    <span className="text-white font-black text-4xl">{getPodiumStyle(0).label}</span>
                  </div>
                </div>
              )}

              {/* 3rd & 4th Place Container */}
              <div className="flex items-end gap-3 md:gap-6">
                {[2, 3].map((idx) => topPlayers[idx] && (
                  <div key={idx} className={`flex flex-col items-center transition-all duration-1000 ${podiumRevealed[idx] ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"}`}>
                    <div className="mb-3 text-center">
                      {getPlayerAvatar(topPlayers[idx], "w-16 h-16 md:w-20 md:h-20")}
                      <p className="text-slate-300 font-bold mt-2 truncate w-20 md:w-28 text-sm">{topPlayers[idx].userName}</p>
                      <p className="text-orange-400 font-bold">{topPlayers[idx].score}</p>
                    </div>
                    <div className={`w-24 md:w-32 ${getPodiumStyle(2).height} ${getPodiumStyle(2).bg} ${getPodiumStyle(2).glow} rounded-t-3xl border-t-8 ${getPodiumStyle(2).border} flex flex-col items-center justify-center`}>
                      {getPodiumStyle(2).icon}
                      <span className="text-white font-black text-xl">{idx === 2 ? "3RD" : "4TH"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-16">
              <p className="text-white/30 text-sm animate-pulse uppercase tracking-[0.2em]">Sắp hiển thị bảng chi tiết</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl h-full animate-fade-in py-4">
            <RoomModeLeaderboard isHost={isHost} isRanking={true} />
          </div>
        )}
      </main>

      {/* Control Footer */}
      <footer className="relative z-20 shrink-0 p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">

          {/* Nút chung cho cả Player và Host */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all shadow-lg"
          >
            <Home className="w-5 h-5" />
            TRANG CHỦ
          </button>

          {/* CHỈ HIỆN NẾU LÀ HOST */}
          {isHost && (
            <>
              <button
                onClick={() => startRound(roomId)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <BarChart3 className="w-5 h-5" />
                HIỂN THỊ ĐIỂM TỔNG KẾT
              </button>

              <button
                onClick={() => playSound(roomId, "final")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                <Music className="w-5 h-5" />
                PHÁT NHẠC
              </button>

              <button
                onClick={handleEndGameclick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-500/20"
              >
                <LogOut className="w-5 h-5" />
                KẾT THÚC TRẬN
              </button>
            </>
          )}
        </div>
      </footer>

      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-up">
            <p className="text-white text-lg mb-8 text-center font-medium leading-relaxed">
              {modalState.text}
            </p>

            <div className="flex gap-3">
              {modalState.buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={btn.onClick}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${btn.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                    : btn.variant === 'secondary'
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                    }`}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCountdown && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Đã lưu lịch sử!</h2>
            <div className="text-6xl font-black text-indigo-500 my-6">{countdown}</div>
            <p className="text-slate-400">Đang quay về trang quản lý...</p>
          </div>
        </div>
      )}

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

export default FinalResultPage;