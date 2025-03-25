import React from 'react'
import Play from '../Play'
import PlayerScore from '../../components/PlayerScore'
import PlayerAnswer from '../../components/PlayerAnswer'

interface UserInterfaceProps {
    QuestionComponent: React.ReactNode
}

const User:React.FC<UserInterfaceProps> = ({QuestionComponent}) => {
  return (
    <Play
        questionComponent={QuestionComponent}
        PlayerScore={<PlayerAnswer/>}
        SideBar={<PlayerScore/>}
    />
  )
}

export default User