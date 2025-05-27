import { useEffect, useState, useRef } from "react";
import User from "../../../layouts/User/User";
import Round2 from "../../../layouts/RoundBase/Round2";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";
import { listenToBuzzing } from "../../../services/firebaseServices";
import { usePlayer } from "../../../context/playerContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { listenToRoundStart } from "../../../services/firebaseServices";

function UserRound2() {
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

            console.log("currentRound",currentRound);
            console.log("requestedRound", requestedRound);
            
            
            if (requestedRound === currentRound) {
                setIsAllowed(true);
            } else {
                setIsAllowed(false);
                if (currentRound) {
                    navigate(`/play?round=${data.round}&roomId=${roomId}`, { replace: true });
                }
            }

            
            if (isFirstCallback.current) {
                isFirstCallback.current = false;
                return;
            }


            console.log("round", data)
            setInitialGrid(data.grid)
            navigate(`/play?round=${data.round}&roomId=${roomId}`);
        });

        return () => {
            unsubscribePlayers();
        };
    }, [roomId]);


  // Handle grid loading
  useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      console.log("initialGrid",initialGrid);
      
      setLoading(false);
    }
  }, [initialGrid]);

  // Listen for buzzing events
  useEffect(() => {


    const unsubscribeBuzzing = listenToBuzzing(roomId, (playerName) => {
      if (playerName) {
        setBuzzedPlayer(playerName);
        console.log("playerName", typeof playerName);
        
        console.log(playerName,"đã bấm chuông")
        setShowModal(true); // Show modal when a player buzzes
      }
    });

    return () => {
      unsubscribeBuzzing();
    };
  }, [roomId]);

  // Close modal handler
  const handleCloseModal = () => {
    setShowModal(false);
    // Optionally clear buzzedPlayer if you want to reset it
    setBuzzedPlayer("");
  };

  return (
    <>
      <ReactPlaceholder type="text" rows={3} ready={!loading}>
        <User QuestionComponent={<Round2 initialGrid={initialGrid} isHost={false} />} />
      </ReactPlaceholder>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {`${buzzedPlayer} đã nhấn chuông trả lời`} 
            </h2>
            <div className="flex justify-center">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserRound2;