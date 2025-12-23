import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Target,
} from "lucide-react";
import useGameApi from "../../../shared/hooks/api/useGameApi";

/* ================= INTERFACES ================= */

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

/* ================= COMPONENT ================= */

export default function PersonalStats() {
  const { getAllStatistic } = useGameApi();

  const [stats, setStats] = useState<Statistics[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await getAllStatistic();
      setStats(response); // dùng toàn bộ, không hard-code bỏ test nào
    };

    fetchStats();
  }, []);

  /* ================= HELPERS ================= */

  const formatCorrectAnswer = (ans: string | string[]) =>
    Array.isArray(ans) ? ans.join(", ") : ans;

  const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
  const totalWrong = stats.reduce((acc, s) => acc + s.wrong, 0);

  const maxQuestions = Math.max(
    1,
    ...stats.map((s) => s.total_questions)
  );

  /* ================= DETAIL VIEW ================= */

  if (selectedMatch) {
    return (
      <div className="p-6">
        {/* Back */}
        <button
          onClick={() => setSelectedMatch(null)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg text-ocean-light hover:bg-ocean-mid/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gradient mb-2">
            {selectedMatch.test_name}
          </h2>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              {selectedMatch.correct} câu đúng
            </div>

            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-4 h-4" />
              {selectedMatch.wrong} câu sai
            </div>

            <div className="flex items-center gap-2 text-ocean-light">
              <Target className="w-4 h-4" />
              Độ chính xác: {selectedMatch.accuracy}%
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {selectedMatch.records.map((item, index) => (
            <div
              key={index}
              className={`glass-card p-5 border-l-4 ${
                item.is_correct ? "border-l-green-500" : "border-l-red-500"
              }`}
            >
              <div className="flex gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.is_correct
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {item.is_correct ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium mb-3">
                    <span className="text-muted-foreground">
                      Câu {index + 1}:
                    </span>{" "}
                    {item.question}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        item.is_correct
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      <span className="text-xs block mb-1">
                        Câu trả lời của bạn
                      </span>
                      <span
                        className={
                          item.is_correct
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {item.answer}
                      </span>
                    </div>

                    {!item.is_correct && (
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <span className="text-xs block mb-1">Đáp án đúng</span>
                        <span className="text-green-400">
                          {formatCorrectAnswer(item.correct_answer)}
                        </span>
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

  /* ================= OVERVIEW ================= */

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-light to-ocean-mid flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gradient">
            Thống Kê Kết Quả
          </h2>
          <p className="text-sm text-muted-foreground">
            Tổng quan các bài đã làm
          </p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-2xl font-bold">{stats.length}</p>
          <p className="text-sm text-muted-foreground">Bài đã làm</p>
        </div>

        <div className="glass-card p-5 text-green-400">
          <p className="text-2xl font-bold">{totalCorrect}</p>
          <p className="text-sm text-muted-foreground">Tổng câu đúng</p>
        </div>

        <div className="glass-card p-5 text-red-400">
          <p className="text-2xl font-bold">{totalWrong}</p>
          <p className="text-sm text-muted-foreground">Tổng câu sai</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold mb-4">Biểu đồ kết quả</h3>

        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.test_id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate max-w-[200px]">
                  {stat.test_name}
                </span>
                <span>
                  {stat.correct}/{stat.total_questions} (
                  {stat.accuracy}%)
                </span>
              </div>

              <div className="h-8 bg-background/50 rounded-lg flex overflow-hidden">
                <div
                  className="bg-green-500 flex items-center justify-end pr-2 text-xs text-white"
                  style={{
                    width: `${(stat.correct / maxQuestions) * 100}%`,
                  }}
                >
                  {stat.correct > 0 && stat.correct}
                </div>

                <div
                  className="bg-red-500 flex items-center pl-2 text-xs text-white"
                  style={{
                    width: `${(stat.wrong / maxQuestions) * 100}%`,
                  }}
                >
                  {stat.wrong > 0 && stat.wrong}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match list */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Chi tiết bài làm</h3>

        <div className="space-y-3">
          {stats.map((stat, index) => (
            <button
              key={stat.test_id}
              onClick={() => setSelectedMatch(stat)}
              className="w-full p-4 rounded-xl bg-background/30 border hover:bg-ocean-mid/10 flex justify-between"
            >
              <div>
                <p className="font-medium">{stat.test_name}</p>
                <p className="text-sm text-muted-foreground">
                  {stat.correct} đúng • {stat.wrong} sai
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    stat.accuracy >= 80
                      ? "bg-green-500/20 text-green-400"
                      : stat.accuracy >= 50
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stat.accuracy}%
                </span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
