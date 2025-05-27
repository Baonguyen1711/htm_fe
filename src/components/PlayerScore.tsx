import React, { useEffect, useRef } from 'react';
import { Score } from '../type';
import { usePlayer } from '../context/playerContext';
import { listenToScores } from '../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';

function PlayerScore() {
    const { roomId, scoreList, setScoreList, setPlayerFlashes } = usePlayer();
    const prevOrder = useRef<{ [name: string]: number }>({});
    const [params] = useSearchParams();
    const round = params.get("round") || "1";


    useEffect(() => {
        const unsubscribePlayers = listenToScores(roomId, (scoreList) => {
            if (Array.isArray(scoreList)) {
                console.log("Received scoreList:", scoreList);
                const scoreListWithFlashes = scoreList.map((score: Score) => ({
                    ...score,
                    flashColor: score.isModified ? score.isCorrect ? "flash-correct" : "flash-incorrect" : null,
                    isModified: score.isModified
                }));
                setPlayerFlashes(scoreListWithFlashes);
                const sortedList = [...scoreList].sort((a, b) => parseInt(b.score) - parseInt(a.score));
                console.log("Sorted scoreList:", sortedList);
                setScoreList(sortedList);
                // localStorage.setItem("scoreList", JSON.stringify(sortedList));
            }
            console.log("Updated scoreList:", scoreList);
            
        });
        return () => {
            unsubscribePlayers();
        };
    }, [roomId, setPlayerFlashes, setScoreList, round]);


    return (
        <div
            className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1 relative overflow-hidden"
            style={{ height: `${scoreList.length * 60}px`, minHeight: 120 }}
        >
            {scoreList.map((player: Score, index: number) => {
                const y = index * 60;
                return (
                    <div
                        key={player.playerName}
                        className={`player-item absolute w-[95%] left-[2.5%] flex items-center bg-white rounded-lg shadow-md mb-2 px-3 py-2
                            ${player.flashColor ? player.flashColor : ""}
                        `}
                        style={{
                            transform: `translateY(${y}px)`,
                            transition: "transform 1.8s cubic-bezier(.22,1,.36,1), box-shadow 0.3s",
                            boxShadow: player.flashColor
                                ? player.flashColor === "flash-correct"
                                    ? "0 0 16px 2px #4ade80"
                                    : "0 0 16px 2px #f87171"
                                : "0 1px 6px rgba(0,0,0,0.08)",
                            background: "#fff",
                        }}
                    >
                        <img
                            src={player.avatar}
                            alt={player.playerName}
                            className="w-8 h-8 rounded-full mr-2"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{player.playerName}</p>
                            <div className="w-full bg-gray-200 text-center py-1 rounded-lg font-mono">
                                {`Score: ${player.score}`}
                            </div>
                        </div>
                    </div>
                );
            })}
            <style>{`
                .flash-correct { animation: flashGreen 0.5s; }
                .flash-incorrect { animation: flashRed 0.5s; }
                @keyframes flashGreen {
                  0% { background: #bbf7d0; }
                  100% { background: #fff; }
                }
                @keyframes flashRed {
                  0% { background: #fecaca; }
                  100% { background: #fff; }
                }
            `}</style>
        </div>
    );
}

export default PlayerScore;