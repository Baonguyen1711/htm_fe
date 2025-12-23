import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Crown, Sparkles } from "lucide-react";
import Leaderboard from "./ui/LeaderBoard";
import { useAppSelector } from "../app/store";

type AnswerStatus = "correct" | "wrong" | "pending";

interface Player {
  id: number;
  name: string;
  score: number;
  avatar?: string;
  answerHistory?: AnswerStatus[];
}

interface FinalRankingProps {
    isHost: boolean
}

const FinalResultPage:React.FC<FinalRankingProps> = ({isHost}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [podiumRevealed, setPodiumRevealed] = useState([false, false, false]);
  const {scoresRanking} = useAppSelector(state => state.game)

  // Mock data - top 3 players
//   const scoresRanking: Player[] = [
//     { id: 1, name: "Nguyễn Văn A", score: 1250, answerHistory: ["correct", "correct", "correct", "correct", "correct"] },
//     { id: 2, name: "Trần Thị B", score: 1100, answerHistory: ["correct", "wrong", "correct", "correct", "correct"] },
//     { id: 3, name: "Lê Văn C", score: 950, answerHistory: ["correct", "correct", "wrong", "correct", "correct"] },
//   ];

  // Reveal podium positions one by one (3rd -> 2nd -> 1st)
  useEffect(() => {
    // Reveal 3rd place
    const timer1 = setTimeout(() => {
      setPodiumRevealed(prev => [prev[0], prev[1], true]);
    }, 500);

    // Reveal 2nd place
    const timer2 = setTimeout(() => {
      setPodiumRevealed(prev => [prev[0], true, prev[2]]);
    }, 1200);

    // Reveal 1st place
    const timer3 = setTimeout(() => {
      setPodiumRevealed(prev => [true, prev[1], prev[2]]);
    }, 1900);

    // Switch to leaderboard after 5 seconds
    const timer4 = setTimeout(() => {
      setShowLeaderboard(true);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const getPodiumStyle = (position: number) => {
    switch (position) {
      case 1:
        return {
          height: "h-40",
          bg: "bg-gradient-to-t from-amber-600 to-amber-400",
          border: "border-amber-300",
          glow: "shadow-[0_0_60px_rgba(251,191,36,0.4)]",
          icon: <Crown className="w-8 h-8 text-amber-300" />,
          label: "1ST",
        };
      case 2:
        return {
          height: "h-28",
          bg: "bg-gradient-to-t from-slate-500 to-slate-300",
          border: "border-slate-200",
          glow: "shadow-[0_0_40px_rgba(148,163,184,0.3)]",
          icon: <Medal className="w-7 h-7 text-slate-200" />,
          label: "2ND",
        };
      case 3:
        return {
          height: "h-20",
          bg: "bg-gradient-to-t from-amber-800 to-amber-600",
          border: "border-amber-500",
          glow: "shadow-[0_0_30px_rgba(180,83,9,0.3)]",
          icon: <Award className="w-6 h-6 text-amber-400" />,
          label: "3RD",
        };
      default:
        return {
          height: "h-16",
          bg: "bg-slate-700",
          border: "border-slate-600",
          glow: "",
          icon: null,
          label: "",
        };
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Sparkle particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-amber-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${12 + Math.random() * 12}px`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl border-b border-white/10 bg-slate-900/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Kết Quả Cuối Cùng</h1>
                <p className="text-xs text-white/60">Chúc mừng các thí sinh xuất sắc!</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        {!showLeaderboard ? (
          /* Podium View */
          <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-12 text-center animate-fade-in">
              🎉 Top 3 Thí Sinh Xuất Sắc 🎉
            </h2>

            {/* Podium */}
            <div className="flex items-end justify-center gap-4 md:gap-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div
                  className={`transform transition-all duration-700 ease-out ${
                    podiumRevealed[1] ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                  }`}
                >
                  {/* Player Info */}
                  <div className="mb-4 text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-600 border-4 border-slate-300 mx-auto mb-2 flex items-center justify-center overflow-hidden shadow-xl">
                      <span className="text-2xl md:text-3xl font-bold text-white/80">
                        {scoresRanking[1]?.userName?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white font-bold text-sm md:text-base">{scoresRanking[1]?.userName}</p>
                    <p className="text-slate-300 font-bold text-lg md:text-xl">{scoresRanking[1]?.score} điểm</p>
                  </div>

                  {/* Podium Block */}
                  <div
                    className={`w-24 md:w-32 ${getPodiumStyle(2).height} ${getPodiumStyle(2).bg} ${getPodiumStyle(2).glow} rounded-t-xl border-t-4 ${getPodiumStyle(2).border} flex flex-col items-center justify-start pt-3`}
                  >
                    {getPodiumStyle(2).icon}
                    <span className="text-white font-black text-xl mt-1">{getPodiumStyle(2).label}</span>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div
                  className={`transform transition-all duration-700 ease-out ${
                    podiumRevealed[0] ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"
                  }`}
                >
                  {/* Crown */}
                  <div className="flex justify-center mb-2 animate-bounce">
                    <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  </div>

                  {/* Player Info */}
                  <div className="mb-4 text-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-amber-500 border-4 border-amber-300 mx-auto mb-2 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-500/50 ring-4 ring-amber-400/30">
                      <span className="text-3xl md:text-4xl font-bold text-white">
                        {scoresRanking[0]?.userName?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white font-bold text-base md:text-lg">{scoresRanking[0]?.userName}</p>
                    <p className="text-amber-400 font-bold text-xl md:text-2xl">{scoresRanking[0]?.score} điểm</p>
                  </div>

                  {/* Podium Block */}
                  <div
                    className={`w-28 md:w-36 ${getPodiumStyle(1).height} ${getPodiumStyle(1).bg} ${getPodiumStyle(1).glow} rounded-t-xl border-t-4 ${getPodiumStyle(1).border} flex flex-col items-center justify-start pt-4`}
                  >
                    <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
                    <span className="text-white font-black text-2xl mt-1">{getPodiumStyle(1).label}</span>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div
                  className={`transform transition-all duration-700 ease-out ${
                    podiumRevealed[2] ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                  }`}
                >
                  {/* Player Info */}
                  <div className="mb-4 text-center">
                    <div className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-amber-700 border-4 border-amber-500 mx-auto mb-2 flex items-center justify-center overflow-hidden shadow-xl w-[72px] h-[72px] md:w-20 md:h-20">
                      <span className="text-xl md:text-2xl font-bold text-white/80">
                        {scoresRanking[2]?.userName?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white font-bold text-sm md:text-base">{scoresRanking[2]?.userName}</p>
                    <p className="text-amber-500 font-bold text-base md:text-lg">{scoresRanking[2]?.score} điểm</p>
                  </div>

                  {/* Podium Block */}
                  <div
                    className={`w-20 md:w-28 ${getPodiumStyle(3).height} ${getPodiumStyle(3).bg} ${getPodiumStyle(3).glow} rounded-t-xl border-t-4 ${getPodiumStyle(3).border} flex flex-col items-center justify-start pt-2`}
                  >
                    {getPodiumStyle(3).icon}
                    <span className="text-white font-black text-lg mt-1">{getPodiumStyle(3).label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-12 text-center animate-pulse">
              <p className="text-white/50 text-sm">Đang chuyển sang bảng xếp hạng đầy đủ...</p>
            </div>
          </div>
        ) : (
          /* Leaderboard View */
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="h-[calc(100vh-160px)]">
              <Leaderboard
                isHost={isHost}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FinalResultPage;
