import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import useGameApi from "../../../shared/hooks/api/useGameApi";

interface RecordItem {
  question: string;
  is_correct: boolean;
  correct_answer: string | string[];
  answer: string;
}

interface Statistics {
  test_id: string;
  test_name: string;
  total_questions: number;
  correct: number;
  wrong: number;
  accuracy: number;
  records: RecordItem[];
}

export default function PersonalStats() {
  const { getAllStatistic } = useGameApi();
  const [stats, setStats] = useState<Statistics[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Statistics | null>(null);

  useEffect(() => {
    getAllStatistic().then(setStats);
  }, []);

  const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
  const totalWrong = stats.reduce((acc, s) => acc + s.wrong, 0);
  const maxQuestions = Math.max(1, ...stats.map((s) => s.total_questions));

  const formatCorrectAnswer = (ans: string | string[]) =>
    Array.isArray(ans) ? ans.join(", ") : ans;

  // ==================== CHI TIẾT TRẬN ĐẤU ====================
  if (selectedMatch) {
    return (
      <div className="space-y-6">
        {/* Back button - copy style mẫu */}
        <button
          onClick={() => setSelectedMatch(null)}
          className="flex items-center gap-2 text-cyan-300 hover:text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại tổng quan
        </button>

        {/* Header card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{selectedMatch.test_name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{selectedMatch.correct}</p>
                <p className="text-xs text-cyan-300">Câu đúng</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{selectedMatch.wrong}</p>
                <p className="text-xs text-cyan-300">Câu sai</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-300">{selectedMatch.accuracy}%</p>
                <p className="text-xs text-cyan-300">Độ chính xác</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-4">
          {selectedMatch.records.map((item, index) => (
            <div
              key={index}
              className={`bg-slate-800/60 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-sm p-5 border-l-4 ${
                item.is_correct ? "border-l-green-500" : "border-l-red-500"
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  item.is_correct ? "bg-green-500/20" : "bg-red-500/20"
                }`}>
                  {item.is_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white mb-3">
                    Câu {index + 1}: {item.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${
                      item.is_correct
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}>
                      <p className="text-xs text-cyan-300 mb-1">Trả lời của bạn</p>
                      <p className={`font-medium ${item.is_correct ? "text-green-400" : "text-red-400"}`}>
                        {item.answer}
                      </p>
                    </div>
                    {!item.is_correct && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-xs text-cyan-300 mb-1">Đáp án đúng</p>
                        <p className="font-medium text-green-400">
                          {formatCorrectAnswer(item.correct_answer)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== TỔNG QUAN ====================
  return (
    <div className="space-y-6">
      {/* Page Header */}

      {/* Overview Stats Cards - grid 3 cột, giống mẫu */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-cyan-200">Trận đã chơi</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.length}</p>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-cyan-200">Tổng câu đúng</p>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{totalCorrect}</p>
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-cyan-200">Tổng câu sai</p>
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{totalWrong}</p>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 className="text-lg font-medium text-white">Hiệu suất theo trận</h3>
        </div>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.test_id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-200 truncate max-w-xs">{stat.test_name}</span>
                <span className="text-cyan-300 font-medium">
                  {stat.correct}/{stat.total_questions} ({stat.accuracy}%)
                </span>
              </div>
              <div className="h-8 bg-slate-700/50 rounded-lg overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-end pr-2 text-xs text-white font-medium"
                  style={{ width: `${(stat.correct / maxQuestions) * 100}%` }}
                >
                  {stat.correct > 0 && stat.correct}
                </div>
                <div
                  className="bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-start pl-2 text-xs text-white font-medium"
                  style={{ width: `${(stat.wrong / maxQuestions) * 100}%` }}
                >
                  {stat.wrong > 0 && stat.wrong}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match List */}
      <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 className="text-lg font-medium text-white">Chi tiết các trận</h3>
        </div>
        <div className="space-y-3">
          {stats.map((stat) => (
            <button
              key={stat.test_id}
              onClick={() => setSelectedMatch(stat)}
              className="w-full p-4 rounded-lg bg-slate-700/30 hover:bg-cyan-500/10 border border-cyan-500/20 flex justify-between items-center transition-all"
            >
              <div>
                <p className="font-medium text-white">{stat.test_name}</p>
                <p className="text-sm text-cyan-300">
                  {stat.correct} đúng • {stat.wrong} sai
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-medium ${
                    stat.accuracy >= 80
                      ? "bg-green-500/20 text-green-400"
                      : stat.accuracy >= 50
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stat.accuracy}%
                </span>
                <ChevronRight className="w-5 h-5 text-cyan-300" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}