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
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/store'
import { setCurrentCorrectAnswer } from '../../app/store/slices/gameSlice'


interface PlayerInterfaceProps {
  questionComponent: React.ReactNode,
  isSpectator?: boolean,
  isMC?: boolean
}

const Player: React.FC<PlayerInterfaceProps> = ({ questionComponent, isSpectator, isMC }) => {
  const [params] = useSearchParams()
  const roomMode = params.get("roomMode") || "room"
  const roomId = params.get("roomId") || ""
  const dispatch = useAppDispatch()
  const navigate = useNavigate();

  const { listenToRoundStart, listenToCorrectAnswerForMC } = useFirebaseListener();
  useEffect(() => {
    const unsubscribeRoundStart = listenToRoundStart(
      (round) => {


        if (isMC) {
          navigate(`/mc?round=${round}&roomId=${roomId}`, { replace: true });
          return
        }

      }
    )

    return () => {
      unsubscribeRoundStart();
    };
  }, []);

  useEffect(() => {
    console.log("Listening to correct answer for MC host before...", isMC);
    if (!isMC) return;
    console.log("Listening to correct answer for MC host...", isMC);
    const unsubscribe = listenToCorrectAnswerForMC(() => {

    });

    return () => {
      unsubscribe();
    }

  }, [])

  // useEffect(() => {
  //   if (!isMC) return;
  //   return () => {
  //     dispatch(setCurrentCorrectAnswer(""));
  //   }
  // }, [])

  return (
    <GameLayout
      questionComponent={questionComponent}
      PlayerScore={<RoomModeLeaderboard/>}
      // PlayerAnswer={<PlayerAnswer/>}
      isHost={false}
      isSpectator={isSpectator}
      isMC={isMC}
    />
  )
}

export default Player