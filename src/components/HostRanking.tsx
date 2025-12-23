import React, { useEffect, useState } from "react";
import { PlayerData, Score } from "../shared/types";
import { useSearchParams } from "react-router-dom";
import { useFirebaseListener } from "../shared/hooks";
import { useAppSelector } from "../app/store";
import { motion, AnimatePresence } from "framer-motion";
import QuestionAndAnswer from "./ui/QuestionAndAnswer/QuestionAndAnswer";
import { useTimeStart } from "../context/timeListenerContext";
import { setAnswersCount } from "../app/store/slices/gameSlice";
import { useAppDispatch } from "../app/store";
import { PlayerRow } from "./ui/PlayerRow";


const HostRanking = React.memo(function HostRankingComponent() {
  //const [playerColors, setPlayerColors] = useState<Record<string, string>>(propPlayerColors);
  const [scoresRanking, setScoresRanking] = useState<PlayerData[]>([]);
  const [params] = useSearchParams();
  const round = params.get("round") || "1";
  const roomId = params.get("roomId") || "1";

  const { listenToScoresRanking, listenToPlayerColors, listenToPlayerAnswerList, listenToTimeStart } = useFirebaseListener();
  const { phase, currentQuestion, currentCorrectAnswer } = useAppSelector((state) => state.game);
  const { startTimer } = useTimeStart();
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = listenToTimeStart(
      () => {
        // const audio = sounds['timer_2'];
        // if (audio) {
        //     audio.play();
        // }

        startTimer(15)
      }
    )
    return () => {
      unsubscribe();
    };

  }, [])
  // const { scoresRanking } = useAppSelector((state) => state.game);

  // useEffect(() => {
  //   const unsubscribeScores = listenToScoresRanking(() => {});
  //   return () => {
  //     unsubscribeScores();
  //   };
  // }, [roomId]);

  // const PlayerRow = ({ player, index, round }: {
  //   player: PlayerData, index: number, round: string
  // }) => {
  //   return (
  //     <div
  //       className="flex items-center gap-4 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-blue-400/20 shadow-md p-4"
  //     >
  //       {/* Rank */}
  //       <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white font-bold text-lg shadow-lg">
  //         {index + 1}
  //       </div>

  //       {/* Avatar */}
  //       <div className="relative flex-none">
  //         <img src={player.avatar} alt={player.userName}
  //           className="w-14 h-14 rounded-full border-2 border-blue-400/50 shadow-md" />
  //         {/* {round === "4" && player.stt && playerColors[player.stt] && (
  //           <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg"
  //             style={{ backgroundColor: playerColors[player.stt] }} />
  //         )} */}
  //       </div>

  //       {/* Name & Score */}
  //       <div className="flex flex-col flex-none min-w-[120px]">
  //         <p className="text-white font-semibold text-base">{player.userName}</p>
  //         <div className="bg-gradient-to-r from-blue-600/50 to-cyan-500/50 backdrop-blur-sm text-white text-center py-1 px-3 rounded-lg font-mono text-lg border border-blue-400/30 shadow-sm whitespace-nowrap">
  //           {`${player.score} điểm`}
  //         </div>
  //       </div>

  //       {/* Divider */}
  //       <div className="h-full w-px bg-blue-400/20 mx-2"></div>

  //       {/* Answer Spots */}
  //       <div className="flex-1 flex justify-between items-center gap-1">
  //         {Array.from({ length: 10 }).map((_, idx) => {
  //           const ans = player.answers?.[idx];
  //           return (

  //             <div key={idx} className="flex flex-col items-center">
  //               {/* Number above the spot */}
  //               <span className="text-[10px] text-gray-300 mb-1">
  //                 {idx + 1}
  //               </span>

  //               {/* Answer spot */}
  //               <div
  //                 className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${ans
  //                   ? ans.isCorrect
  //                     ? "bg-green-500 text-white"
  //                     : "bg-red-500 text-white"
  //                   : "bg-gray-500/50"
  //                   }`}
  //               >
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>
  //     // <motion.div
  //     //   layout
  //     //   initial={{ opacity: 0, y: 30 }}
  //     //   animate={{ opacity: 1, y: 0 }}
  //     //   exit={{ opacity: 0, y: -30 }}
  //     //   transition={{ type: "spring", stiffness: 300, damping: 25 }}
  //     //   className="flex items-center gap-4 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-blue-400/20 shadow-md p-4"
  //     // >

  //     // </motion.div>
  //   );
  // }
  // const PlayerRow = React.memo(({ player, index, round }: {
  //   player: PlayerData, index: number, round: string
  // }) => {
    
  // });


  useEffect(() => {
    const unsubscribePlayerAnswerList = listenToPlayerAnswerList((scores) => {
      if (!scores) return
      const mappedScores = Object.values(scores).map((raw: any) => ({
        ...raw,
        isCorrect: raw.is_correct,
        answers: Array.isArray(raw.answers) ? raw.answers : []
      }));

      const answersCount = Object.values(scores).map((item: any) => item.answer)
      dispatch(setAnswersCount(answersCount))
      console.log("mappedScores", mappedScores);
      setScoresRanking(mappedScores)
    });
    return () => {
      unsubscribePlayerAnswerList();
    };
  }, [])

  // useEffect(() => {
  //   const unsubscribePlayerColors = listenToPlayerColors((colors) => {
  //     setPlayerColors(colors || {});
  //   });
  //   return () => unsubscribePlayerColors();
  // }, [roomId, listenToPlayerColors]);

  const sortedScoresRanking = Array.isArray(scoresRanking)
    ? Object.values(scoresRanking).sort((a, b) => b.score! - a.score!)
    : [];

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-blue-400/40 shadow-xl p-5 w-full max-w-full mx-auto">
      <QuestionAndAnswer
        currentQuestion={currentQuestion}
        currentCorrectAnswer={currentCorrectAnswer}
      />
      <h2 className="text-white font-extrabold text-2xl mb-4 text-center border-b border-blue-400/30 pb-3 tracking-wide">
        Bảng Điểm
      </h2>

      <div className="flex flex-col gap-3">
        {sortedScoresRanking.map((player: PlayerData, index: number) => (
          <PlayerRow
            key={player.userName}
            player={player}
            index={index}
            round={round}
          // playerColors={playerColors}
          />
        ))}
        <AnimatePresence>

        </AnimatePresence>
      </div>
    </div>
  );
});



export default HostRanking;
