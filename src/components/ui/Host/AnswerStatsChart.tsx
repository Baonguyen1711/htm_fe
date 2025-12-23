import { useEffect, useState } from "react";
import { useFirebaseListener } from "../../../shared/hooks";
import { useAppDispatch } from "../../../app/store";
import { setAnswersCount, setScoresRanking } from "../../../app/store/slices/gameSlice";
interface AnswerStats {
    label: string;
    count: number;
}

interface AnswerStatsChartProps {
    totalPlayers: number;
    stats: AnswerStats[]
}

const AnswerStatsChart = ({ stats, totalPlayers }: AnswerStatsChartProps) => {
    const { listenToPlayerAnswerList } = useFirebaseListener()
    const dispatch = useAppDispatch()

    // useEffect(() => {
    //     const unsubscribePlayerAnswerList = listenToPlayerAnswerList((scores) => {
    //         if (!scores) return
    //         const mappedScores = Object.values(scores).map((raw: any) => ({
    //             ...raw,
    //             isCorrect: raw.is_correct,
    //             answers: Array.isArray(raw.answers) ? raw.answers : []
    //         }));

    //         const answersCount = Object.values(scores).map((item: any) => item.answer)

    //         const stats: AnswerStats[] = ["A", "B", "C", "D"].map(label => ({
    //             label,
    //             count: answersCount.filter(a => a === label).length
    //         }));
    //         dispatch(setAnswersCount(answersCount))
    //         setStats(stats)
    //         console.log("mappedScores", mappedScores);
    //         setScoresRanking(mappedScores)
    //     });
    //     return () => {
    //         unsubscribePlayerAnswerList();
    //     };
    // }, [])
    const maxCount = Math.max(...stats.map(s => s.count), 1);

    const getBarColor = (stat: AnswerStats) => {
        return "bg-slate-500";
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl p-4">
            <h4 className="text-white/70 text-sm font-medium mb-4">Thống kê câu trả lời</h4>

            <div className="space-y-3">
                {stats.map((stat, idx) => {
                    const percentage = totalPlayers > 0 ? (stat.count / totalPlayers) * 100 : 0;
                    const barWidth = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;

                    return (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className={`font-medium text-white/70 `}>
                                    {stat.label}
                                    {/* {stat.isCorrect && <span className="ml-2 text-xs">✓ Đúng</span>} */}
                                </span>
                                <span className="text-white/50">
                                    {stat.count} ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="h-6 rounded-lg bg-slate-700/50 overflow-hidden relative">
                                <div
                                    className={`h-full ${getBarColor(stat)} transition-all duration-500 rounded-lg flex items-center justify-end pr-2`}
                                    style={{ width: `${barWidth}%` }}
                                >
                                    {barWidth > 20 && (
                                        <span className="text-xs font-bold text-white">{stat.count}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-white/50">Tổng số trả lời:</span>
                <span className="text-white font-medium">
                    {stats.reduce((sum, s) => sum + s.count, 0)} / {totalPlayers}
                </span>
            </div>
        </div>
    );
};

export default AnswerStatsChart;
