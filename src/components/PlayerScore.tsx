import React from 'react'
import { User } from '../type'
import { usePlayer } from '../context/playerContext'
function PlayerScore() {
    const { playersArray } = usePlayer()

    // const getSortedPlayers = (): Player[] => {
    //     return playerScores
    //         .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
    //         .sort((a, b) => b.score - a.score)
    //         .map((player, rank) => ({ ...player, position: rank }));
    // };
    return (
        <>
            <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1 relative">
                {playersArray.map((player: User, index: number) => (
                    <div
                        key={index}
                        className="player-item absolute w-full flex items-center"
                        style={{
                            top: `${player.position * 50}px`,
                            transition: 'top 0.5s ease',
                        }}
                    >
                        <img
                            src={player.avatar}
                            alt={player.userName}
                            className="w-8 h-8 rounded-full mr-2"
                        />
                        <div className="flex-1">
                            <p className="text-sm">{player.userName}</p>
                            <div className="w-full bg-gray-200 text-center py-1 rounded-lg">
                                Score:
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default PlayerScore