import React, { useRef, useState } from 'react'
// import Play from '../../components/Play'
import HostAnswer from '../../components/HostAnswer'
import HostManagement from '../../components/HostManagement'
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
import { ScoreRanking } from '../ScoreRanking'
import { PlayerAnswers } from '../PlayerAnswers'

import Leaderboard from '../../components/ui/LeaderBoard'
import RoomModeLeaderboard from '../../components/ui/RoomModeLeaderboard'


interface PlayerInterfaceProps {
  questionComponent: React.ReactNode,
  isSpectator?: boolean
}

const Player: React.FC<PlayerInterfaceProps> = ({ questionComponent, isSpectator }) => {
  const [params] = useSearchParams()
  const roomMode = params.get("roomMode") || "room"


  return (
    <GameLayout
      questionComponent={questionComponent}
      PlayerScore={<RoomModeLeaderboard/>}
      // PlayerAnswer={<PlayerAnswer/>}
      isHost={false}
      isSpectator={isSpectator}
    />
  )
}

export default Player