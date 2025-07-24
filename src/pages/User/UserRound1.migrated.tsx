// MIGRATED VERSION: UserRound1 using Redux and new hooks
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setCurrentRound, setRound2Grid } from '../../app/store/slices/gameSlice';
import { useFirebaseListener } from '../../shared/hooks';
import Round1 from '../../layouts/RoundBase/Round1.migrated';
import User from '../../layouts/User/User.migrated';

interface UserRound1Props {
    isSpectator?: boolean;
}

function UserRound1({ isSpectator }: UserRound1Props) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // Get data from Redux instead of context
    const { currentRound } = useAppSelector(state => state.game);
    const { currentRoom } = useAppSelector(state => state.room);
    
    const roomId = searchParams.get("roomId") || "";
    const round = searchParams.get("round") || "";
    
    const isFirstCallback = useRef(true);
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

    // Use new Firebase listener hook
    const { listenToGameState } = useFirebaseListener(roomId);

    useEffect(() => {
        if (!roomId) return;

        // Listen to round start using new Firebase hook
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

            // Skip first callback (same logic as original)
            if (isFirstCallback.current) {
                isFirstCallback.current = false;
                return;
            }

            console.log("round data", data);
            
            // Update grid in Redux if available
            if (data.grid) {
                dispatch(setRound2Grid({
                    cells: data.grid,
                    rows: data.grid.length,
                    cols: data.grid[0]?.length || 0,
                    horizontalRows: [],
                    cnv: '',
                    selectedRows: [],
                    correctRows: [],
                    incorrectRows: [],
                }));
            }

            // Navigate to appropriate round
            const targetRoute = isSpectator ? '/spectator' : '/play';
            navigate(`${targetRoute}?round=${currentRoundFromFirebase}&roomId=${roomId}`);
        });

        return unsubscribe;
    }, [roomId, round, isSpectator, navigate, dispatch, listenToGameState]);

    // Show loading state while checking permissions
    if (isAllowed === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking round permissions...</p>
                </div>
            </div>
        );
    }

    // Show error state if not allowed
    if (isAllowed === false) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Round Not Available</h2>
                    <p className="text-gray-600">You will be redirected to the current round...</p>
                </div>
            </div>
        );
    }

    return (
        <User
            QuestionComponent={<Round1 isHost={false} isSpectator={isSpectator} />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound1;
