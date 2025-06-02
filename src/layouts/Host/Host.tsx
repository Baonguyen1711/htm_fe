import React from 'react'
import Play from '../Play'
import HostAnswer from '../../components/HostAnswer'
import HostManagement from '../../components/HostManagement'

interface HostInterfaceProps {
    QuestionComponent: React.ReactNode
}

const Host:React.FC<HostInterfaceProps> = ({QuestionComponent}) => {
  return (
    <Play
        questionComponent={QuestionComponent}
        PlayerScore={<HostAnswer/>}
        SideBar={<HostManagement/>}
        isHost={true}
    />
  )
}

export default Host