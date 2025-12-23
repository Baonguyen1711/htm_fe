import React, { useEffect } from "react";
import { PlayerData } from "../../shared/types";

export const PlayerRow = ({ player, index, round }: {
    player: PlayerData, index: number, round: string
  }) => {
    return (
      <div
        className="flex items-center gap-4 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-blue-400/20 shadow-md p-4"
      >
        {/* Rank */}
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white font-bold text-lg shadow-lg">
          {index + 1}
        </div>

        {/* Avatar */}
        <div className="relative flex-none">
          <img src={player.avatar} alt={player.userName}
            className="w-14 h-14 rounded-full border-2 border-blue-400/50 shadow-md" />
          {/* {round === "4" && player.stt && playerColors[player.stt] && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: playerColors[player.stt] }} />
          )} */}
        </div>

        {/* Name & Score */}
        <div className="flex flex-col flex-none min-w-[120px]">
          <p className="text-white font-semibold text-base">{player.userName}</p>
          <div className="bg-gradient-to-r from-blue-600/50 to-cyan-500/50 backdrop-blur-sm text-white text-center py-1 px-3 rounded-lg font-mono text-lg border border-blue-400/30 shadow-sm whitespace-nowrap">
            {`${player.score} điểm`}
          </div>
        </div>

        {/* Divider */}
        <div className="h-full w-px bg-blue-400/20 mx-2"></div>

        {/* Answer Spots */}
        <div className="flex-1 flex justify-between items-center gap-1">
          {Array.from({ length: 10 }).map((_, idx) => {
            const ans = player.answers?.[idx];
            return (

              <div key={idx} className="flex flex-col items-center">
                {/* Number above the spot */}
                <span className="text-[10px] text-gray-300 mb-1">
                  {idx + 1}
                </span>

                {/* Answer spot */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${ans
                    ? ans.isCorrect
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-500/50"
                    }`}
                >
                </div>
              </div>
            );
          })}
        </div>
      </div>
      // <motion.div
      //   layout
      //   initial={{ opacity: 0, y: 30 }}
      //   animate={{ opacity: 1, y: 0 }}
      //   exit={{ opacity: 0, y: -30 }}
      //   transition={{ type: "spring", stiffness: 300, damping: 25 }}
      //   className="flex items-center gap-4 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-blue-400/20 shadow-md p-4"
      // >

      // </motion.div>
    );
  }