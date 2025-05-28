import React, { useEffect } from 'react'
import { useHost } from '../context/hostContext';
import { usePlayer } from '../context/playerContext';
import { User } from '../type';
import { updateScore } from '../pages/Host/Management/service';
import { listenToBroadcastedAnswer } from '../services/firebaseServices';
import { Answer, Score } from '../type';
import { useSearchParams } from 'react-router-dom';


function HostAnswer() {
    const { playersArray, playerFlashes, roomId, answerList, setAnswerList } = usePlayer()
    const { handleScoreAdjust, playerScores, triggerPlayerFlash, setPlayerScores } = useHost()
    const [searchParams] = useSearchParams()
    const round = searchParams.get("round") || "1"
    useEffect(() => {

        const currentScoreList = localStorage.getItem("scoreList");
        if (currentScoreList) {
            setPlayerScores(JSON.parse(currentScoreList));
        }
    }, [round]);
    useEffect(() => {
        const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer(roomId, (answerList) => {
            setAnswerList(answerList)
            console.log("answerList", answerList)
        })

        return () => {
            unsubscribeBroadcastedAnswer();
        };
    }, [roomId]);
    const spots = [1, 2, 3, 4]
    return (
        <>
            <button
                onClick={() => {
                    alert('Score Updated!')
                    updateScore(roomId, playerScores)
                    const newScoreList = [...playerScores]
                    for (let score of newScoreList) {
                        score["isCorrect"] = false;
                        score["isModified"] = false
                    }
                    setPlayerScores(newScoreList)
                    // localStorage.setItem("scoreList", JSON.stringify(newScoreList));
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 px-6 rounded-xl shadow-lg font-semibold text-lg mb-6 transition-all duration-200"
            >
                Xác nhận điểm
            </button>
            <div className="grid grid-cols-4 gap-6 mt-4 w-full">
                {
                    spots.map((spotNumber: number) => {
                        const storedPlayers = localStorage.getItem("playerList");
                        const array = playersArray !== null
                            ? playersArray
                            : (storedPlayers ? JSON.parse(storedPlayers) : []);
                        const player = array.find((p: User) => parseInt(p.stt) === spotNumber);
                        const playerScore: Score = playerScores.find((score: Score) => score.stt === spotNumber.toString());
                        const answer = Array.isArray(answerList) && answerList.length !== 0
                            ? answerList.find((answer: Answer) => parseInt(answer.stt) === spotNumber)
                            : null;
                        if (player) {
                            return (
                                <div
                                    key={spotNumber}
                                    className={`flex flex-col items-center justify-between bg-slate-800/80 rounded-xl p-4 min-h-[240px] shadow-md transition-all duration-200 ${playerFlashes[spotNumber]}`}
                                >
                                    <img
                                        src={player.avatar}
                                        alt="Player"
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <p className="text-white mt-2 min-h-[1.5rem] text-center">
                                        {answer?.answer || ""}
                                    </p>
                                    <p className="text-white mt-2 text-2xl font-bold">
                                        {playerScore ? playerScore.score : "0"}
                                    </p>
                                    <p className="text-white text-center">{`player_${player.stt}: ${player.userName}`}</p>
                                    <div className="flex gap-2 mt-2">
                                        {[5, 10].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => handleScoreAdjust(spotNumber, amount, true, player.userName, player.avatar)}
                                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md shadow"
                                            >
                                                +{amount}
                                            </button>
                                        ))}
                                        {[5, 10].map((amount) => (
                                            <button
                                                key={-amount}
                                                onClick={() => handleScoreAdjust(spotNumber, -amount, false, player.userName, player.avatar)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow"
                                            >
                                                -{amount}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                        return (
                            <div
                                key={spotNumber}
                                className="flex flex-col items-center justify-between bg-slate-800/80 rounded-xl p-4 min-h-[240px] shadow-md opacity-50"
                            />
                        );
                    })
                }
            </div>

        </>
    )
}

export default HostAnswer