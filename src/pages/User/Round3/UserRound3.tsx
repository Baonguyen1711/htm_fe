import Round3 from "../../../layouts/RoundBase/Round3";
import User from "../../../layouts/User/User";
import { useSearchParams, useNavigate } from "react-router-dom";
import { listenToRoundStart } from "../../../services/firebaseServices";
import { useEffect, useState, useRef } from "react";
import { usePlayer } from "../../../context/playerContext";

interface UserRound3Props {
    isSpectator?: boolean;
}

function UserRound3({ isSpectator }: UserRound3Props) {
    const navigate = useNavigate();
    const isMounted = useRef(false)
    const [searchParams] = useSearchParams();

    const round = searchParams.get("round") || "";
    const roomId = searchParams.get("roomId") || "";
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
            QuestionComponent={<Round3 />}
            isSpectator={isSpectator}
        />
    );
}

export default UserRound3;
