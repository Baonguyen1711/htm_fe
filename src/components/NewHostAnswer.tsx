import React, { useEffect, useState } from 'react';
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

    const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
            {title && (
                <div className="text-slate-200 font-semibold mb-3">{title}</div>
            )}
            <div className="flex flex-col gap-3">{children}</div>
        </div>
    )

    const baseBtn =
        "w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 \
   hover:bg-slate-700/60 hover:border-white/20 transition-all duration-200 \
   disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"


    const [searchParams] = useSearchParams();
    const round = searchParams.get("round") || "1";
    const roomId = searchParams.get("roomId") || "1";

    const dispatch = useAppDispatch();
    const { mode, players, selectedDifficulty, numberOfSelectedRow, currentTurn } = useAppSelector(state => state.game);

    const { listenToScores, listenToPlayerColors } = useFirebaseListener();
    const { sendCurrentTurn, updateScoring, setPlayerColor, openBuzz, closeBuzz } = useGameApi();

    const [localPlayersScore, setLocalPlayersScore] = useState<Partial<PlayerData[]>>([]);
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
    const [kickModalOpen, setKickModalOpen] = useState(false);
    const [playerToKick, setPlayerToKick] = useState<PlayerData | null>(null);
    const [isKicking, setIsKicking] = useState(false);

    const { modalState, showConfirmModal, closeModal } = useConfirmModal();

    const roomSettings = JSON.parse(localStorage.getItem(`scoreRules_${roomId}`) || '{}');
    const maxPlayers = roomSettings.maxPlayers || 4;
    const spots = Array.from({ length: maxPlayers }, (_, i) => i + 1);

    useEffect(() => {
        const storedMode = localStorage.getItem(`mode_${roomId}`);
        if (storedMode && (storedMode === 'manual' || storedMode === 'auto' || storedMode === 'adaptive')) {
            dispatch(setMode(storedMode));
        }
    }, []);

    useEffect(() => {
        const unsubscribeScores = listenToScores(scores => setLocalPlayersScore(scores));
        return () => unsubscribeScores();
    }, [roomId]);

    useEffect(() => {
        const unsubscribePlayerColors = listenToPlayerColors(colors => setPlayerColors(colors || {}));
        return () => unsubscribePlayerColors();
    }, [roomId]);

    const handleScoreAdjust = (amount: number, stt?: string) => {
        setLocalPlayersScore(prev =>
            prev.map(p => p?.stt === stt ? { ...p, score: (p?.score || 0) + amount, isModified: true } : p)
        );
    };

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

    const handleKickPlayerClick = (player: PlayerData) => {
        setPlayerToKick(player);
        setKickModalOpen(true);
    };

    const handleKickPlayerConfirm = async () => {
        if (!playerToKick || !roomId || !playerToKick.uid) return;
        setIsKicking(true);
        try {
            await roomApi.kickPlayer(roomId, playerToKick.uid);
            dispatch(removePlayer(playerToKick.uid));
            setKickModalOpen(false);
            setPlayerToKick(null);
            toast.success(`Đã loại bỏ ${playerToKick.userName}`);
        } catch {
            toast.error(`Không thể loại bỏ ${playerToKick.userName}`);
        } finally {
            setIsKicking(false);
        }
    };

    const handleColorChange = async (playerStt: string, color: string) => {
        try {
            if (color.trim() !== '') await setPlayerColor(roomId, playerStt, color);
            const newColors = { ...playerColors };
            if (color.trim() !== '') newColors[playerStt] = color;
            else delete newColors[playerStt];
            setPlayerColors(newColors);
            toast.success(color ? `Đã cập nhật màu cho player_${playerStt}` : `Đã xóa màu cho player_${playerStt}`);
        } catch {
            toast.error('Không thể cập nhật màu');
        }
    };

    const usedColors = new Set(Object.values(playerColors));

    return (
        <div className="flex flex-col gap-3 w-full">
            {spots.map((spotNumber) => {
                const player = players?.find(p => parseInt(p.stt || "") === spotNumber);
                const score = localPlayersScore?.find(p => parseInt(p?.stt || "") === spotNumber);
                if (!player) return <div key={spotNumber} className="bg-slate-800/80 rounded-xl h-28 opacity-50" />;
                const isCurrent = currentTurn !== null && Number(currentTurn) === spotNumber;
                const color = playerColors[player?.stt || ""];
                console.log("playerColors", (round === "3" || round === "4") ? playerColors : "")
                console.log("color", (round === "3" || round === "4") ? color : "")
                console.log("isCurrent", (round === "3" || round === "4") ? isCurrent : "")
                return (
                    <div key={spotNumber} className={`bg-slate-800/80 rounded-xl p-3 flex flex-col gap-2 shadow-md border border-slate-700/50 text-sm ${isCurrent ? "ring-4 ring-yellow-400" : ""}`}
                        style={{
                            borderColor: color || "rgba(148,163,184,0.4)", // fallback slate
                        }}
                    >
                        {/* Header: avatar + name + score + time + kick */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <img src={player.avatar} alt="Player" className="w-12 h-12 rounded-full border-2 border-white" />
                                <button
                                    onClick={() => handleKickPlayerClick(player)}
                                    className="absolute top-0 right-0 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs"
                                >×</button>
                                {round === "4" && (
                                    <>
                                        <div className="absolute -bottom-1 -right-1">
                                            <SimpleColorPicker
                                                playerStt={player.stt}
                                                isHost
                                                currentColor={playerColors[player.stt || 0]}
                                                onColorChange={handleColorChange}
                                                usedColors={usedColors}
                                            />


                                        </div>


                                    </>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-semibold">{player.userName}</p>
                                <p className="text-white font-bold">{score?.score ?? 0}</p>
                                <p className="text-gray-400">{player.time ? `${player.time}s` : ""}</p>
                            </div>
                        </div>

                        {/* Score adjust buttons */}
                        <div className="flex gap-1 flex-wrap">
                            {[5, 10].map(amount => (
                                <Button key={`plus${amount}`} variant="success" size="xs" onClick={() => handleScoreAdjust(amount, player.stt)}>+{amount}</Button>
                            ))}
                            {[5, 10].map(amount => (
                                <Button key={`minus${amount}`} variant="danger" size="xs" onClick={() => handleScoreAdjust(-amount, player.stt)}>-{amount}</Button>
                            ))}
                        </div>

                        {/* Update turn */}
                        {
                            (round === "3" || round === "4") && (
                                <Button
                                    onClick={async () => {
                                        dispatch(setCurrentTurn(parseInt(player.stt || "")));
                                        await sendCurrentTurn(roomId, parseInt(player.stt || ""));
                                        toast.success(`Cập nhật lượt cho ${player.userName}`);
                                    }}
                                    variant={currentTurn === parseInt(player.stt || "") ? 'danger' : 'primary'}
                                    size="sm"
                                    fullWidth
                                >
                                    {currentTurn === parseInt(player.stt || "") ? 'Đang thi' : 'Cập nhật lượt thi'}
                                </Button>
                            )
                        }

                        {
                            (round === "3" || round === "4") && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    <span className="text-blue-300 text-xs font-semibold">Lượt:</span>

                                    {[1, 2, 3, 4].map((turnNum) => (
                                        <button
                                            key={turnNum}
                                            type="button"
                                            className={`px-2 py-1 rounded text-xs font-semibold border transition
        ${turnAssignments[spotNumber] === turnNum
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
                                            className="px-2 py-1 rounded text-xs bg-gray-600 text-white border border-gray-700 hover:bg-gray-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAssignTurn(spotNumber, null as any);
                                            }}
                                        >
                                            X
                                        </button>
                                    )}
                                </div>
                            )
                        }


                        {/* Round 2/4 special buttons */}
                        {round === "2" && (
                            <Button
                                onClick={() => {
                                    const obstaclePoint = (7 - numberOfSelectedRow) * 15;
                                    updateScoring({ roomId, mode: "auto", round: "2", stt: player.stt, isCorrect: true, isObstacleCorrect: true, obstaclePoint });
                                    toast.success(`Đã cộng ${obstaclePoint} CNV cho ${player.userName}`);
                                }}
                                variant="success"
                                size="sm"
                                fullWidth
                            >Chấm điểm đúng CNV</Button>
                        )}

                        {round === "4" && (
                            <div className="flex flex-wrap gap-1">
                                <Button onClick={() => updateScoring({ roomId, mode: "auto", round: "4", stt: currentTurn.toString(), isCorrect: true, round4Mode: "main", difficulty: selectedDifficulty })} variant="success" size="xs">Đúng</Button>
                                <Button onClick={async () => { await openBuzz(roomId); setTimeout(() => closeBuzz(roomId), 5000); }} variant="danger" size="xs">Sai</Button>
                                <Button onClick={() => updateScoring({ roomId, mode: "auto", round: "4", sttTakeTurn: player.stt, sttTaken: currentTurn.toString(), isTakeTurnCorrect: true, round4Mode: "take_turn", difficulty: selectedDifficulty })} variant="success" size="xs">Giành lượt Đúng</Button>
                                <Button onClick={() => updateScoring({ roomId, mode: "auto", round: "4", sttTakeTurn: player.stt, sttTaken: currentTurn.toString(), isTakeTurnCorrect: false, round4Mode: "take_turn", difficulty: selectedDifficulty })} variant="danger" size="xs">Giành lượt Sai</Button>
                                <Button onClick={
                                    async () => {
                                        await updateScoring({
                                            roomId: roomId,
                                            mode: "auto",
                                            round: "4",
                                            stt: currentTurn.toString(),
                                            isCorrect: true,
                                            round4Mode: "nshv",
                                            difficulty: selectedDifficulty,
                                        });
                                    }} variant="success" size="xs">NSHV đúng</Button>
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
                                    }} variant="danger" size="xs">NSHV sai</Button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Kick modal */}
            <KickPlayerModal
                isOpen={kickModalOpen}
                onClose={() => setKickModalOpen(false)}
                onConfirm={handleKickPlayerConfirm}
                player={playerToKick}
                isLoading={isKicking}
            />

            {/* Confirmation modal */}
            {modalState.isOpen && (
                <Modal text={modalState.text} buttons={modalState.buttons} onClose={closeModal} />
            )}

            {/* CHẤM ĐIỂM */}
            <Card title="Chấm điểm">
                <button className={baseBtn} onClick={() => {
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
                }}>
                    Chấm điểm tự động
                </button>

                <button className={baseBtn} onClick={async () => {
                    toast.success('Đã cập nhật điểm!');
                    await updateScoring({
                        roomId: roomId,
                        mode: "manual",
                        round: round,
                        scores: localPlayersScore,
                    });

                }}>
                    Xác nhận chấm điểm
                </button>
            </Card>
        </div>
    );
}

export default HostAnswer;
