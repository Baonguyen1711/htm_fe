import React from 'react'
import { useHost } from '../context/hostContext';
import { usePlayer } from '../context/playerContext';
import { User } from '../type';
function HostAnswer() {
    const { playersArray, playerFlashes } = usePlayer()
    const { handleScoreAdjust } = useHost()
    const spots = [1, 2, 3, 4]
    return (
        <>
            <div className="flex justify-around mt-4">
                {
                    spots.map((spotNumber: number) => {

                        const storedPlayers = localStorage.getItem("playerList");
                        const array = playersArray !== null
                            ? playersArray
                            : (storedPlayers ? JSON.parse(storedPlayers) : []);
                        console.log("array", array)
                        const player = array.find((p: User) => parseInt(p.stt) === spotNumber);
                        if (player) {
                            return (
                                <>
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
                                        <div className="flex gap-2 mt-2">
                                            {[10, 20, 30].map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => handleScoreAdjust(spotNumber, amount)}
                                                    className="bg-green-500 text-white p-2 rounded-md"
                                                >
                                                    +{amount}
                                                </button>
                                            ))}
                                            {[10, 20, 30].map((amount) => (
                                                <button
                                                    key={-amount}
                                                    onClick={() => handleScoreAdjust(spotNumber, -amount)}
                                                    className="bg-red-500 text-white p-2 rounded-md"
                                                >
                                                    -{amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>




                                </>

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

export default HostAnswer