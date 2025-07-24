// MIGRATED VERSION: UserRound2 using Redux and new hooks
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/store";
import { setCurrentRound, setRound2Grid } from "../../../app/store/slices/gameSlice";
import { addToast } from "../../../app/store/slices/uiSlice";
import { useFirebaseListener } from "../../../shared/hooks";
import { GameState } from "../../../shared/types";
import User from "../../../layouts/User/User";
import Round2 from "../../../layouts/RoundBase/Round2.migrated";
import ReactPlaceholder from "react-placeholder";
import "react-placeholder/lib/reactPlaceholder.css";
import FallBack from "../../../components/ui/FallBack";

interface UserRound2Props {
  isSpectator?: boolean;
}

function UserRound2({ isSpectator }: UserRound2Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { 
    currentRound, 
    round2Grid,
    loading 
  } = useAppSelector((state) => state.game as GameState);
  
  // URL params
  const roomId = searchParams.get("roomId") || "";
  const round = searchParams.get("round") || "";
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [initialGrid, setInitialGrid] = useState<string[][]>([]);
  
  // Refs
  const isMounted = useRef(false);
  const isFirstCallback = useRef(true);
  
  // Hooks
  const {
    listenToGameState
  } = useFirebaseListener(roomId);

  // Listen to round start and grid data
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = listenToGameState((data) => {
      if (!data) return;

      const currentRoundFromFirebase = data.round;
      const requestedRound = parseInt(round || "", 10);

      console.log("currentRound", currentRoundFromFirebase);
      console.log("requestedRound", requestedRound);

      // Update Redux state
      if (currentRoundFromFirebase) {
        dispatch(setCurrentRound(currentRoundFromFirebase));
      }

      // Check if user is allowed in this round
      if (requestedRound === currentRoundFromFirebase) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
        if (currentRoundFromFirebase) {
          const targetRoute = isSpectator ? '/spectator' : '/play';
          navigate(`${targetRoute}?round=${currentRoundFromFirebase}&roomId=${roomId}`, { 
            replace: true 
          });
        }
      }

      // Handle first callback
      if (isFirstCallback.current) {
        isFirstCallback.current = false;
        return;
      }

      // Update grid data
      if (data.grid) {
        console.log("Grid data received:", data.grid);
        setInitialGrid(data.grid);
        
        // Update Redux state
        dispatch(setRound2Grid({
          cells: data.grid,
          rows: data.grid.length,
          cols: data.grid[0]?.length || 0,
          horizontalRows: data.horizontalRows || [],
          cnv: data.cnv || "",
          selectedRows: [],
          correctRows: [],
          incorrectRows: []
        }));
      }

      // Navigate to new round
      const targetRoute = isSpectator ? '/spectator' : '/play';
      navigate(`${targetRoute}?round=${data.round}&roomId=${roomId}`);
    });

    return unsubscribe;
  }, [roomId, round, isSpectator, navigate, dispatch]);

  // Listen to buzzing events through game state
  useEffect(() => {
    if (!roomId) return;

    return listenToGameState((gameState) => {
      if (gameState && gameState.buzzing) {
        setBuzzedPlayer(gameState.buzzedPlayer || "");
        setShowModal(gameState.buzzing || false);
      }
    });
  }, [roomId, listenToGameState]);

  // Handle grid loading
  useEffect(() => {
    if (round2Grid?.cells && round2Grid.cells.length > 0) {
      console.log("Grid from Redux:", round2Grid.cells);
      setInitialGrid(round2Grid.cells);
      setIsLoading(false);
    } else if (initialGrid && initialGrid.length > 0) {
      console.log("Grid from local state:", initialGrid);
      setIsLoading(false);
    }
  }, [round2Grid, initialGrid]);

  // Show loading state
  if (loading.isLoading || isLoading) {
    return <FallBack />;
  }

  // Show access denied if not allowed
  if (isAllowed === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You are not allowed to access this round.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <User
        QuestionComponent={
          <Round2 
            initialGrid={initialGrid} 
            isHost={false} 
            isSpectator={isSpectator} 
          />
        }
        isSpectator={isSpectator}
      />

      {/* Buzzing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Player Buzzed!
              </h3>
              <p className="text-gray-600 mb-4">
                {buzzedPlayer} has buzzed in!
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserRound2;
