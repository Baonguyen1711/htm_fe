import React, { useEffect, useState } from "react";
import { Score } from "../shared/types";
import { useSearchParams } from "react-router-dom";
import { useFirebaseListener } from "../shared/hooks";
import { useAppSelector } from "../app/store";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerScoreProps {
  playerColors?: Record<string, string>;
}

function PlayerScore({ playerColors: propPlayerColors = {} }: PlayerScoreProps) {
  const [playerColors, setPlayerColors] = useState<Record<string, string>>(propPlayerColors);
  const [params] = useSearchParams();
  const round = params.get("round") || "1";
  const roomId = params.get("roomId") || "1";

  const { listenToScoresRanking, listenToPlayerColors } = useFirebaseListener();
  const { scoresRanking } = useAppSelector((state) => state.game);

  useEffect(() => {
    const unsubscribeScores = listenToScoresRanking(() => {});
    return () => {
      unsubscribeScores();
    };
  }, [roomId]);

  useEffect(() => {
    const unsubscribePlayerColors = listenToPlayerColors((colors) => {
      setPlayerColors(colors || {});
    });
    return () => unsubscribePlayerColors();
  }, [roomId, listenToPlayerColors]);

  const sortedScoresRanking = Array.isArray(scoresRanking)
    ? [...scoresRanking].sort((a, b) => b.score - a.score)
    : [];

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-blue-400/40 shadow-xl p-5 w-full max-w-md mx-auto">
      <h2 className="text-white font-extrabold text-2xl mb-4 text-center border-b border-blue-400/30 pb-3 tracking-wide">
        Bảng Điểm
      </h2>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {sortedScoresRanking.map((player: Score, index: number) => (
            <motion.div
              key={player.playerName}
              layout // 👈 magic: tự animate khi vị trí thay đổi
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-4 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-blue-400/20 shadow-md p-4"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              {/* Avatar + Color */}
              <div className="relative">
                <img
                  src={player.avatar}
                  alt={player.playerName}
                  className="w-14 h-14 rounded-full border-2 border-blue-400/50 shadow-md"
                />
                {round === "4" && player.stt && playerColors[player.stt] && (
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: playerColors[player.stt] }}
                  ></div>
                )}
              </div>

              {/* Name & Score */}
              <div className="flex-1">
                <p className="text-white font-semibold text-base">{player.playerName}</p>
                <div className="bg-gradient-to-r from-blue-600/50 to-cyan-500/50 backdrop-blur-sm text-white text-center py-1 px-3 rounded-lg font-mono text-lg border border-blue-400/30 shadow-sm">
                  {`${player.score} điểm`}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PlayerScore;
