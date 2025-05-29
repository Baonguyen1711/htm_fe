import React from 'react'
import Play from '../Play'
import PlayerScore from '../../components/PlayerScore'
import PlayerAnswer from '../../components/PlayerAnswer'

interface UserInterfaceProps {
    QuestionComponent: React.ReactNode,
    isSpectator?: boolean
}

const User:React.FC<UserInterfaceProps> = ({QuestionComponent, isSpectator = false}) => {
  return (
    <Play
        questionComponent={QuestionComponent}
        PlayerScore={<PlayerAnswer isSpectator={isSpectator} />}
        SideBar={<PlayerScore />}
    />
  )
}

export default User