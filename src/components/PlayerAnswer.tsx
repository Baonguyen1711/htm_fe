import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import useGameApi from '../shared/hooks/api/useGameApi';
import { useSounds } from '../context/soundContext';
import { useFirebaseListener } from '../shared/hooks';
import { useAppSelector } from '../app/store';
import { PlayerData } from '../shared/types';
import SimpleColorPicker from './ui/Color/ColorPicker';
import { toast } from 'react-toastify';
import { Button } from '../shared/components/ui';

interface PlayerAnswerProps {
    isSpectator?: boolean;
}


const PlayerAnswer: React.FC<PlayerAnswerProps> = ({ isSpectator }) => {
    const sounds = useSounds()
    //const { playersArray, playerFlashes, setPlayerFlashes, triggerPlayerFlash, scoreList, setScoreList, position, currentPlayerName, answerList, setAnswerList } = usePlayer()

    // Generate spots array based on number of players (up to 8)
    
    const [searchParams] = useSearchParams()
    const round = searchParams.get("round") || "1"
    const roomId = searchParams.get("roomId") || "1"

    const [isButtonEnabled, setIsButtonEnabled] = useState(round === "2")
    const [isTakeTurnButtonEnabled, setIsTakeTurnButtonEnabled] = useState(false)
    const [isStarButtonEnabled, setIsStarButtonEnabled] = useState(true)
    const [currentTurn, setCurrentTurn] = useState<number | null>(null);
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
    const { listenToBroadcastedAnswer, listenToCurrentTurn, listenToOpenBuzz, listenToStar, listenToPlayerColors } = useFirebaseListener()
    const { openBuzz, closeBuzz, resetBuzz, buzzing, setStar, setPlayerColor } = useGameApi()
    const { currentPlayer, players } = useAppSelector((state) => state.game);
    const maxPlayers = players ? Math.max(4, players.length) : 4;
    const spots = Array.from({ length: Math.min(maxPlayers, 8) }, (_, i) => i + 1);
    useEffect(() => {
        const unsubscribeCurrentTurn = listenToCurrentTurn(
            (turn) => {
                setCurrentTurn(turn)
            }
        );

        return () => {
            unsubscribeCurrentTurn();
        };
    }, [roomId]);

    // Listen to player colors
    useEffect(() => {
        const unsubscribePlayerColors = listenToPlayerColors((colors) => {
            setPlayerColors(colors || {});
        });
        return () => unsubscribePlayerColors();
    }, [roomId, listenToPlayerColors]);

    // Handle color change
    const handleColorChange = async (playerStt: string, color: string) => {
        try {
            // Skip API call if color is empty (removing color)
            if (color && color.trim() !== '') {
                await setPlayerColor(roomId, playerStt, color);
            }

            // Update local state
            const newColors = { ...playerColors };
            if (color && color.trim() !== '') {
                newColors[playerStt] = color;
            } else {
                delete newColors[playerStt];
            }
            setPlayerColors(newColors);

            const message = color && color.trim() !== ''
                ? `Đã cập nhật màu cho player_${playerStt}`
                : `Đã xóa màu cho player_${playerStt}`;
            toast.success(message);
        } catch (error) {
            console.error('Failed to set player color:', error);
            toast.error('Không thể cập nhật màu cho người chơi');
        }
    };

    // Get used colors
    const usedColors = new Set<string>(Object.values(playerColors));

    const handleBuzz = async () => {
        console.log("currentPlayerName", currentPlayer?.userName);
        if(currentPlayer?.userName){
            await buzzing(roomId, currentPlayer?.userName)
        }
    }

    const handleSetStar = async () => {

        setIsStarButtonEnabled(false)
        if(currentPlayer?.userName){
            await setStar(roomId, currentPlayer?.userName)
        }
    }

    useEffect(() => {
        const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer()

        return () => {
            unsubscribeBroadcastedAnswer();
        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribeOpenBuzz = listenToOpenBuzz(
            () => {
                if (round === "4") {
                    const audio = sounds['5seconds_remain'];
                    if (audio) {
                        audio.play();
                    }
                    setIsTakeTurnButtonEnabled(true)
                    const timeoutId = setTimeout(() => {
                        setIsTakeTurnButtonEnabled(false)
                        closeBuzz(roomId)
                    }, 4000)

                    return () => {

                        clearTimeout(timeoutId)
                    }
                }
            }
        )

        return () => {
            unsubscribeOpenBuzz();
        };
    }, [roomId, round]);

    // useEffect(() => {
    //     console.log("playerFlashes before outside", playerFlashes);
    //     if (playerFlashes && playerFlashes.length > 0 && playerFlashes.some((p: Score) => p.flashColor && p.isModified)) {
    //         console.log("playerFlashes before", playerFlashes);

    //         const timeoutId = setTimeout(() => {
    //             setPlayerFlashes((prevFlashes: Score[]) =>
    //                 prevFlashes.map((player) => ({ ...player, flashColor: undefined, isModified: false }))
    //             );
    //         }, 3000);

    //         console.log("playerFlashes after", playerFlashes);
    //         return () => clearTimeout(timeoutId);
    //     }
    // }, [playerFlashes, setPlayerFlashes]);

    return (
        <>
            {!isSpectator && ((round === "2")) && (
                <Button
                    onClick={() => {
                        handleBuzz()
                    }}
                    variant="success"
                    size="lg"
                    fullWidth
                    isDisabled={!isButtonEnabled}
                    className="shadow-lg font-semibold mb-6"
                >
                    Trả lời CNV
                </Button>
            )}
            {!isSpectator && ((round === "4")) && (
                <div className="flex w-full gap-4 mb-6">
                    <Button
                        onClick={() => {
                            handleSetStar()
                        }}
                        variant="success"
                        size="lg"
                        isDisabled={!isStarButtonEnabled}
                        className="flex-1 shadow-lg font-semibold"
                    >
                        Ngôi sao hy vọng
                    </Button>

                    <Button
                        onClick={() => {
                            handleBuzz()
                        }}
                        variant="success"
                        size="lg"
                        isDisabled={!isTakeTurnButtonEnabled}
                        className="flex-1 shadow-lg font-semibold"
                    >
                        Giành quyền trả lời
                    </Button>
                </div>

            )}
            <div className={`grid ${spots.length > 4 ? 'grid-cols-4 grid-rows-2' : 'grid-cols-4'} gap-6 mt-4 w-full`}>
                {spots.map((spotNumber: number) => {
                    // const storedPlayers = localStorage.getItem("playerList");
                    // const array = playersArray !== null
                    //     ? playersArray
                    //     : (storedPlayers ? JSON.parse(storedPlayers) : []);
                    const player = Array.isArray(players)? players.find((p: PlayerData) => p.stt && parseInt(p.stt) === spotNumber): null;
                    //const playerFlash = playerFlashes.find((p: Score) => p.stt === spotNumber.toString());
                    // const answer = Array.isArray(answerList) && answerList.length !== 0
                    //     ? answerList.find((answer: Answer) => parseInt(answer.stt) === spotNumber)
                    //     : null;

                    // Highlight if currentTurn matches this spotNumber
                    const isCurrent = currentTurn !== null && Number(currentTurn) === spotNumber;

                    if (player) {
                        return (
                            <div
                                key={spotNumber}
                                className={`flex items-center w-full min-h-[180px] bg-slate-800/80 rounded-xl p-4 shadow-md border border-slate-700/50 transition-all duration-200  ${isCurrent ? "ring-4 ring-yellow-400 border-yellow-400" : ""}`}
                            >
                                <div className="relative mr-4">
                                    <img
                                        src={player.avatar}
                                        alt="Player"
                                        className="w-16 h-16 rounded-full border-2 border-white"
                                    />
                                    {/* Color picker for Round 4 */}
                                    {round === "4" && (
                                        <div className="absolute -bottom-1 -right-1">
                                            <SimpleColorPicker
                                                playerStt={player.stt}
                                                currentColor={playerColors[player.stt || 0]}
                                                onColorChange={handleColorChange}
                                                usedColors={usedColors}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-1">
                                        <p className="text-white font-bold">
                                            {`player_${player.stt}: ${player.userName}`}
                                        </p>
                                        {/* Color indicator for Round 4 */}
                                        {round === "4" && playerColors[player.stt || 0] && (
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow-sm"
                                                style={{ backgroundColor: playerColors[player.stt || 0] }}
                                                title={`Màu của ${player.userName}`}
                                            ></div>
                                        )}
                                    </div>
                                    <p className="text-white border-b border-slate-700/50 pb-1 mt-1">
                                        {player?.answer || ""}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {player?.time ? `${player.time}s` : ""}
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