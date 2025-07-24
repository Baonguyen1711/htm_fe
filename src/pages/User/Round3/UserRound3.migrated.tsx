// MIGRATED VERSION: UserRound3 using Redux and new hooks
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/store";
import { setCurrentRound } from "../../../app/store/slices/gameSlice";
import { useFirebaseListener } from "../../../shared/hooks";
import { GameState } from "../../../shared/types";
import Round3 from "../../../layouts/RoundBase/Round3.migrated";
import User from "../../../layouts/User/User";

interface UserRound3Props {
    isSpectator?: boolean;
}

function UserRound3({ isSpectator }: UserRound3Props) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // Redux state
    const { 
        currentRound,
        loading 
    } = useAppSelector((state) => state.game as GameState);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    const round = searchParams.get("round") || "";
    
    // Local state
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    
    // Refs
    const isMounted = useRef(false);
    const isFirstCallback = useRef(true);
    
    // Hooks
    const { listenToGameState } = useFirebaseListener(roomId);

    // Listen to round start
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

            // Navigate to new round
            console.log("Navigating to round", data.round);
            const targetRoute = isSpectator ? '/spectator' : '/play';
            navigate(`${targetRoute}?round=${data.round}&roomId=${roomId}`);
        });

        return unsubscribe;
    }, [roomId, round, isSpectator, navigate, dispatch]);

    // Show loading state
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Round 3...</p>
                </div>
            </div>
        );
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
        <User
            QuestionComponent={<Round3 isHost={false} isSpectator={isSpectator} />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound3;
