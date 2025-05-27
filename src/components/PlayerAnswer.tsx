import React, { useEffect, useState } from 'react'
import { usePlayer } from '../context/playerContext';
import { User, Answer, Score } from '../type';
import { listenToBroadcastedAnswer, listenToOpenBuzz } from '../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';
import { buzzing } from './services';
import { closeBuzz } from './services';

const PlayerAnswer: React.FC = () => {
    const { playersArray, playerFlashes, setPlayerFlashes, roomId, triggerPlayerFlash, scoreList, setScoreList, position, currentPlayerName, answerList, setAnswerList } = usePlayer()

    const spots = [1, 2, 3, 4]
    const [searchParams] = useSearchParams()
    const round = searchParams.get("round") || "1"

    const [isButtonEnabled, setIsButtonEnabled] = useState(round === "2")

    const handleBuzz = async () => {
        console.log("currentPlayerName", currentPlayerName);

        await buzzing(roomId, currentPlayerName, position)
    }

    useEffect(() => {
        const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer(roomId, (answerList) => {
            setAnswerList(answerList)
            console.log("answerList", answerList)
        })

        return () => {
            unsubscribeBroadcastedAnswer();
        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribeOpenBuzz = listenToOpenBuzz(roomId, (buzz) => {
            console.log("buzz", buzz);

            if (round === "4" && buzz === "open") {
                setIsButtonEnabled(true)
                const timeoutId = setTimeout(() => {
                    setIsButtonEnabled(false)
                    closeBuzz(roomId)
                }, 4000)
                return () => {

                    clearTimeout(timeoutId)
                }
            }
        })

        return () => {
            unsubscribeOpenBuzz();
        };
    }, [roomId, round]);

    useEffect(() => {
        console.log("playerFlashes before outside",playerFlashes);
        if (playerFlashes && playerFlashes.length > 0 && playerFlashes.some((p: Score) => p.flashColor && p.isModified)) {
            console.log("playerFlashes before",playerFlashes);
            
            const timeoutId = setTimeout(() => {
                setPlayerFlashes((prevFlashes: Score[]) =>
                    prevFlashes.map((player) => ({ ...player, flashColor: undefined, isModified: false }))
                );
            }, 3000);

            console.log("playerFlashes before",playerFlashes);
            return () => clearTimeout(timeoutId);
        }
    }, [playerFlashes, setPlayerFlashes]);

    return (
        <>
            <button
                onClick={() => {
                    alert('buzzed')
                    handleBuzz()
                }}
                className={`p-2 flex-1 rounded-md text-white ${isButtonEnabled ? 'bg-green-500' : 'bg-gray-500 cursor-not-allowed'
                    }`}
                disabled={!isButtonEnabled}
            >
                {round === "2" ? "Trả lời CNV" : round === "4" ? "Giành quyền trả lời" : ""}
            </button>
            <div className="flex justify-around mt-4">
                {
                    spots.map((spotNumber: number) => {
                        const storedPlayers = localStorage.getItem("playerList");
                        { console.log("storedPlayers", storedPlayers) }
                        { console.log("playersArray", playersArray) }
                        const array = playersArray !== null
                            ? playersArray
                            : (storedPlayers ? JSON.parse(storedPlayers) : []);
                        { console.log("array", array) }
                        const player = array.find((p: User) => parseInt(p.stt) === spotNumber);
                        console.log("playerFlashes", playerFlashes);
                        const playerFlash = playerFlashes.find((p: Score) => p.stt === spotNumber.toString());
                        console.log("playerFlash", playerFlash);
                        const answer = Array.isArray(answerList) && answerList.length !== 0
                            ? answerList.find((answer: Answer) => parseInt(answer.stt) === spotNumber)
                            : null
                        console.log("answer in spot", answer);

                        if (player) {
                            return (
                                <div
                                    key={spotNumber}
                                    className={`flex flex-col items-center 
    ${playerFlash ? playerFlash.flashColor : ""}`}
                                >
                                    <img
                                        src={player.avatar}
                                        alt="Player"
                                        className="w-16 h-16 rounded-full"
                                    />

                                    <p className="text-white mt-2 min-h-[1.5rem]">
                                        {answer?.answer || ""}
                                    </p>

                                    <p className="text-white">{`player_${player.stt}: ${player.userName}`}</p>
                                </div>
                            )
                        }
                    })
                }
            </div>
        </>
    )
}

export default PlayerAnswer