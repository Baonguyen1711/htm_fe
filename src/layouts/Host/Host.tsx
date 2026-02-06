import React, { useRef, useState } from 'react'
// import Play from '../../components/Play'
// import HostAnswer from '../../components/HostAnswer'
// import HostManagement from '../../components/HostManagement'
import MultipleChoice from '../../components/ui/MultipleChoice'
import { MultipleChoiceProps } from '../../shared/types'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFirebaseListener } from '../../shared/hooks'
import { useAppSelector } from '../../app/store'
import Play from '../../components/NewPlay'
import PlayerScore from '../../components/PlayerScore'
import PlayerAnswer from '../../components/PlayerAnswer'
import HostControlPanel from '../../components/HostControlPanel'
import GameLayout from '../GameLayout'
import HostManagement from '../../components/NewHostControlPanel'

import { ScoreRanking } from '../ScoreRanking'
import RoomModeLeaderboard from '../../components/ui/RoomModeLeaderboard'
import HostAnswer from '../../components/NewHostAnswer'
import { useAppDispatch } from '../../app/store'
import { setCurrentCorrectAnswer } from '../../app/store/slices/gameSlice'
import { useNavigate } from 'react-router-dom'

interface HostInterfaceProps {
  QuestionComponent: React.ReactNode,
  isMC?: boolean
}

const Host: React.FC<HostInterfaceProps> = ({ QuestionComponent, isMC = false }) => {
  const [params] = useSearchParams()
  const roomMode = params.get("roomMode") || "room"
  const roomId = params.get("roomId") || ""

  return (
    <GameLayout
      questionComponent={QuestionComponent}
      PlayerScore={!isMC ? <HostAnswer /> : <RoomModeLeaderboard />}
      HostManagement={!isMC ? <HostManagement /> : null}
      isHost={true}
      isMC={isMC}
    />
  )
}

export default Host