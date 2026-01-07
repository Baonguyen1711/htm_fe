import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFirebaseListener } from '../shared/hooks';
import SimpleColorPicker from './ui/Color/ColorPicker';
import { useAppDispatch, useAppSelector } from '../app/store';
import useGameApi from '../shared/hooks/api/useGameApi';
import { PlayerData } from '../shared/types';
import { setCurrentTurn, setMode } from '../app/store/slices/gameSlice';
import { removePlayer } from '../app/store/slices/roomSlice';
import KickPlayerModal from './ui/Modal/KickPlayerModal';
import { roomApi } from '../shared/services/room/roomApi';
import Modal from './ui/Modal/Modal';
import { useConfirmModal } from '../shared/hooks/ui/useConfirmModal';
import { Button } from '../shared/components/ui';


function HostAnswer() {
    const [turn, setTurn] = useState<number>(0);
    const [searchParams] = useSearchParams();
    const round = searchParams.get("round") || "1";
    const roomId = searchParams.get("roomId") || "1";
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
    const [kickModalOpen, setKickModalOpen] = useState(false);
    const [playerToKick, setPlayerToKick] = useState<PlayerData | null>(null);
    const [isKicking, setIsKicking] = useState(false);

    // Confirmation modal hook
    const { modalState, showConfirmModal, closeModal } = useConfirmModal();

    const { listenToBroadcastedAnswer, listenToScores, listenToPlayerColors } = useFirebaseListener()
    const [localPlayersScore, setLocalPlayersScore] = useState<Partial<PlayerData[]>>([])
    const { openBuzz, sendCurrentTurn, updateScoring, setPlayerColor, closeBuzz } = useGameApi()
    const dispatch = useAppDispatch();
    const { mode, players, selectedDifficulty, numberOfSelectedRow, currentTurn } = useAppSelector(state => state.game)


    // Generate spots array based on actual max players from room settings
    const roomSettings = JSON.parse(localStorage.getItem(`scoreRules_${roomId}`) || '{}');
    const maxPlayers = roomSettings.maxPlayers || 4;
    const spots = Array.from({ length: maxPlayers }, (_, i) => i + 1);
    const isFirstMounted = useRef(true)
    const isAnswerListFirstMounted = useRef(true)
    // Initialize turn assignments based on max players
    useEffect(() => {
        console.log("room mode", mode);
    }, [mode])

    useEffect(() => {
        const storedMode = localStorage.getItem(`mode_${roomId}`);
        if (storedMode && (storedMode === 'manual' || storedMode === 'auto' || storedMode === 'adaptive')) {
            dispatch(setMode(storedMode));
        }
    }, [])

    const initializeTurnAssignments = () => {
        const assignments: { [spot: number]: number | null } = {};
        for (let i = 1; i <= Math.min(maxPlayers, 8); i++) {
            assignments[i] = null;
        }
        return assignments;
    };
    const [turnAssignments, setTurnAssignments] = useState<{ [spot: number]: number | null }>(initializeTurnAssignments());
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
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

    const handleScoreAdjust = (amount: number, isCorrect: boolean, stt?: string) => {
        console.log("localPlayersScore", localPlayersScore);
        console.log("amount", amount);
        console.log("isCorrect", isCorrect);
        console.log("stt", stt);

        const updatedScoreList = localPlayersScore.map((p: PlayerData | undefined) => {
            if (p && p.stt === stt && p.score !== undefined) {
                console.log("p.score", p.score);
                console.log("p", p)
                console.log("p.stt", p.stt)
                return {
                    ...p,
                    score: p.score + amount,
                    isCorrect: isCorrect,
                    isModified: true,
                };
            }
            console.log("p", p)
            return p;
        });

        console.log("updatedScoreList", updatedScoreList);

        setLocalPlayersScore(updatedScoreList)
    }

    // Kick player functions
    const handleKickPlayerClick = (player: PlayerData) => {
        setPlayerToKick(player);
        setKickModalOpen(true);
    };

    const handleKickPlayerConfirm = async () => {
        if (!playerToKick || !roomId || !playerToKick.uid) return;

        setIsKicking(true);
        try {
            console.log(`🚫 Kicking player ${playerToKick.userName} (${playerToKick.uid}) from room ${roomId}`);

            const result = await roomApi.kickPlayer(roomId, playerToKick.uid);

            // Update Redux state
            dispatch(removePlayer(playerToKick.uid));

            // Close modal and reset state
            setKickModalOpen(false);
            setPlayerToKick(null);

            // If the kicked player was selected, deselect them
            if (selectedPlayer?.uid === playerToKick.uid) {
                setSelectedPlayer(null);
            }

            toast.success(`Đã loại bỏ ${playerToKick.userName} khỏi phòng`);
            console.log(`✅ Successfully kicked player:`, result);

        } catch (error) {
            console.error(`❌ Failed to kick player:`, error);
            toast.error(`Không thể loại bỏ ${playerToKick.userName}. Vui lòng thử lại.`);
        } finally {
            setIsKicking(false);
        }
    };

    const handleKickModalClose = () => {
        if (!isKicking) {
            setKickModalOpen(false);
            setPlayerToKick(null);
        }
    };

    useEffect(() => {
        setTurn(0);
    }, [round]);


    // useEffect(() => {
    //     const currentScoreList = localStorage.getItem("scoreList");
    //     if (currentScoreList) {
    //         setPlayerScores(JSON.parse(currentScoreList));
    //     }
    // }, [round]);

    useEffect(() => {
        const unsubscribeScores = listenToScores(
            (scores) => {
                setLocalPlayersScore(scores)
            }
        );
        return () => unsubscribeScores();
    }, [round, roomId]);

    useEffect(() => {
        const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer();
        return () => unsubscribeBroadcastedAnswer();
    }, [roomId]);

    // Listen to player colors
    useEffect(() => {
        const unsubscribePlayerColors = listenToPlayerColors((colors) => {
            setPlayerColors(colors || {});
        });
        return () => unsubscribePlayerColors();
    }, [roomId, listenToPlayerColors]);

    const storedPlayers = localStorage.getItem("playerList");

    // Handle color change
    const handleColorChange = async (playerStt: string, color: string) => {
        console.log('handleColorChange called:', { playerStt, color, roomId });
        try {
            // Skip API call if color is empty (removing color)
            if (color && color.trim() !== '') {
                // Call API to set player color
                console.log('Calling setPlayerColor API...', color);
                const result = await setPlayerColor(roomId, playerStt, color);
                console.log('API call result:', result);
            } else {
                console.log('Removing color locally (no API call for empty color)');
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

    return (
        <div className="flex gap-6">
            {/* Left: Player grid */}
            <div className={` gap-4 flex-1`}>
                {spots.map((spotNumber) => {
                    console.log("localPlayersScore", localPlayersScore);
                    const player = players !== null ? players.find((p: PlayerData) => {
                        if (p && p.stt) {
                            console.log("p.stt", p.stt);
                            console.log("spotNumber", spotNumber);
                            return parseInt(p.stt) === spotNumber
                        }
                        console.log("players", players)
                    }) : null;

                    const score = localPlayersScore !== null ? localPlayersScore.find((p: PlayerData | undefined) => {
                        if (p && p.stt) {

                            return parseInt(p.stt) === spotNumber
                        }
                    }) : null;
                    console.log("player", player)
                    console.log("score", score)

                    // const playerScore = playerScores.find((score: Score) => score.stt === spotNumber.toString());
                    // const answer = answerList?.find((a: Answer) => parseInt(a.stt) === spotNumber);
                    const isCurrent = currentTurn !== null && Number(currentTurn) === spotNumber;
                    return player ? (
                        <div
                            key={spotNumber}
                            onClick={() => setSelectedPlayer(player)}
                            className={`relative flex items-center w-full min-h-[180px] bg-slate-800/80 rounded-xl p-4 shadow-md border border-slate-700/50 transition-all duration-200 ${isCurrent ? "ring-4 ring-yellow-400 border-yellow-400" : ""}`}
                        >
                            {/* Kick Player Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent selecting the player
                                    handleKickPlayerClick(player);
                                }}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10"
                                title={`Loại bỏ ${player.userName}`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
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
                                            isHost={true}
                                            currentColor={playerColors[player.stt || 0]}
                                            onColorChange={handleColorChange}
                                            usedColors={usedColors}
                                        />
                                    </div>
                                )}

                            </div>
                            <div className="flex flex-col flex-1">
                                <p className="text-white font-bold border-b border-slate-700/50 pb-1 text-lg">
                                    {`player_${player.stt}: ${player.userName}`}
                                </p>
                                <p className="text-white text-lg font-bold">{score?.score ?? 0}</p>
                                <p className="text-white border-b border-slate-700/50 pb-1 mt-1 text-lg">
                                    {player?.answer ?? ""}
                                </p>
                                <p className="text-gray-400 text-lg mt-1">
                                    {player?.time ? `${player.time}s` : ""}
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
                            <div className="relative mx-auto w-16 h-16">
                                <img src={selectedPlayer.avatar} alt="Selected" className="w-16 h-16 rounded-full" />
                                {/* Color indicator for Round 4 */}
                                {round === "4" && playerColors[selectedPlayer.stt || 0] && (
                                    <div
                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                        style={{ backgroundColor: playerColors[selectedPlayer.stt || 0] }}
                                        title={`Màu của ${selectedPlayer.userName}`}
                                    ></div>
                                )}
                            </div>
                            <p className="text-center font-bold mt-2">{selectedPlayer.userName}</p>
                            <p className="text-center">Player_{selectedPlayer.stt}</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {[5, 10].map((amount) => (
                                <Button
                                    key={`plus${amount}`}
                                    onClick={() => {
                                        if (selectedPlayer) {
                                            handleScoreAdjust(amount, true, selectedPlayer.stt);
                                        }
                                    }}
                                    variant="success"
                                    size="sm"
                                    className="shadow"
                                >
                                    +{amount}
                                </Button>
                            ))}
                            {[5, 10].map((amount) => (
                                <Button
                                    key={`minus${amount}`}
                                    onClick={() => {
                                        if (selectedPlayer) {
                                            handleScoreAdjust(-amount, false, selectedPlayer.stt);
                                        }
                                    }}
                                    variant="danger"
                                    size="sm"
                                    className="shadow"
                                >
                                    -{amount}
                                </Button>
                            ))}
                        </div>

                        {(round === "3" || round === "4" || round === "2" || round === "turn") && (
                            <>
                                <Button
                                    onClick={async () => {
                                        dispatch(setCurrentTurn(parseInt(selectedPlayer.stt || "")))
                                        await sendCurrentTurn(roomId, parseInt(selectedPlayer.stt || ""));
                                        toast.success(`Đã cập nhật lượt thi cho ${selectedPlayer.userName}`);
                                    }}
                                    variant={currentTurn === parseInt(selectedPlayer.stt || "") ? 'danger' : 'primary'}
                                    size="md"
                                    fullWidth
                                    className="shadow"
                                >
                                    {currentTurn === parseInt(selectedPlayer.stt || "") ? 'Đang thi' : 'Cập nhật lượt thi'}
                                </Button>

                                {
                                    round === "2" && (
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                onClick={() => {
                                                    console.log("numberOfSelectedRow", numberOfSelectedRow);

                                                    const obstaclePoint = (7 - numberOfSelectedRow) * 15
                                                    console.log("obstaclePoint", obstaclePoint);

                                                    updateScoring({
                                                        roomId: roomId,
                                                        mode: "auto",
                                                        round: "2",
                                                        stt: selectedPlayer.stt,
                                                        isCorrect: true,
                                                        isObstacleCorrect: true,
                                                        obstaclePoint: obstaclePoint,
                                                    });
                                                    toast.success(`Đã cộng ${obstaclePoint} đúng CNV cho ${selectedPlayer.userName}`);
                                                }}
                                                variant="success"
                                                size="md"
                                                className="flex-1 min-w-[120px]"
                                            >
                                                Chấm điểm đúng CNV
                                            </Button>
                                        </div>
                                    )
                                }
                                {/* Round 3 buttons moved to Round3.tsx for better UX */}
                                {round === "4" && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={async () => {
                                                await updateScoring({
                                                    roomId: roomId,
                                                    mode: "auto",
                                                    round: "4",
                                                    stt: currentTurn.toString(),
                                                    isCorrect: true,
                                                    round4Mode: "main",
                                                    difficulty: selectedDifficulty,
                                                });
                                            }}
                                            variant="success"
                                            size="md"
                                            className="flex-1 min-w-[120px]"
                                        >
                                            Đúng
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                toast.success(`Đã mở bấm chuông`);
                                                await openBuzz(roomId)
                                                const timeoutId = setTimeout(() => {
                                                    closeBuzz(roomId)
                                                }, 5000)

                                                return () => {

                                                    clearTimeout(timeoutId)
                                                }

                                            }}
                                            variant="danger"
                                            size="md"
                                            className="flex-1 min-w-[120px]"
                                        >
                                            Sai
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                await updateScoring({
                                                    roomId: roomId,
                                                    mode: "auto",
                                                    round: "4",
                                                    stt: currentTurn.toString(),
                                                    isCorrect: true,
                                                    round4Mode: "nshv",
                                                    difficulty: selectedDifficulty,
                                                });
                                            }}
                                            variant="success"
                                            size="md"
                                            className="flex-1 min-w-[120px]"
                                        >
                                            NSHV Đúng
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                await updateScoring({
                                                    roomId: roomId,
                                                    mode: "auto",
                                                    round: "4",
                                                    stt: currentTurn.toString(),
                                                    isCorrect: false,
                                                    round4Mode: "nshv",
                                                    difficulty: selectedDifficulty,
                                                });
                                                await openBuzz(roomId)
                                                toast.success(`Đã mở bấm chuông`);
                                                const timeoutId = setTimeout(() => {
                                                    closeBuzz(roomId)
                                                }, 5000)

                                                return () => {

                                                    clearTimeout(timeoutId)
                                                }
                                            }}
                                            variant="danger"
                                            size="md"
                                            className="flex-1 min-w-[120px]"
                                        >
                                            NSHV Sai
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                await updateScoring({
                                                    roomId: roomId,
                                                    mode: "auto",
                                                    round: "4",
                                                    sttTakeTurn: selectedPlayer.stt,
                                                    sttTaken: currentTurn.toString(),
                                                    isTakeTurnCorrect: true,
                                                    round4Mode: "take_turn",
                                                    difficulty: selectedDifficulty,
                                                });
                                            }}
                                            variant="success"
                                            size="md"
                                            className="flex-1 min-w-[120px]"
                                        >
                                            Giành lượt Đúng
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                await updateScoring({
                                                    roomId: roomId,
                                                    mode: "auto",
                                                    round: "4",
                                                    sttTakeTurn: selectedPlayer.stt,
                                                    sttTaken: currentTurn.toString(),
                                                    isTakeTurnCorrect: false,
                                                    round4Mode: "take_turn",
                                                    difficulty: selectedDifficulty,
                                                });
                                            }}
                                            variant="danger"
                                            size="md"
                                            className="flex-1 min-w-[120px]"
                                        >
                                            Giành lượt Sai
                                        </Button>
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
                <Button
                    onClick={async () => {
                        toast.success('Đã cập nhật điểm!');
                        await updateScoring({
                            roomId: roomId,
                            mode: "manual",
                            round: round,
                            scores: localPlayersScore,
                        });

                    }}
                    variant="success"
                    size="lg"
                    fullWidth
                    className="shadow font-semibold"
                >
                    Xác nhận điểm
                </Button>

                <Button
                    onClick={() => {
                        showConfirmModal({
                            text: `Bạn có chắc chắn muốn chấm điểm tự động cho vòng thi ${round}?`,
                            onConfirm: () => {
                                updateScoring({
                                    roomId: roomId,
                                    mode: mode,
                                    round: round,
                                    stt: currentTurn.toString(),
                                });
                                toast.success(`Đã cập nhật điểm cho vòng thi ${round}`);
                            },
                            confirmText: 'Chấm điểm',
                            confirmVariant: 'primary'
                        });
                    }}
                    variant="success"
                    size="lg"
                    fullWidth
                    className="shadow font-semibold"
                >
                    Chấm điểm tự động
                </Button>


            </div>

            {/* Kick Player Modal */}
            <KickPlayerModal
                isOpen={kickModalOpen}
                onClose={handleKickModalClose}
                onConfirm={handleKickPlayerConfirm}
                player={playerToKick}
                isLoading={isKicking}
            />

            {/* Confirmation Modal */}
            {modalState.isOpen && (
                <Modal
                    text={modalState.text}
                    buttons={modalState.buttons}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

export default HostAnswer;
