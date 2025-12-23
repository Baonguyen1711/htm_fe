import React, { useEffect, useState } from "react";
import { PlayerData, Score } from "../shared/types";
import { useSearchParams } from "react-router-dom";
import { useFirebaseListener } from "../shared/hooks";
import { useAppSelector } from "../app/store";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../shared/components/ui";
import { PlayCircleIcon, PlusCircle } from "lucide-react";
import { setShowGameStartCountdown } from "../app/store/slices/gameSlice";
import { useAppDispatch } from "../app/store";
import { toast } from "react-toastify";
import Modal from "./ui/Modal/Modal";
import useGameApi from "../shared/hooks/api/useGameApi";
interface PlayerScoreProps {
  playerColors?: Record<string, string>;
}


function PlayerScore({ playerColors: propPlayerColors = {} }: PlayerScoreProps) {
  const [playerColors, setPlayerColors] = useState<Record<string, string>>(propPlayerColors);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [invitePlayerName, setInvitePlayerName] = useState<string>("");
  const [inviteGroupId, setInviteGroupId] = useState<string>("");
  const [inviterUid, setInviterUid] = useState<string>("");

  //const [scoresRanking, setScoresRanking] = useState<PlayerData[]>([]);
  const [params] = useSearchParams();
  const round = params.get("round") || "1";
  const roomId = params.get("roomId") || "1";
  const isRoomOwner = params.get("isRoomOwner") === "true";
  const roomMode = params.get("roomMode") || "manual";
  const playMode = params.get("playMode") || "manual";
  const { listenToScoresRanking, listenToPlayerColors, listenToPlayerAnswerList, listenToGroupInvite } = useFirebaseListener();
  const { scoresRanking } = useAppSelector((state) => state.game);
  const dispatch = useAppDispatch();
  const { multiplayerStart, multiplayerGroupInvite, multiplayerAcceptInvite } = useGameApi();
  useEffect(() => {
    const unsubscribeScores = listenToScoresRanking(() => { });
    return () => {
      unsubscribeScores();
    };
  }, [roomId]);

  const handleStartClick = async () => {
    if (roomMode === "practice" && playMode === "auto") {
      console.log("get next question multiplayer")
      dispatch(setShowGameStartCountdown(true))
      await multiplayerStart(roomId, localStorage.getItem('testId') || "", playMode)
      toast.success(`Đã bắt đầu trận đấu`)
      //await dispatch(getQuestions({ isJump: false, round: "multiplayer", roomId: roomId, testName: testName }));
    }
  }

  const handleInviteClick = async (playerId: string) => {
    try {
      const currentPlayerGroupId = localStorage.getItem("groupId");
      const currentPlayer = JSON.parse(localStorage.getItem("currentPlayer") || "{}");
      await multiplayerGroupInvite(roomId, playerId, currentPlayer.userName, currentPlayerGroupId || "");
      toast.success(`Đã mời ${playerId} tham gia nhóm`);
    } catch (error: any) {
      toast.error(`Lỗi khi mời ${playerId}: ${error.message}`);
    }
  }

  const handleAcceptInvite = async () => {
    // Logic to accept the invite
    localStorage.setItem("groupId", inviteGroupId);
    await multiplayerAcceptInvite(roomId, inviteGroupId, inviterUid);
    setShowInviteModal(false);
  }


  useEffect(() => {
    const unsubscribePlayerGroupInvite = listenToGroupInvite((invite) => {
      console.log("Received group invite:", invite);
      // Handle the invite (e.g., show a modal to accept/reject)
      setShowInviteModal(true);
      setInvitePlayerName(invite.from_player);
      setInviteGroupId(invite.group_id);
      setInviterUid(invite.from_uid);
    });
    return () => {
      unsubscribePlayerGroupInvite();
    };
  }, [])
  // useEffect(() => {
  //   const unsubscribePlayerAnswerList = listenToPlayerAnswerList((scores) => {
  //     if(!scores) return
  //     console.log("scores", Object.values(scores));
  //     setScoresRanking(Object.values(scores))
  //   });
  //   return () => {
  //     unsubscribePlayerAnswerList();
  //   };
  // },[])

  useEffect(() => {
    const unsubscribePlayerColors = listenToPlayerColors((colors) => {
      setPlayerColors(colors || {});
    });
    return () => unsubscribePlayerColors();
  }, [roomId, listenToPlayerColors]);

  const sortedScoresRanking = Array.isArray(scoresRanking)
    ? [...scoresRanking].sort((a, b) => b.score! - a.score!)
    : [];

  return (

    <>
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-blue-400/40 shadow-xl p-5 w-full max-w-full mx-auto">
        {
          roomMode === "practice" && isRoomOwner && (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleStartClick}
                variant="success"
                size="md"
                fullWidth
                leftIcon={<PlayCircleIcon className="w-4 h-4" />}
                className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
              >
                {roomMode === "practice" ? "BẮT ĐẦU" : "BẮT ĐẦU VÒNG THI"}
              </Button>
              {/* Current Question Index Input */}

            </div>
          )
        }
        <h2 className="text-white font-extrabold text-2xl mb-4 text-center border-b border-blue-400/30 pb-3 tracking-wide">
          Bảng Điểm
        </h2>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {sortedScoresRanking.map((player: PlayerData, index: number) => (
              <motion.div
                key={player.userName || player.groupId || index}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col gap-3 bg-gradient-to-r from-slate-700/70 to-slate-600/70 rounded-xl border border-blue-400/20 shadow-md p-4"
              >
                {/* Rank */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* if group */}
                  {player.groupId && Array.isArray(player.avatar) ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {player.avatar?.map((avatarUrl, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <img
                            src={avatarUrl}
                            alt={player.userName?.[i]}
                            className="w-12 h-12 rounded-full border-2 border-blue-400/50 shadow-md"
                          />
                          <p className="text-white font-semibold text-sm">{player.userName?.[i]}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // single player display
                    <div className="flex items-center gap-4">
                      <img
                        src={player.avatar}
                        alt={player.userName}
                        className="w-14 h-14 rounded-full border-2 border-blue-400/50 shadow-md"
                      />
                      {/* ✅ Invite Button */}
                      <button
                        onClick={() =>
                          handleInviteClick(player.uid || "")
                        }
                        className="text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-transform"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                      <p className="text-white font-semibold text-base">{player.userName}</p>
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="bg-gradient-to-r from-blue-600/50 to-cyan-500/50 backdrop-blur-sm text-white text-center py-1 px-3 rounded-lg font-mono text-lg border border-blue-400/30 shadow-sm whitespace-nowrap">
                  {`${player.score} điểm`}
                </div>
              </motion.div>
            ))}

          </AnimatePresence>
        </div>

        {showInviteModal && (
          <Modal
            text={`${invitePlayerName} mời bạn tham gia nhóm của họ.`}
            buttons={[
              { text: "Chấp nhận", onClick: handleAcceptInvite, variant: "primary" },
              { text: "Từ chối", onClick: () => setShowInviteModal(false), variant: "secondary" },
            ]}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </div>

      {/* Invite Modal */}

    </>

  );

}

export default PlayerScore;
