import React, { useEffect } from 'react'
import Play from '../../components/Play'
import PlayerScore from '../../components/PlayerScore'
import PlayerAnswer from '../../components/PlayerAnswer'
import { useFirebaseListener } from '../../shared/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface UserInterfaceProps {
  QuestionComponent: React.ReactNode,
  isSpectator?: boolean
}


const User: React.FC<UserInterfaceProps> = ({ QuestionComponent, isSpectator = false }) => {
  const { listenToRoundStart } = useFirebaseListener();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId") || "";
  const round = searchParams.get("round") || "";
  const isPlayer = window.location.pathname.includes('play');

  useEffect(() => {
    const unsubscribePlayers = listenToRoundStart(
      (round) => {
        if (isSpectator) {
          navigate(`/spectator?round=${round}&roomId=${roomId}`, { replace: true });
        }
        if (isPlayer) {
          navigate(`/play?round=${round}&roomId=${roomId}`, { replace: true });
        }
      }
    )

    return () => {
      unsubscribePlayers();
    };
  }, [round]);
  return (
    <Play
      questionComponent={QuestionComponent}
      PlayerScore={<PlayerAnswer isSpectator={isSpectator} />}
      SideBar={<PlayerScore />}
      isHost={false}
      isSpectator={isSpectator}
    />
  )
}

export default User

