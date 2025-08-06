// import PlayerQuestionBoxRoundTurn from '../../../layouts/RoundBase/Player/PlayerQuestionBoxRoundTurn';
// import User from '../../../layouts/User/User';
// import useFirebaseListener from "../../../shared/hooks/firebase/useFirebaseListener";
// import { useEffect, useRef, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { usePlayer } from '../../../context/playerContext';

// interface UserRoundTurnProps {
//     isSpectator?: boolean;
// }

// function UserRoundTurn({ isSpectator }: UserRoundTurnProps) {
//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate();
//     const roomId = searchParams.get("roomId") || "";
//     const round = searchParams.get("round") || "";
//     const { setInitialGrid } = usePlayer()

//     const isFirstCallback = useRef(true);
//     const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
//     const { listenToRoundStart } = useFirebaseListener(roomId);

//     useEffect(() => {
//         const unsubscribePlayers = listenToRoundStart(
//             (round) => {
//                 if (isSpectator) {
//                     navigate(`/spectator?round=${round}&roomId=${roomId}`, { replace: true });
//                 } else {
//                     navigate(`/play?round=${round}&roomId=${roomId}`, { replace: true });
//                 }
//             }
//         )

//         return () => {
//             unsubscribePlayers();
//         };
//     }, [roomId]);


//     return (
//         <User
//             QuestionComponent={<PlayerQuestionBoxRoundTurn isHost={false} isSpectator={isSpectator} />}
//             isSpectator={isSpectator}
//         />
//     );
// }

// export default UserRoundTurn;
