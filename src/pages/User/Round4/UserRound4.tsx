import Round4 from '../../../layouts/RoundBase/Round4';
import User from '../../../layouts/User/User';
import { listenToRoundStart } from '../../../services/firebaseServices';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';
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

function UserRound4() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const roomId = searchParams.get("roomId") || "";
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
    return (
        // <Round4 isHost={false}/>
        <User
            QuestionComponent={<Round4 questions={exampleQuestions} initialGrid={exampleGrid} isHost={false}/>}
        />
    );
}

export default UserRound4;