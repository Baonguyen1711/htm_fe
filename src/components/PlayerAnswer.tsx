import React, { useEffect, useState } from 'react'
import { usePlayer } from '../context/playerContext';
import { User, Answer, Score } from '../type';
import { listenToBroadcastedAnswer, listenToOpenBuzz } from '../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';
import { buzzing } from './services';
import { closeBuzz } from './services';

interface PlayerAnswerProps { 
    isSpectator?: boolean;
}


const PlayerAnswer: React.FC<PlayerAnswerProps> = ({isSpectator}) => {
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
        console.log("playerFlashes before outside", playerFlashes);
        if (playerFlashes && playerFlashes.length > 0 && playerFlashes.some((p: Score) => p.flashColor && p.isModified)) {
            console.log("playerFlashes before", playerFlashes);

            const timeoutId = setTimeout(() => {
                setPlayerFlashes((prevFlashes: Score[]) =>
                    prevFlashes.map((player) => ({ ...player, flashColor: undefined, isModified: false }))
                );
            }, 3000);

            console.log("playerFlashes before", playerFlashes);
            return () => clearTimeout(timeoutId);
        }
    }, [playerFlashes, setPlayerFlashes]);

    return (
        <>
            {!isSpectator && ((round === "2" || round === "4")) && (
                <button
                    onClick={() => {
                        alert('buzzed')
                        handleBuzz()
                    }}
                    className={`w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-xl shadow-lg font-semibold text-lg mb-6 transition-all duration-200 ${isButtonEnabled ? '' : 'bg-gray-500 cursor-not-allowed'
                        }`}
                    disabled={!isButtonEnabled}
                >
                    {round === "2" ? "Trả lời CNV" : "Giành quyền trả lời"}
                </button>
            )}
            <div className="grid grid-cols-4 gap-6 mt-4 w-full">
                {spots.map((spotNumber: number) => {
                    const storedPlayers = localStorage.getItem("playerList");
                    const array = playersArray !== null
                        ? playersArray
                        : (storedPlayers ? JSON.parse(storedPlayers) : []);
                    const player = array.find((p: User) => parseInt(p.stt) === spotNumber);
                    const playerFlash = playerFlashes.find((p: Score) => p.stt === spotNumber.toString());
                    const answer = Array.isArray(answerList) && answerList.length !== 0
                        ? answerList.find((answer: Answer) => parseInt(answer.stt) === spotNumber)
                        : null;

                    if (player) {
                        return (
                            <div
                                key={spotNumber}
                                className={`flex flex-col items-center justify-between bg-slate-800/80 rounded-xl p-4 min-h-[180px] shadow-md transition-all duration-200 ${playerFlash ? playerFlash.flashColor : ""}`}
                            >
                                <img
                                    src={player.avatar}
                                    alt="Player"
                                    className="w-16 h-16 rounded-full"
                                />
                                <p className="text-white mt-2 min-h-[1.5rem] text-center">
                                    {answer?.answer || ""}
                                </p>
                                <p className="text-white text-center">{`player_${player.stt}: ${player.userName}`}</p>
                            </div>
                        )
                    }
                    return (
                        <div
                            key={spotNumber}
                            className="flex flex-col items-center justify-between bg-slate-800/80 rounded-xl p-4 min-h-[180px] shadow-md opacity-50"
                        />
                    );
                })}
            </div>
        </>
    )
}

export default PlayerAnswer