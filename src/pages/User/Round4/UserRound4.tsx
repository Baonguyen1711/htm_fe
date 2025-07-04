import Round4 from '../../../layouts/RoundBase/Round4';
import User from '../../../layouts/User/User';
import { listenToRoundStart } from '../../../services/firebaseServices';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';
import PlayerQuestionBoxRound4 from '../../../layouts/RoundBase/Player/PlayerQuestionBoxRound4';
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
    const roomId = searchParams.get("roomId") || "";
    const round = searchParams.get("round") || "";
    const { initialGrid , setInitialGrid } = usePlayer()
    const [loading, setLoading] = useState(true);
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
                navigate(`/spectator?round=${data.round}&roomId=${roomId}`, { replace: true });
            } else {
                navigate(`/play?round=${data.round}&roomId=${roomId}`, { replace: true });
            }
        });

        return () => {
            unsubscribePlayers();
        };
    }, [roomId]);

    useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      console.log("initialGrid", initialGrid);

      setLoading(false);
    }
  }, [initialGrid]);
    return (
        // <Round4 isHost={false}/>
        <User
            QuestionComponent={<PlayerQuestionBoxRound4 questions={exampleQuestions} initialGrid={initialGrid} isHost={false} isSpectator={isSpectator} />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound4;