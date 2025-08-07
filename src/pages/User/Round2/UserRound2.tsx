import { useEffect, useState, useRef } from "react";
import User from "../../../layouts/User/User";
import PlayerQuestionBoxRound2 from "../../../components/Round2/PlayerQuestionBoxRound2";
import { useSearchParams, useNavigate } from "react-router-dom";
import FallBack from "../../../components/ui/Error/FallBack";
import useFirebaseListener from "../../../shared/hooks/firebase/useFirebaseListener";
import Modal from "../../../components/ui/Modal/Modal";
interface UserRound2Props {
  isSpectator?: boolean;
}

function UserRound2({ isSpectator }: UserRound2Props) {
  const [loading, setLoading] = useState(true);
  const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const navigate = useNavigate();
  const isMounted = useRef(false)
  const [searchParams] = useSearchParams();

  const round = searchParams.get("round") || "";

  const isFirstCallback = useRef(true);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const { listenToRoundStart, listenToBuzzedPlayer } = useFirebaseListener();
  useEffect(() => {
    const unsubscribeBuzzedPlayer = listenToBuzzedPlayer(
      (playerName) => {
        setShowModal(true)
        setBuzzedPlayer(playerName)
      }
    )

    return () => {
      unsubscribeBuzzedPlayer();
    };
  }, [])
  const handleCloseModal = () => {
    setShowModal(false);
    // Optionally clear buzzedPlayer if you want to reset it
    setBuzzedPlayer("");

  };

  // useEffect(() => {
  //       const unsubscribePlayers = listenToRoundStart(
  //           (round) => {
  //               if (isSpectator) {
  //                   navigate(`/spectator?round=${round}&roomId=${roomId}`, { replace: true });
  //               } else {
  //                   navigate(`/play?round=${round}&roomId=${roomId}`, { replace: true });
  //               }
  //           }
  //       )

  //       return () => {
  //           unsubscribePlayers();
  //       };
  //   }, [roomId]);



  // Handle grid loading
  // useEffect(() => {
  //   if (initialGrid && initialGrid.length > 0) {
  //     console.log("initialGrid", initialGrid);

  //     setLoading(false);
  //   }
  // }, [initialGrid]);

  return (
    <>
      <User
        QuestionComponent={
          <PlayerQuestionBoxRound2 isHost={false} isSpectator={isSpectator} />
        }
        isSpectator={isSpectator}
      />

      {showModal && buzzedPlayer && 
        <Modal
              text={`${buzzedPlayer} đã nhấn chuông trả lời`}
              buttons={[
                { text: "Đóng", onClick: handleCloseModal, variant: "primary" },
              ]}
              onClose={handleCloseModal}
        />
      }
    </>



  );
}

export default UserRound2;