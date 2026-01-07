import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { PlayerData } from "../shared/types";
import { useFirebaseListener } from "../shared/hooks";
import useGameApi from "../shared/hooks/api/useGameApi";
import SimpleColorPicker from "./ui/Color/ColorPicker";
import { toast } from "react-toastify";
import { useSounds } from "../context/soundContext";

interface PlayerAnswerProps {
    isSpectator?: boolean;
}

const PlayerAnswer: React.FC<PlayerAnswerProps> = ({ isSpectator }) => {
    const sounds = useSounds();
    const [searchParams] = useSearchParams();
    const round = searchParams.get("round") || "1";
    const roomId = searchParams.get("roomId") || "1";

    const [currentTurn, setCurrentTurn] = useState<number | null>(null);
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});

    const { listenToCurrentTurn, listenToPlayerColors, listenToBroadcastedAnswer } = useFirebaseListener();
    const { setPlayerColor } = useGameApi();

    const { players } = useAppSelector((state) => state.game);

    const maxPlayers = players ? Math.max(4, players.length) : 4;
    const spots = Array.from({ length: Math.min(maxPlayers, 8) }, (_, i) => i + 1);

    /* ---------------- listeners ---------------- */
    useEffect(() => {
        const unsub = listenToCurrentTurn((turn) => setCurrentTurn(turn));
        return () => unsub();
    }, [roomId]);

    useEffect(() => {
        const unsub = listenToPlayerColors((colors) => {
            setPlayerColors(colors || {});
        });
        return () => unsub();
    }, [roomId]);

    useEffect(() => {
        const unsubscribeBroadcastedAnswer = listenToBroadcastedAnswer(() => {

        })

        return () => {
            unsubscribeBroadcastedAnswer();
        };
    }, []);

    /* ---------------- color logic ---------------- */
    const usedColors = new Set<string>(Object.values(playerColors));

    const handleColorChange = async (playerStt: string, color: string) => {
        try {
            if (color?.trim()) {
                await setPlayerColor(roomId, playerStt, color);
            }

            setPlayerColors((prev) => {
                const next = { ...prev };
                if (color?.trim()) next[playerStt] = color;
                else delete next[playerStt];
                return next;
            });

            toast.success("Đã cập nhật màu");
        } catch {
            toast.error("Không thể cập nhật màu");
        }
    };

    /* ---------------- styles ---------------- */
    const getSpotStyle = (isCurrent: boolean) =>
        isCurrent
            ? "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border-yellow-400/60 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20"
            : "bg-gradient-to-br from-cyan-800/40 to-blue-900/40 border-cyan-500/30";

    /* ================== UI ================== */
    return (
        <div className="grid grid-cols-1 gap-4 w-full mt-4">
            {spots.map((spotNumber) => {
                const player = Array.isArray(players)
                    ? players.find(
                        (p: PlayerData) =>
                            Number(p.stt) === spotNumber
                    )
                    : null;
                console.log("selected players", players)
                console.log("selected player", player)

                const isCurrent = currentTurn === spotNumber;

                /* ----------- PLAYER SLOT ----------- */
                if (player) {
                    return (
                        <div
                            key={spotNumber}
                            className={`relative rounded-xl border p-4 min-h-[96px] backdrop-blur-md transition-all duration-300
                ${getSpotStyle(isCurrent)}
              `}
                        >
                            {/* turn glow number */}
                            {isCurrent && (
                                <div className="absolute bottom-1 right-2 text-6xl opacity-10 text-white select-none">
                                    {spotNumber}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                {/* avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-cyan-400/60 overflow-hidden shadow-lg">
                                        <img
                                            src={player.avatar}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* color picker */}
                                    {round === "4" && (
                                        <div className="absolute -bottom-1 -right-1 scale-75">
                                            <SimpleColorPicker
                                                playerStt={player.stt}
                                                isHost={false}
                                                currentColor={playerColors[player.stt || ""]}
                                                onColorChange={handleColorChange}
                                                usedColors={usedColors}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-cyan-50 truncate">
                                        <span>{`TS ${player.stt}`}</span>
                                        <span className="opacity-80 truncate">
                                            {player.userName}
                                        </span>

                                        {round === "4" &&
                                            playerColors[player.stt || ""] && (
                                                <span
                                                    className="w-3 h-3 rounded-full border border-white/70"
                                                    style={{
                                                        backgroundColor:
                                                            playerColors[player.stt || ""],
                                                    }}
                                                />
                                            )}
                                    </div>

                                    {player.answer && (
                                        <div className="text-xs text-cyan-200/80 truncate mt-0.5">
                                            {player.answer}
                                        </div>
                                    )}
                                </div>

                                {/* time */}
                                {player.time && (
                                    <div className="text-xs text-cyan-300 shrink-0">
                                        {player.time}s
                                    </div>
                                )}

                                {(
                                    <div className="text-xs text-cyan-300 shrink-0">
                                        {player.score}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                /* ----------- EMPTY SLOT ----------- */
                // return (
                //     <div
                //         key={spotNumber}
                //         className="rounded-xl border border-cyan-500/20 bg-blue-900/20 min-h-[96px] opacity-40"
                //     />
                // );
            })}
        </div>
    );
};

export default PlayerAnswer;
