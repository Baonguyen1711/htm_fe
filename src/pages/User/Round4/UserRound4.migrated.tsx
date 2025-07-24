// MIGRATED VERSION: UserRound4 using Redux and new hooks
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/store';
import { setCurrentRound, setRound4Grid } from '../../../app/store/slices/gameSlice';
import { useFirebaseListener } from '../../../shared/hooks';
import { GameState } from '../../../shared/types';
import Round4 from '../../../layouts/RoundBase/Round4.migrated';
import User from '../../../layouts/User/User';

const exampleGrid = [
    ['!', '', '?', '', '!'],
    ['', '?', '!', '', '?'],
    ['?', '', '', '!', '?'],
    ['!', '?', '', '', '!'],
    ['?', '!', '', '?', ''],
];

// Example questions for testing
const exampleQuestions = [
    'Question 1', 'Question 2', 'Question 3', 'Question 4', 'Question 5',
    'Question 6', 'Question 7', 'Question 8', 'Question 9', 'Question 10',
    'Question 11', 'Question 12', 'Question 13', 'Question 14', 'Question 15',
    'Question 16', 'Question 17', 'Question 18', 'Question 19', 'Question 20',
    'Question 21', 'Question 22', 'Question 23', 'Question 24', 'Question 25',
];

interface UserRound4Props {
    isSpectator?: boolean;
}

function UserRound4({ isSpectator }: UserRound4Props) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // Redux state
    const { 
        currentRound,
        round4Grid,
        loading 
    } = useAppSelector((state) => state.game as GameState);
    
    // URL params
    const roomId = searchParams.get("roomId") || "";
    const round = searchParams.get("round") || "";
    
    // Local state
    const [isLoading, setIsLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
    const [initialGrid, setInitialGrid] = useState<string[][]>(exampleGrid);
    
    // Refs
    const isFirstCallback = useRef(true);
    
    // Hooks
    const { listenToGameState } = useFirebaseListener(roomId);

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
                
                // Update Redux state - simplified for migration
                // Note: Round4Grid type expects Round4Cell[][], but we're using simple string[][]
                const simpleGrid = data.grid.map((row: any[]) =>
                    row.map((cell: any) => typeof cell === 'string' ? cell : '!')
                );
                dispatch(setRound4Grid({
                    cells: simpleGrid as any, // Type assertion for migration
                    selectedDifficulties: [],
                    starPositions: []
                }));
            }

            // Navigate to new round
            console.log("Navigating to round", data.round);
            const targetRoute = isSpectator ? '/spectator' : '/play';
            navigate(`${targetRoute}?round=${data.round}&roomId=${roomId}`);
        });

        return unsubscribe;
    }, [roomId, round, isSpectator, navigate, dispatch]);

    // Handle grid loading
    useEffect(() => {
        if (round4Grid?.cells && round4Grid.cells.length > 0) {
            console.log("Grid from Redux:", round4Grid.cells);
            // Convert Round4Cell[][] to string[][] for display
            const simpleGrid = round4Grid.cells.map(row =>
                row.map(cell => typeof cell === 'string' ? cell : (cell as any).symbol || '!')
            );
            setInitialGrid(simpleGrid);
            setIsLoading(false);
        } else if (initialGrid && initialGrid.length > 0) {
            console.log("Using example grid");
            setIsLoading(false);
        }
    }, [round4Grid, initialGrid]);

    // Show loading state
    if (loading.isLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Round 4...</p>
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
                <Round4 
                    initialGrid={initialGrid}
                    questions={exampleQuestions}
                    isHost={false} 
                    isSpectator={isSpectator} 
                />
            }
            isSpectator={isSpectator}
        />
    );
}

export default UserRound4;
