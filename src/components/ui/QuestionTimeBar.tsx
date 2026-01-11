import React, { useState } from "react";
import { Pause, Timer } from "lucide-react";
import { toast } from "react-toastify";
import useGameApi from "../../shared/hooks/api/useGameApi";
import { useTimeStart } from "../../context/timeListenerContext";
import { useSearchParams } from "react-router-dom";

interface QuestionTimerBarProps {
    isHost: boolean;
}

const QuestionTimerBar: React.FC<QuestionTimerBarProps> = ({
    isHost,
}) => {

    const roundTimeMapping = {
        "1": 15,
        "2": 10,
        "3": 60,
        "4": 15
    }
    const [searchParams] = useSearchParams();


    const currentRound = searchParams.get("round") || "1";
    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "";
    const roomMode = searchParams.get("roomMode") || "room"
    const playMode = searchParams.get("playMode") || "manual"
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const totalTime = 15
    console.log("total Time")
    const { timeLeft } = useTimeStart()
    const { startTimer } = useGameApi()

    const formatSeconds = (seconds: number) =>
        Math.max(0, Math.ceil(seconds));

    const progress =
        timeLeft !== null && totalTime > 0
            ? (timeLeft / totalTime) * 100
            : 0

    console.log("progress", progress)

    const handleStartTimer = async () => {
        try {
            await startTimer(roomId);

            toast.success('Đã bắt đầu đếm thời gian!', {
                position: 'top-right',
                autoClose: 2000,
            });
        } catch (e) {
            toast.error('Lỗi khi bắt đầu đếm thời gian', {
                position: 'top-right',
                autoClose: 2000,
            });
            console.log("error starting time", e)
        }
    }
    return (
        <div className="w-full mb-3">
            <div className="flex items-center gap-4 w-full">
                {/* Progress */}
                <div className="flex-1">
                    <div className="w-full h-3 bg-slate-700/50 rounded-full border border-blue-400/30 shadow-lg overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-50
                ${timeLeft >= 0 ? (timeLeft <= 5
                                    ? "bg-gradient-to-r from-red-500 to-orange-400"
                                    : "bg-gradient-to-r from-blue-400 to-cyan-300")
                                    : "bg-gradient-to-r from-blue-400 to-cyan-300"
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* <div className="mt-1 text-center text-white/70 font-mono text-sm">
                        {timeLeft !== null && `${formatSeconds(timeLeft)} s`}
                    </div> */}
                </div>

                {/* Control button – host only */}
                {isHost && (
                    <button
                        onClick={handleStartTimer}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isTimerRunning
                                ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                                : "bg-slate-600 text-white hover:bg-slate-500"
                            }`}
                    >
                        {isTimerRunning ? (
                            <Pause className="w-4 h-4" />
                        ) : (
                            <Timer className="w-4 h-4" />
                        )}
                        {isTimerRunning ? "Dừng" : "Bắt đầu"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuestionTimerBar;
