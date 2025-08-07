import React, { useEffect, useRef, useState } from 'react';
import { Score } from '../shared/types';
import { useSearchParams } from 'react-router-dom';
import { useFirebaseListener } from '../shared/hooks';
import { useAppSelector } from '../app/store';
import { PlayerData } from '../shared/types';

interface PlayerScoreProps {
    playerColors?: Record<string, string>;
}

function PlayerScore({ playerColors: propPlayerColors = {} }: PlayerScoreProps) {
    const [playerColors, setPlayerColors] = useState<Record<string, string>>(propPlayerColors);
    const [params] = useSearchParams();
    const round = params.get("round") || "1";
    const roomId = params.get("roomId") || "1";

    const { listenToScoresRanking, listenToPlayerColors } = useFirebaseListener();
    const { scoresRanking } = useAppSelector(state => state.game)

    useEffect(() => {
        const unsubscribeScores = listenToScoresRanking(
            (scores) => {
                console.log("listenToScores", scores);
                console.log("scoresRanking", scoresRanking)
            }
        );
        return () => {
            unsubscribeScores();
        };
    }, [roomId]);

    // Listen to player colors
    useEffect(() => {
        const unsubscribePlayerColors = listenToPlayerColors((colors) => {
            setPlayerColors(colors || {});
        });
        return () => unsubscribePlayerColors();
    }, [roomId, listenToPlayerColors]);

    const sortedScoresRanking = Array.isArray(scoresRanking) ?[...scoresRanking].sort((a, b) => b.score - a.score): [];


    return (
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-xl p-4">
            <div className="text-white font-bold text-lg mb-4 text-center border-b border-blue-400/30 pb-2">
                Bảng Điểm
            </div>


            <div 
                className="relative overflow-hidden"
                style={{ height: `${Math.max(sortedScoresRanking.length * 70, 120)}px` }}
            >
                {sortedScoresRanking.length>0? 
                sortedScoresRanking
                .map((player: Score, index: number) => {
                    const y = index * 70;
                    return (
                        <div
                            key={player.playerName}
                            className={`absolute w-[95%] left-[2.5%] flex items-center bg-slate-700/60 backdrop-blur-sm rounded-lg border border-blue-400/20 shadow-lg mb-2 px-4 py-3
                                }
                            `}
                            style={{
                                transform: `translateY(${y}px)`,
                                transition: "transform 1.8s cubic-bezier(.22,1,.36,1), box-shadow 0.3s",
                                // boxShadow: player.flashColor
                                //     ? player.flashColor === "flash-correct"
                                //         ? "0 0 16px 2px #4ade80"
                                //         : "0 0 16px 2px #f87171"
                                //     : "0 4px 12px rgba(0,0,0,0.3)",
                            }}
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white font-bold text-sm mr-3">
                                {index + 1}
                            </div>
                            <div className="relative mr-3">
                                <img
                                    src={player.avatar}
                                    alt={player.playerName}
                                    className="w-10 h-10 rounded-full border-2 border-blue-400/50"
                                />
                                {/* Color indicator for Round 4 */}
                                {round === "4" && player.stt && playerColors[player.stt] && (
                                    <div
                                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                        style={{ backgroundColor: playerColors[player.stt] }}
                                        title={`Màu của ${player.playerName}`}
                                    ></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm mb-1">{player.playerName}</p>
                                <div className="bg-gradient-to-r from-blue-600/50 to-cyan-500/50 backdrop-blur-sm text-white text-center py-1 px-3 rounded-lg font-mono text-sm border border-blue-400/30">
                                    {`${player.score} điểm`}
                                </div>
                            </div>
                        </div>
                    );
                })
                :
                null
            }
            </div>

        </div>
    );
}

export default PlayerScore;