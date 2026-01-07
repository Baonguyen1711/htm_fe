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
    <div className="bg-slate-800/70 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center px-3 text-sm font-semibold text-white/80 border-b border-white/10">
        Bảng điểm
      </div>

      {/* Fixed 4 rows */}
      <div className="flex flex-col">
        {[0, 1, 2, 3].map((index) => {
          const player = sortedScoresRanking[index];

          return (
            <div
              key={index}
              className="h-14 flex items-center gap-3 px-3 border-b last:border-b-0 border-white/5 bg-slate-700/40"
            >
              {player ? (
                <>
                  {/* Avatar */}
                  <img
                    src={player.avatar}
                    alt={player.userName}
                    className="w-9 h-9 rounded-full border border-white/50 shrink-0 object-cover"
                  />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {player.userName}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-sm font-mono text-cyan-300 shrink-0">
                    {player.score}
                  </div>
                </>
              ) : (
                <div className="w-full h-full opacity-30" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );


}

export default PlayerScore;
