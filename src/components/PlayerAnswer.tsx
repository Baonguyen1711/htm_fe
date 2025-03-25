import React from 'react'
import { usePlayer } from '../context/playerContext';
import { User } from '../type';


const PlayerAnswer:React.FC= () => {
    const {playersArray, playerFlashes} = usePlayer()
    const spots = [1,2,3,4]
    return (
        <>
            <div className="flex justify-around mt-4">
                {
                    spots.map((spotNumber:number) => {

                        const storedPlayers = localStorage.getItem("playerList");
                        {console.log("storedPlayers",storedPlayers)}
                        const array = playersArray !== null
                            ? playersArray
                            : (storedPlayers ? JSON.parse(storedPlayers) : []);
                        {console.log("array",array)}
                        const player = array.find((p: User) => parseInt(p.stt) === spotNumber);
                        if (player) {
                            return (
                                <div key={spotNumber} className={`flex flex-col items-center ${playerFlashes[spotNumber]}`}>
                                    <img
                                        src={player.avatar}
                                        alt="Player"
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <p className="text-white mt-2 ">
                                        PlayerAnswer
                                    </p>
                                    <p className="text-white">{`player_${player.stt}: ${player.userName}`}</p>                                   

                                </div>
                            )
                        }

                    })
                }
                {/* {playersArray.map((player, index) => (
                           
                        ))} */}
            </div>

        </>
    )
}

export default PlayerAnswer