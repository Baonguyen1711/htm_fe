import React from 'react'
import Host from '../../../layouts/Host/Host';
import PlayerLobby from '../../../components/PlayerLobby';
import { useAppSelector } from '../../../app/store';
import { useAppDispatch } from '../../../app/store';
import CountdownCard from '../../../components/ui/CountDownCard';
import { setShowGameStartCountdown } from '../../../app/store/slices/gameSlice';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
const HostLobby = () => {
    const dispatch = useAppDispatch()
    const { showGameStartCountdown } = useAppSelector(state => state.game)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const testName = searchParams.get("testName") || ""
    const multiplayerScoringMode = searchParams.get("playMode") || "manual"
    return (
        <>
            <Host
                QuestionComponent={<PlayerLobby isHost={true} />}
            />

            {showGameStartCountdown && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <CountdownCard
                        startFrom={5}
                        message="Trận đấu bắt đầu sau"
                        onComplete={() => {
                            dispatch(setShowGameStartCountdown(false))
                            navigate(`/host?roomId=${roomId}&testName=${testName}&roomMode=multiplayer&playMode=${multiplayerScoringMode}`);
                        }}
                    />
                </div>
            )}
        </>

    )
}

export default HostLobby