import Round3 from "../../../layouts/RoundBase/Round3";
import User from "../../../layouts/User/User";
import { useSearchParams, useNavigate } from "react-router-dom";
import { listenToRoundStart } from "../../../services/firebaseServices";
import { useEffect, useState, useRef } from "react";
import { usePlayer } from "../../../context/playerContext";
function UserRound3() {
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
        <User
            QuestionComponent={<Round3 />}
        />
    );
}

export default UserRound3;
