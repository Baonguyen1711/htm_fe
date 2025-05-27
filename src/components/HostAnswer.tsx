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
                className="bg-green-500 text-white p-2 flex-1 rounded-md"
            >
                Confirm
            </button>
            <div className="flex justify-around mt-4">

                {
                    spots.map((spotNumber: number) => {

                        const storedPlayers = localStorage.getItem("playerList");

                        const array = playersArray !== null
                            ? playersArray
                            : (storedPlayers ? JSON.parse(storedPlayers) : []);
                        console.log("array", array)
                        const player = array.find((p: User) => parseInt(p.stt) === spotNumber);
                        const playerScore: Score = playerScores.find((score: Score) => score.stt === spotNumber.toString());
                        console.log("playerScore", playerScore);
                        const answer = Array.isArray(answerList) && answerList.length !== 0
                            ? answerList.find((answer: Answer) => parseInt(answer.stt) === spotNumber)
                            : null
                        console.log("answer in spot", answer);
                        if (player) {
                            return (
                                <>

                                    <div key={spotNumber} className={`flex flex-col items-center ${playerFlashes[spotNumber]}`}>
                                        <img
                                            src={player.avatar}
                                            alt="Player"
                                            className="w-16 h-16 rounded-full"
                                        />
                                        <p className="text-white mt-2 min-h-[1.5rem]">
                                            {answer?.answer || ""}
                                        </p>
                                        <p className="text-white mt-2 ">
                                            {playerScore ? playerScore.score : "0"}
                                        </p>
                                        <p className="text-white">{`player_${player.stt}: ${player.userName}`}</p>
                                        <div className="flex gap-2 mt-2">
                                            {[5, 10].map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => handleScoreAdjust(spotNumber, amount, true, player.userName, player.avatar)}
                                                    className="bg-green-500 text-white p-2 rounded-md"
                                                >
                                                    +{amount}
                                                </button>
                                            ))}
                                            {[5, 10].map((amount) => (
                                                <button
                                                    key={-amount}
                                                    onClick={() => handleScoreAdjust(spotNumber, -amount, false, player.userName, player.avatar)}
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