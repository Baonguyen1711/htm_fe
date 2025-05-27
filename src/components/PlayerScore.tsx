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
            }
            console.log("Updated scoreList:", scoreList);
        });
        return () => {
            unsubscribePlayers();
        };
    }, [roomId, setPlayerFlashes, setScoreList, round]);

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-xl p-4">
            <div className="text-white font-bold text-lg mb-4 text-center border-b border-blue-400/30 pb-2">
                Bảng Điểm
            </div>
            <div 
                className="relative overflow-hidden"
                style={{ height: `${Math.max(scoreList.length * 70, 120)}px` }}
            >
                {scoreList.map((player: Score, index: number) => {
                    const y = index * 70;
                    return (
                        <div
                            key={player.playerName}
                            className={`absolute w-[95%] left-[2.5%] flex items-center bg-slate-700/60 backdrop-blur-sm rounded-lg border border-blue-400/20 shadow-lg mb-2 px-4 py-3
                                ${player.flashColor ? player.flashColor : ""}
                            `}
                            style={{
                                transform: `translateY(${y}px)`,
                                transition: "transform 1.8s cubic-bezier(.22,1,.36,1), box-shadow 0.3s",
                                boxShadow: player.flashColor
                                    ? player.flashColor === "flash-correct"
                                        ? "0 0 16px 2px #4ade80"
                                        : "0 0 16px 2px #f87171"
                                    : "0 4px 12px rgba(0,0,0,0.3)",
                            }}
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white font-bold text-sm mr-3">
                                {index + 1}
                            </div>
                            <img
                                src={player.avatar}
                                alt={player.playerName}
                                className="w-10 h-10 rounded-full mr-3 border-2 border-blue-400/50"
                            />
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm mb-1">{player.playerName}</p>
                                <div className="bg-gradient-to-r from-blue-600/50 to-cyan-500/50 backdrop-blur-sm text-white text-center py-1 px-3 rounded-lg font-mono text-sm border border-blue-400/30">
                                    {`${player.score} điểm`}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>{`
                .flash-correct { 
                    animation: flashGreen 0.5s; 
                    background: rgba(34, 197, 94, 0.2) !important;
                }
                .flash-incorrect { 
                    animation: flashRed 0.5s; 
                    background: rgba(239, 68, 68, 0.2) !important;
                }
                @keyframes flashGreen {
                  0% { background: rgba(34, 197, 94, 0.4); }
                  100% { background: rgba(51, 65, 85, 0.6); }
                }
                @keyframes flashRed {
                  0% { background: rgba(239, 68, 68, 0.4); }
                  100% { background: rgba(51, 65, 85, 0.6); }
                }
            `}</style>
        </div>
    );
}

export default PlayerScore;