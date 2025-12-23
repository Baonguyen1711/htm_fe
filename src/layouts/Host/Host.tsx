import React, { useRef, useState } from 'react'
import Play from '../../components/Play'
import HostAnswer from '../../components/HostAnswer'
import HostManagement from '../../components/HostManagement'
import MultipleChoice from '../../components/ui/MultipleChoice'
import { MultipleChoiceProps } from '../../shared/types'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFirebaseListener } from '../../shared/hooks'
import { useAppSelector } from '../../app/store'

interface HostInterfaceProps {
  QuestionComponent: React.ReactNode
}

const Host: React.FC<HostInterfaceProps> = ({ QuestionComponent }) => {
  const [params] = useSearchParams()
  const roomMode = params.get("roomMode") || "room"


  return (
    <Play
      questionComponent={QuestionComponent}
      PlayerScore={roomMode === "multiplayer" ? null : <HostAnswer />}
      SideBar={<HostManagement />}
      isHost={true}
    />
  )
}

export default Host