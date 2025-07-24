// MIGRATED VERSION: UserRoundTurn using Redux and new hooks
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import { setCurrentRound } from '../../../app/store/slices/gameSlice';
import { useFirebaseListener } from '../../../shared/hooks';
import { GameState } from '../../../shared/types';
import PlayerQuestionBoxRoundTurn from '../../../layouts/RoundBase/Player/PlayerQuestionBoxRoundTurn';
import User from '../../../layouts/User/User';

interface UserRoundTurnProps {
    isSpectator?: boolean;
}

function UserRoundTurn({ isSpectator }: UserRoundTurnProps) {
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
    const isFirstCallback = useRef(true);
    
    // Hooks
    const { listenToGameState } = useFirebaseListener(roomId);

    // Listen to round start
    useEffect(() => {
        if (!roomId) return;

        const unsubscribe = listenToGameState((data) => {
            if (!data) return;

            const currentRoundFromFirebase = data.round;
            const requestedRound = round === "turn" ? "turn" : parseInt(round || "", 10);

            console.log("currentRound", currentRoundFromFirebase);
            console.log("requestedRound", requestedRound);

            // Update Redux state
            if (typeof currentRoundFromFirebase === 'number') {
                dispatch(setCurrentRound(currentRoundFromFirebase));
            }

            // Check if user is allowed in this round
            if (requestedRound === currentRoundFromFirebase || 
                (requestedRound === "turn" && currentRoundFromFirebase === "turn")) {
                setIsAllowed(true);
            } else {
                setIsAllowed(false);
                if (currentRoundFromFirebase) {
                    const targetRoute = isSpectator ? '/spectator' : '/play';
                    const roundParam = currentRoundFromFirebase === "turn" ? "turn" : currentRoundFromFirebase;
                    navigate(`${targetRoute}?round=${roundParam}&roomId=${roomId}`, { 
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
            const roundParam = data.round === "turn" ? "turn" : data.round;
            navigate(`${targetRoute}?round=${roundParam}&roomId=${roomId}`);
        });

        return unsubscribe;
    }, [roomId, round, isSpectator, navigate, dispatch]);

    // Show loading state
    if (loading.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Turn-based Round...</p>
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
            QuestionComponent={
                <PlayerQuestionBoxRoundTurn 
                    isHost={false} 
                    isSpectator={isSpectator} 
                />
            }
            isSpectator={isSpectator}
        />
    );
}

export default UserRoundTurn;
