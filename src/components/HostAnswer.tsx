import React, { useEffect, useRef, useState } from 'react';
import { useHost } from '../context/hostContext';
import { usePlayer } from '../context/playerContext';
import { User } from '../type';
import { updateScore } from '../pages/Host/Management/service';
import { listenToBroadcastedAnswer, listenToScores } from '../services/firebaseServices';
import { Answer, Score } from '../type';
import { useSearchParams } from 'react-router-dom';
import { openBuzz } from './services';
import { setCurrrentTurnToPlayer } from '../layouts/services';
import { toast } from 'react-toastify';

function HostAnswer() {
    const [turn, setTurn] = useState<number>(0);
    const [mode, setMode] = useState<string>("")
    const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
    const { playersArray, playerFlashes, answerList, setAnswerList, level, selectedTopic } = usePlayer();
    const { handleScoreAdjust, playerScores, setPlayerScores, handleNextQuestion, numberOfSelectedRow } = useHost();
    const [searchParams] = useSearchParams();
    const round = searchParams.get("round") || "1";
    const roomId = searchParams.get("roomId") || "1";

    // Generate spots array based on number of players (up to 8)
    const maxPlayers = playersArray ? Math.max(4, playersArray.length) : 4;
    const spots = Array.from({ length: Math.min(maxPlayers, 8) }, (_, i) => i + 1);
    const isFirstMounted = useRef(true)
    const isAnswerListFirstMounted = useRef(true)
    // Initialize turn assignments based on max players
    const initializeTurnAssignments = () => {
        const assignments: { [spot: number]: number | null } = {};
        for (let i = 1; i <= Math.min(maxPlayers, 8); i++) {
            assignments[i] = null;
        }
        return assignments;
    };
    const [turnAssignments, setTurnAssignments] = useState<{ [spot: number]: number | null }>(initializeTurnAssignments());

    const handleAssignTurn = (spot: number, turnNumber: number) => {
        setTurnAssignments((prev) => {
            // Remove this turnNumber from any other spot
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                if (updated[Number(key)] === turnNumber) {
                    updated[Number(key)] = null;
                }
            });
            updated[spot] = turnNumber;
            return updated;
        });
    };

    useEffect(() => {
        setTurn(0);
        setMode(localStorage.getItem(`mode_${roomId}`) || "")
    }, [round]);


    useEffect(() => {
        const currentScoreList = localStorage.getItem("scoreList");
        if (currentScoreList) {
            setPlayerScores(JSON.parse(currentScoreList));
        }
    }, [round]);

    useEffect(() => {
        const unsubscribeScores = listenToScores(roomId, (data) => {
            if (isFirstMounted.current) {
                isFirstMounted.current = false
                return
            }
            setPlayerScores(data);
        });
        return () => unsubscribeScores();
    }, [round, roomId]);

    useEffect(() => {
        const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer(roomId, (answerList) => {
            if (isAnswerListFirstMounted.current) {
                isAnswerListFirstMounted.current = false
                return
            }

            console.log("answerList", answerList);

            setAnswerList(answerList);
        });
        return () => unsubscribeBroadcastedAnswer();
    }, [roomId]);

    const storedPlayers = localStorage.getItem("playerList");
    const playerList = playersArray || (storedPlayers ? JSON.parse(storedPlayers) : []);

    return (
        <div className="flex gap-6">
            {/* Left: Player grid */}
            <div className={`grid ${spots.length > 4 ? 'grid-cols-4 grid-rows-2' : 'grid-cols-2'} gap-4 flex-1`}>
                {spots.map((spotNumber) => {
                    const player = playerList.find((p: User) => parseInt(p.stt) === spotNumber);
                    const playerScore = playerScores.find((score: Score) => score.stt === spotNumber.toString());
                    const answer = answerList?.find((a: Answer) => parseInt(a.stt) === spotNumber);
                    const isCurrent = turn !== null && Number(turn) === spotNumber;
                    return player ? (
                        <div
                            key={spotNumber}
                            onClick={() => setSelectedPlayer(player)}
                            className={`flex items-center w-full min-h-[180px] bg-slate-800/80 rounded-xl p-4 shadow-md border border-slate-700/50 transition-all duration-200 ${isCurrent ? "ring-4 ring-yellow-400 border-yellow-400" : ""}`}
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
                                <p className="text-white text-lg font-bold">{playerScore?.score ?? 0}</p>
                                <p className="text-white border-b border-slate-700/50 pb-1 mt-1">
                                    {answer?.answer || ""}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {answer?.time ? `${answer.time}s` : ""}
                                </p>
                                {/* Turn assignment UI */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-blue-300 text-xs">Lượt:</span>
                                    {[1, 2, 3, 4].map((turnNum) => (
                                        <button
                                            key={turnNum}
                                            type="button"
                                            className={`px-2 py-1 rounded text-xs font-semibold border ${turnAssignments[spotNumber] === turnNum
                                                    ? "bg-blue-500 text-white border-blue-600"
                                                    : "bg-slate-700 text-blue-200 border-slate-600 hover:bg-blue-600 hover:text-white"
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAssignTurn(spotNumber, turnNum);
                                            }}
                                        >
                                            {turnNum}
                                        </button>
                                    ))}
                                    {turnAssignments[spotNumber] && (
                                        <button
                                            type="button"
                                            className="ml-1 px-2 py-1 rounded text-xs bg-gray-600 text-white border border-gray-700 hover:bg-gray-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAssignTurn(spotNumber, null as any);
                                            }}
                                        >
                                            X
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div key={spotNumber} className="bg-slate-800/80 rounded-xl min-h-[240px] opacity-50" />
                    );
                })}
            </div>

            {/* Right: Selected player controls */}
            <div className="w-80 flex flex-col gap-4">
                {selectedPlayer ? (
                    <>
                        <div className="bg-slate-700 rounded-xl p-4 text-white shadow">
                            <img src={selectedPlayer.avatar} alt="Selected" className="w-16 h-16 rounded-full mx-auto" />
                            <p className="text-center font-bold mt-2">{selectedPlayer.userName}</p>
                            <p className="text-center">Player_{selectedPlayer.stt}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {[5, 10].map((amount) => (
                                <button
                                    key={`plus${amount}`}
                                    onClick={() => handleScoreAdjust(parseInt(selectedPlayer.stt), amount, true, selectedPlayer.userName, selectedPlayer.avatar)}
                                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow"
                                >
                                    +{amount}
                                </button>
                            ))}
                            {[5, 10].map((amount) => (
                                <button
                                    key={`minus${amount}`}
                                    onClick={() => handleScoreAdjust(parseInt(selectedPlayer.stt), -amount, false, selectedPlayer.userName, selectedPlayer.avatar)}
                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow"
                                >
                                    -{amount}
                                </button>
                            ))}
                        </div>

                        {(round === "3" || round === "4" || round === "2" || round === "turn") && (
                            <>
                                <button
                                    onClick={() => {
                                        setTurn(parseInt(selectedPlayer.stt))
                                        setCurrrentTurnToPlayer(roomId, parseInt(selectedPlayer.stt));
                                        toast.success(`Đã cập nhật lượt thi cho ${selectedPlayer.userName}`);
                                    }}
                                    className={`w-full ${turn === parseInt(selectedPlayer.stt) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 rounded shadow`}
                                >
                                    {turn === parseInt(selectedPlayer.stt) ? 'Đang thi' : 'Cập nhật lượt thi'}
                                </button>

                                {
                                    round === "2" && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    console.log("numberOfSelectedRow", numberOfSelectedRow);

                                                    const obstaclePoint = (7 - numberOfSelectedRow) * 15
                                                    console.log("obstaclePoint", obstaclePoint);

                                                    updateScore(roomId, [], "auto", "2", turn.toString(), "true", "main", "", "", "", "", "true", obstaclePoint)
                                                    toast.success(`Đã cộng ${obstaclePoint} đúng CNV cho ${selectedPlayer.userName}`);
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px] rounded py-2">
                                                Chấm điểm đúng CNV
                                            </button>
                                        </div>
                                    )
                                }
                                {
                                    round === "3" && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    updateScore(roomId, [], "auto", "3", turn.toString(), "true")
                                                    handleNextQuestion(selectedTopic)
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px] rounded py-2">
                                                Đúng
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    handleNextQuestion(selectedTopic)
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white flex-1 min-w-[120px] rounded py-2"
                                            >
                                                Sai
                                            </button>
                                        </div>
                                    )
                                }
                                {round === "4" && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                updateScore(roomId, [], "auto", "4", turn.toString(), "true", "main", level)
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px] rounded py-2">
                                            Đúng
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await openBuzz(roomId)
                                                toast.success(`Đã mở bấm chuông`);
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white flex-1 min-w-[120px] rounded py-2"
                                        >
                                            Sai
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateScore(roomId, [], "auto", "4", turn.toString(), "true", "nshv", level)
                                            }}
                                            className="bg-green-500 hover:bg-green-600 text-white flex-1 min-w-[120px] rounded py-2"
                                        >
                                            NSHV Đúng
                                        </button>
                                        <button
                                            onClick={async () => {
                                                updateScore(roomId, [], "auto", "4", turn.toString(), "false", "nshv", level)
                                                await openBuzz(roomId)
                                                toast.success(`Đã mở bấm chuông`);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white flex-1 min-w-[120px] rounded py-2"
                                        >
                                            NSHV Sai
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateScore(roomId, [], "auto", "4", "", "", "take_turn", level, "true", selectedPlayer.stt, turn.toString())
                                            }}
                                            className="bg-green-400 hover:bg-green-500 text-white flex-1 min-w-[120px] rounded py-2"
                                        >
                                            Giành lượt Đúng
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateScore(roomId, [], "auto", "4", "", "", "take_turn", level, "false", selectedPlayer.stt, turn.toString())
                                            }}
                                            className="bg-red-400 hover:bg-red-500 text-white flex-1 min-w-[120px] rounded py-2"
                                        >
                                            Giành lượt Sai
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (

                   round !== "1" ? (
                    <p className="text-white text-center">Chọn 1 người chơi để điều khiển</p>
                   ) : null
                    
                )}

                {/* Confirm button */}
                <button
                    onClick={() => {
                        toast.success('Đã cập nhật điểm!');
                        updateScore(roomId, playerScores, "manual", round);
                        const newScoreList = [...playerScores].map((s) => ({
                            ...s,
                            isCorrect: false,
                            isModified: false,
                        }));
                        setPlayerScores(newScoreList);
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-xl shadow font-semibold"
                >
                    Xác nhận điểm
                </button>

                <button
                    onClick={() => {
                        updateScore(roomId, playerScores, mode, round);
                        toast.success(`Đã cập nhật điểm cho vòng thi ${round}`);
                        // const newScoreList = [...playerScores].map((s) => ({
                        //     ...s,
                        //     isCorrect: false,
                        //     isModified: false,
                        // }));
                        // setPlayerScores(newScoreList);
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-xl shadow font-semibold"
                >
                    Chấm điểm tự động
                </button>
            </div>
        </div>
    );
}

export default HostAnswer;
