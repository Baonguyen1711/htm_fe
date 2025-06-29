import React, { useEffect, useState } from 'react'
import { usePlayer } from '../context/playerContext';
import { User, Answer, Score } from '../type';
import { listenToCurrentTurn, listenToBroadcastedAnswer, listenToOpenBuzz } from '../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';
import { buzzing, setStar } from './services';
import { closeBuzz } from './services';
import { useSounds } from '../context/soundContext';

interface PlayerAnswerProps {
    isSpectator?: boolean;
}


const PlayerAnswer: React.FC<PlayerAnswerProps> = ({ isSpectator }) => {
    const sounds = useSounds()
    const { playersArray, playerFlashes, setPlayerFlashes, roomId, triggerPlayerFlash, scoreList, setScoreList, position, currentPlayerName, answerList, setAnswerList } = usePlayer()

    // Generate spots array based on number of players (up to 8)
    const maxPlayers = playersArray ? Math.max(4, playersArray.length) : 4;
    const spots = Array.from({ length: Math.min(maxPlayers, 8) }, (_, i) => i + 1);
    const [searchParams] = useSearchParams()
    const round = searchParams.get("round") || "1"

    const [isButtonEnabled, setIsButtonEnabled] = useState(round === "2")
    const [isStarButtonEnabled, setIsStarButtonEnabled] = useState(true)
    const [currentTurn, setCurrentTurn] = useState<number | null>(null);

    useEffect(() => {
        const unsubscribeCurrentTurn = listenToCurrentTurn(roomId, (turn) => {
            setCurrentTurn(turn);
            console.log("currentTurn", turn);
        });

        return () => {
            unsubscribeCurrentTurn();
        };
    }, [roomId]);

    const handleBuzz = async () => {
        console.log("currentPlayerName", currentPlayerName);

        await buzzing(roomId, currentPlayerName, position)
    }

    const handleSetStar = async () => {
        console.log("currentPlayerName", currentPlayerName);
        setIsStarButtonEnabled(false)
        await setStar(roomId, currentPlayerName)
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
                const audio = sounds['5seconds_remain'];
                if (audio) {
                    audio.play();
                }
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
            {!isSpectator && ((round === "2")) && (
                <button
                    onClick={() => {
                        alert('buzzed')
                        handleBuzz()
                    }}
                    className={`w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-xl shadow-lg font-semibold text-lg mb-6 transition-all duration-200 ${isButtonEnabled ? '' : 'bg-gray-500 cursor-not-allowed'
                        }`}
                    disabled={!isButtonEnabled}
                >
                    Trả lời CNV
                </button>
            )}
            {!isSpectator && ((round === "4")) && (
                <div className="flex w-full gap-4 mb-6">
                    <button
                        onClick={() => {
                            alert('buzzed')
                            handleSetStar()
                        }}
                        className={`flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 ${isStarButtonEnabled ? '' : 'bg-gray-500 cursor-not-allowed'
                            }`}
                        disabled={!isStarButtonEnabled}
                    >
                        Ngôi sao hy vọng
                    </button>

                    <button
                        onClick={() => {
                            alert('buzzed')
                            handleBuzz()
                        }}
                        className={`flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 ${isButtonEnabled ? '' : 'bg-gray-500 cursor-not-allowed'
                            }`}
                        disabled={!isButtonEnabled}
                    >
                        Giành quyền trả lời
                    </button>
                </div>

            )}
            <div className={`grid ${spots.length > 4 ? 'grid-cols-4 grid-rows-2' : 'grid-cols-4'} gap-6 mt-4 w-full`}>
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

                    // Highlight if currentTurn matches this spotNumber
                    const isCurrent = currentTurn !== null && Number(currentTurn) === spotNumber;

                    if (player) {
                        return (
                            <div
                                key={spotNumber}
                                className={`flex items-center w-full min-h-[180px] bg-slate-800/80 rounded-xl p-4 shadow-md border border-slate-700/50 transition-all duration-200 ${playerFlash ? playerFlash.flashColor : ""} ${isCurrent ? "ring-4 ring-yellow-400 border-yellow-400" : ""}`}
                            >
                                <img
                                    src={player.avatar}
                                    alt="Player"
                                    className="w-16 h-16 rounded-full border-2 border-white mr-4"
                                />
                                <div className="flex flex-col flex-1">
                                    <p className="text-white font-bold border-b border-slate-700/50 pb-1">
                                        {`player_${player.stt}: ${player.userName}`}
                                    </p>
                                    <p className="text-white border-b border-slate-700/50 pb-1 mt-1">
                                        {answer?.answer || ""}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {answer?.time ? `${answer.time}s` : ""}
                                    </p>
                                </div>
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