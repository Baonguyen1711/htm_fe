import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, Crown, Home } from "lucide-react";
import Leaderboard from "./ui/LeaderBoard";
import { useAppSelector } from "../app/store";
import { useNavigate } from "react-router-dom";

interface FinalRankingProps {
  isHost: boolean;
}

const FinalResultPage: React.FC<FinalRankingProps> = ({ isHost }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [podiumRevealed, setPodiumRevealed] = useState([false, false, true, true]);
  const { scoresRanking } = useAppSelector(state => state.game);
  const navigate = useNavigate();

  const topPlayers = [...(scoresRanking || [])]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 4);

  useEffect(() => {
    const timer1 = setTimeout(() => setPodiumRevealed([false, false, true, true]), 600);
    const timer2 = setTimeout(() => setPodiumRevealed([false, true, true, true]), 1400);
    const timer3 = setTimeout(() => setPodiumRevealed([true, true, true, true]), 2200);
    const timer4 = setTimeout(() => setShowLeaderboard(true), 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 0: // 1st
        return {
          height: "h-28",
          bg: "bg-gradient-to-t from-amber-600 to-amber-400",
          border: "border-amber-300",
          glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]",
          icon: <Crown className="w-7 h-7 text-amber-300 drop-shadow-lg" />,
          label: "1ST",
        };
      case 1: // 2nd
        return {
          height: "h-20",
          bg: "bg-gradient-to-t from-slate-500 to-slate-300",
          border: "border-slate-200",
          glow: "shadow-[0_0_30px_rgba(148,163,184,0.2)]",
          icon: <Medal className="w-6 h-6 text-slate-200 drop-shadow-md" />,
          label: "2ND",
        };
      case 2: // 3rd
      case 3: // 4th
        return {
          height: "h-16",
          bg: "bg-gradient-to-t from-amber-800 to-amber-600",
          border: "border-amber-500",
          glow: "shadow-[0_0_20px_rgba(180,83,9,0.2)]",
          icon: <Award className="w-5 h-5 text-amber-400 drop-shadow-sm" />,
          label: rank === 2 ? "3RD" : "4TH",
        };
      default:
        return {};
    }
  };

  const getPlayerAvatar = (player: any, size: string = "w-16 h-16") => (
    <div className={`relative ${size}`}>
      <div className="rounded-full bg-slate-600 border-3 border-white/15 overflow-hidden shadow-lg ring-2 ring-white/10">
        {player.avatar ? (
          <img src={player.avatar} alt={player.userName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/70">
            {player.userName?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-800/60 relative overflow-hidden flex flex-col">
      {/* Ocean Background */}
      {/* <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1708864163871-311332fb9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHVuZGVyd2F0ZXIlMjBibHVlfGVufDF8fHx8MTc2NjQ4OTMzMnww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center" />
      </div> */}
      <div className="absolute bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>

      {/* Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20 animate-float"
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-50px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-20 shrink-0 backdrop-blur-xl bg-cyan-900/70 border-b border-cyan-700/50">
        <div className="container mx-auto px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">KẾT QUẢ CHUNG CUỘC</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {!showLeaderboard ? (
          <div className="w-full max-w-4xl mx-auto">

            <div className="flex items-end justify-center gap-6">
              {/* 2nd */}
              {topPlayers[1] && (
                <div className={`transform transition-all duration-1000 ${podiumRevealed[1] ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`}>
                  <div className="mb-4 text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20">{getPlayerAvatar(topPlayers[1], "w-16 h-16 md:w-20 md:h-20")}</div>
                    <p className="text-white font-semibold text-base mt-2">{topPlayers[1].userName}</p>
                    <p className="text-slate-300 font-bold text-lg">{topPlayers[1].score} điểm</p>
                  </div>
                  <div className={`w-24 md:w-28 ${getPodiumStyle(1).height} ${getPodiumStyle(1).bg} ${getPodiumStyle(1).glow} rounded-t-2xl border-t-5 ${getPodiumStyle(1).border} flex flex-col items-center justify-center pt-2`}>
                    {getPodiumStyle(1).icon}
                    <span className="text-white font-black text-xl mt-1">{getPodiumStyle(1).label}</span>
                  </div>
                </div>
              )}

              {/* 1st */}
              {topPlayers[0] && (
                <div className={`transform transition-all duration-1000 delay-200 ${podiumRevealed[0] ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"}`}>
                  <div className="flex justify-center mb-3 animate-bounce-slow">
                    <Crown className="w-10 h-10 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]" />
                  </div>
                  <div className="mb-5 text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24">{getPlayerAvatar(topPlayers[0], "w-20 h-20 md:w-24 md:h-24")}</div>
                    <p className="text-white font-bold text-lg mt-3">{topPlayers[0].userName}</p>
                    <p className="text-amber-400 font-black text-2xl">{topPlayers[0].score} điểm</p>
                  </div>
                  <div className={`w-28 md:w-32 ${getPodiumStyle(0).height} ${getPodiumStyle(0).bg} ${getPodiumStyle(0).glow} rounded-t-2xl border-t-6 ${getPodiumStyle(0).border} flex flex-col items-center justify-center pt-3`}>
                    <Trophy className="w-8 h-8 text-white drop-shadow-lg mb-1" />
                    <span className="text-white font-black text-2xl">{getPodiumStyle(0).label}</span>
                  </div>
                </div>
              )}

              {/* 3rd & 4th */}
              <div className="flex items-end gap-6">
                {[2, 3].map(idx => topPlayers[idx] && (
                  <div
                    key={idx}
                    className={`transform transition-all duration-1000 ${podiumRevealed[idx] ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
                  >
                    <div className="mb-3 text-center">
                      <div className="w-14 h-14 md:w-16 md:h-16">{getPlayerAvatar(topPlayers[idx], "w-14 h-14 md:w-16 md:h-16")}</div>
                      <p className="text-white font-semibold text-sm mt-2">{topPlayers[idx].userName}</p>
                      <p className="text-amber-500 font-bold text-base">{topPlayers[idx].score} điểm</p>
                    </div>
                    <div className={`w-20 md:w-24 ${getPodiumStyle(2).height} ${getPodiumStyle(2).bg} ${getPodiumStyle(2).glow} rounded-t-2xl border-t-4 ${getPodiumStyle(2).border} flex flex-col items-center justify-center pt-2`}>
                      {getPodiumStyle(2).icon}
                      <span className="text-white font-black text-lg mt-1">{idx === 2 ? "3RD" : "4TH"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12 animate-pulse">
              <p className="text-white/60 text-base">Đang chuyển sang bảng xếp hạng đầy đủ...</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto h-full animate-fade-in">
            <Leaderboard isHost={isHost} />
          </div>
        )}
      </main>

      {/* Nút Quay về Trang chủ - cố định dưới cùng */}
      <div className="relative z-20 shrink-0 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-semibold text-lg transition-all shadow-xl hover:shadow-cyan-500/30"
          >
            <Home className="w-6 h-6" />
            Quay về Trang chủ
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default FinalResultPage;