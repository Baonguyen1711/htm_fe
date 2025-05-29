import Round1 from '../../layouts/RoundBase/Round1';
import User from '../../layouts/User/User';
import { listenToRoundStart } from '../../services/firebaseServices';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../context/playerContext';

interface UserRound1Props {
    isSpectator?: boolean;
}

function UserRound1({ isSpectator }: UserRound1Props) {
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

    return (
        <User
            QuestionComponent={<Round1 isHost={false} isSpectator={isSpectator} />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound1;
