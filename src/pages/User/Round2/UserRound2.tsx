import { useEffect, useState, useRef } from "react";
import User from "../../../layouts/User/User";
import Round2 from "../../../layouts/RoundBase/Round2";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";
import { listenToBuzzing } from "../../../services/firebaseServices";
import { usePlayer } from "../../../context/playerContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { listenToRoundStart } from "../../../services/firebaseServices";
import FallBack from "../../../components/ui/FallBack";
interface UserRound2Props {
  isSpectator?: boolean;
}

function UserRound2({ isSpectator }: UserRound2Props) {
  const [loading, setLoading] = useState(true);
  const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const { roomId, initialGrid } = usePlayer();
  const navigate = useNavigate();
  const isMounted = useRef(false)
  const [searchParams] = useSearchParams();

  const round = searchParams.get("round") || "";
  const { setInitialGrid } = usePlayer()

  const isFirstCallback = useRef(true);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribePlayers = listenToRoundStart(roomId, (data) => {


      const currentRound = data.round;
      const requestedRound = parseInt(round || "", 10);

      console.log("currentRound", currentRound);
      console.log("requestedRound", requestedRound);


      if (requestedRound === currentRound) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
        if (currentRound) {
          if (isSpectator) {
            navigate(`/spectator?round=${data.round}&roomId=${roomId}`, { replace: true });
          } else {
            navigate(`/play?round=${data.round}&roomId=${roomId}`, { replace: true });
          }
        }
      }


      if (isFirstCallback.current) {
        isFirstCallback.current = false;
        return;
      }


      console.log("round", data)
      setInitialGrid(data.grid)
      if (isSpectator) {
        navigate(`/spectator?round=${data.round}&roomId=${roomId}`);
      } else {
        navigate(`/play?round=${data.round}&roomId=${roomId}`);
      }
    });

    return () => {
      unsubscribePlayers();
    };
  }, [roomId]);


  // Handle grid loading
  useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      console.log("initialGrid", initialGrid);

      setLoading(false);
    }
  }, [initialGrid]);

  return (
  <>
    {loading ? (
      <FallBack />
    ) : (
      <User
        QuestionComponent={
          <Round2 initialGrid={initialGrid} isHost={false} isSpectator={isSpectator} />
        }
        isSpectator={isSpectator}
      />
    )}

    {/* Modal ... */}
  </>
);
}

export default UserRound2;