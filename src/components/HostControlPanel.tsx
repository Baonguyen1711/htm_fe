import React, { useState } from "react";
import {
    Eye,
    EyeOff,
    SkipForward,
    ChevronRight,
    RotateCcw,
    CheckCircle,
    Pause,
} from "lucide-react";
import { toast } from "react-toastify";
import AnswerStatsChart from "./ui/Host/AnswerStatsChart";
import { useAppSelector } from "../app/store";
import useGameApi from "../shared/hooks/api/useGameApi";
import { useSearchParams, useNavigate } from "react-router-dom";

interface AnswerStats {
    label: string;
    count: number;
}



const HostControlPanel: React.FC = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || "";
    const playMode = searchParams.get("playMode") || "";
    const round = searchParams.get("round") || "1"

    const navigate = useNavigate();
    const { players, answersCount } = useAppSelector((state) => state.game);

    const [showAnswer, setShowAnswer] = useState(false);
    const [showStats, setShowStats] = useState(false);

    const {
        sendCorrectAnswer,
        multiplayerPause,
        multiplayerResume,
        getNextQuestion,
        updateGameState,
        multiplayerEnd,
        broadcastAnswers
    } = useGameApi();

    /* =======================
       Derived stats
    ======================= */
    const stats: AnswerStats[] = ["A", "B", "C", "D"].map((label) => ({
        label,
        count: answersCount.filter((a) => a === label).length,
    }));

    /* =======================
       Handlers
    ======================= */
    const handleShowCorrectAnswer = async () => {
        try {
            await sendCorrectAnswer(roomId);
            setShowAnswer((prev) => !prev);
            toast.success("Đã hiển thị đáp án!");
        } catch {
            toast.error("Lỗi khi hiển thị đáp án");
        }
    };

    const handleBroadcastAnswersClick = async () => {
        try {
            await broadcastAnswers(roomId);
            toast.success('Đã gửi câu trả lời của tất cả các thí sinh đến người chơi!');
        } catch (error) {
            console.error('Error broadcasting answers:', error);
            toast.error('Lỗi khi gửi câu trả lời của tất cả các thí sinh đến người chơi');
        }
    }

    const handleNextQuestion = async () => {
        try {
            await getNextQuestion({
                roomId,
                testName,
                round: round,
            });
            toast.success("Đã chuyển câu tiếp theo!");
        } catch {
            toast.error("Lỗi khi chuyển câu hỏi");
        }
    };

    const handlePause = async () => {
        try {
            await multiplayerPause(roomId);
            toast.success("Đã tạm dừng trận đấu");
        } catch {
            toast.error("Không thể tạm dừng");
        }
    };

    const handleResume = async () => {
        try {
            await multiplayerResume(roomId, testName);
            toast.success("Tiếp tục trận đấu");
        } catch {
            toast.error("Không thể tiếp tục");
        }
    };

    const handleEndGame = async () => {
        try {
            await multiplayerEnd(roomId);
            toast.success("Kết thúc trận đấu");
            navigate(`/host?round=final&roomId=${roomId}&testName=${testName}`);
        } catch {
            toast.error("Không thể kết thúc trận đấu");
        }
    };

    const openLeaderboard = async () => {
        try {
            await updateGameState(roomId, { phase: "LEADERBOARD" });
            toast.success("Đã mở bảng xếp hạng");
        } catch {
            toast.error("Không thể mở leaderboard");
        }
    };

    /* =======================
       UI
    ======================= */
    return (
        <div
            className="
        rounded-2xl
        bg-cyan-900/30
        backdrop-blur-md
        border border-cyan-400/20
        shadow-lg
        p-4
        space-y-4
      "
        >
            {/* Stats */}
            {playMode === "multiplayer" && (
                <AnswerStatsChart stats={stats} totalPlayers={players.length} />
            )}


            {/* Toggle stats */}
            <button
                onClick={() => setShowStats((prev) => !prev)}
                className="
          w-full flex items-center justify-center gap-2
          py-2 rounded-lg text-sm font-medium
          bg-cyan-600/20 text-cyan-300
          hover:bg-cyan-600/30 transition
        "
            >
                {showStats ? <EyeOff size={16} /> : <Eye size={16} />}
                {showStats ? "Ẩn thống kê" : "Hiện thống kê"}
            </button>

            {/* Show answer */}
            <button
                onClick={handleShowCorrectAnswer}
                className={`
          w-full flex items-center justify-center gap-2
          py-2 rounded-lg text-sm font-medium transition
          ${showAnswer
                        ? "bg-amber-400 text-slate-900"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                    }
        `}
            >
                <CheckCircle size={16} />
                {showAnswer ? "Ẩn đáp án" : "Hiện đáp án"}
            </button>

            {/* Navigation */}
            <div className="space-y-2 pt-2 border-t border-cyan-400/20">
                {playMode === "auto" ? (
                    <>
                        <button
                            onClick={handlePause}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                        >
                            <Pause size={16} />
                            Tạm dừng
                        </button>

                        <button
                            onClick={handleResume}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                            <ChevronRight size={16} />
                            Tiếp tục
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleNextQuestion}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                            <SkipForward size={16} />
                            Câu tiếp theo
                        </button>

                        <button
                            onClick={handleBroadcastAnswersClick}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                            <SkipForward size={16} />
                            Hiển thị câu trả lời của thí sinh
                        </button>
                    </>



                )}

                <button
                    onClick={openLeaderboard}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-700/30 text-cyan-200 hover:bg-cyan-700/40"
                >
                    <ChevronRight size={16} />
                    Mở leaderboard
                </button>

                <button
                    onClick={handleEndGame}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600/80 text-white hover:bg-red-600"
                >
                    <RotateCcw size={16} />
                    Kết thúc trận
                </button>
            </div>
        </div>
    );
};

export default HostControlPanel;
