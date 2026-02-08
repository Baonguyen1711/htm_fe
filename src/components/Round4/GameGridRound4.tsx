import React, { useEffect, useRef, useState } from 'react';
import { useFirebaseListener } from '../../shared/hooks';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import { Button } from '../../shared/components/ui';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { setCurrentTurn } from '../../app/store/slices/gameSlice';
import { useAppSelector } from '../../app/store';
import MediaModal from '../ui/Modal/MediaModal';
import { toast } from "react-toastify"

interface GameGridProps {
    initialGrid: string[][];
    gridColors: string[][];
    menu: { visible: boolean; rowIndex?: number; colIndex?: number };
    isHost: boolean;
    isSpectator?: boolean;
    showModal: boolean;
    buzzedPlayer: string;
    staredPlayer: string;
    menuRef: React.RefObject<HTMLDivElement | null>;
    onCellClick: (row: number, col: number) => void;
    onMenuAction: (
        action: 'select' | 'red' | 'green' | 'blue' | 'yellow' | 'orange',
        row: number,
        col: number
    ) => void;
    onCloseModal: () => void;
}

const GameGridRound4: React.FC<GameGridProps> = ({
    initialGrid,
    gridColors,
    menu,
    isHost,
    isSpectator = false,
    showModal,
    buzzedPlayer,
    staredPlayer,
    onCellClick,
    onMenuAction,
    onCloseModal,
    menuRef
}) => {
    const { listenToTimeStart, listenToMedia, listenToRules } = useFirebaseListener();
    const { startTimer } = useTimeStart();
    const { currentQuestion } = useAppSelector(state => state.game)
    const sounds = useSounds();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { sendCurrentTurn, startMedia, stopMedia, hideRules, showRules } = useGameApi()
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "1"
    const dispatch = useAppDispatch()
    const [isPlaying, setIsPlaying] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const currentQuestionRef = useRef(currentQuestion);
    const baseBtn =
        "w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 \
   hover:bg-slate-700/60 hover:border-white/20 transition-all duration-200 \
   disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
    const handleClickPlayMedia = () => {
        if (!isPlaying) {
            startMedia(roomId)
            setIsPlaying(true)
        } else {
            stopMedia(roomId)
            setIsPlaying(false)
        }

    }

    useEffect(() => {
        const unsubscribeRules = listenToRules((data: any) => {
            console.log("Rules data received:", data);

            // Show modal when host triggers it, regardless of round matching
            if (data && data.show && data.round === "media") {
                setShowMediaModal(true)
            } else {
                setShowMediaModal(false);
            }
        })

        return () => {
            unsubscribeRules()
        }
    }, [])

    const handleHideMediaModal = async () => {
        try {
            await hideRules(roomId)
            toast.success("Đã ẩn modal media")
        } catch (e) {
            console.log("error", e)
            toast.error("Lỗi khi ẩn modal media")
        }
    }
    useEffect(() => {
        console.log("current question", currentQuestion)
        currentQuestionRef.current = currentQuestion;
    }, [currentQuestion]);


    const gridSize = initialGrid?.length || 0;

    const renderMediaContent = () => {
        const url = currentQuestion?.imgUrl;
        if (!url) return <p className="text-white">No media</p>;

        const extension = url.split('.').pop()?.toLowerCase() || '';

        // IMAGE
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return (
                <div className="flex flex-col items-center gap-3">
                    <img
                        src={url}
                        alt="Question Visual"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                </div>
            );
        }

        // AUDIO
        if (['mp3', 'wav', 'ogg'].includes(extension)) {
            return (
                <div className="flex flex-col items-center gap-3 w-full">
                    <audio className="w-full" ref={audioRef}>
                        <source src={url} />
                        Your browser does not support the audio element.
                    </audio>

                    {isHost && (
                        <button
                            className={baseBtn}
                            onClick={handleClickPlayMedia}
                        >
                            {isPlaying ? "Dừng media" : "Chạy media"}
                        </button>
                    )}
                </div>
            );
        }

        // VIDEO
        if (['mp4', 'webm', 'ogg'].includes(extension)) {
            return (
                <div className="flex flex-col items-center gap-3">
                    <video
                        ref={videoRef}
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    >
                        <source src={url} type={`video/${extension}`} />
                        Your browser does not support the video tag.
                    </video>

                    {isHost && (
                        <div className="flex gap-2 mt-4 w-full">
                            <button
                                className={baseBtn}
                                onClick={handleClickPlayMedia}
                            >
                                {isPlaying ? "Dừng media" : "Chạy media"}
                            </button>
                            <button
                                className={baseBtn}
                                onClick={handleHideMediaModal}
                            >
                                Ẩn cửa sổ media
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        return <p className="text-white">Unsupported media type</p>;
    };


    useEffect(() => {
        const unsubscribe = listenToTimeStart(() => {
            const audio = sounds['timer_4'];
            audio?.play();
            startTimer(15);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = listenToMedia(
            (data) => {
                console.log("media data", data)

                if (data.action === "play") {
                    setIsPlaying(true);
                    console.log("current question", currentQuestionRef.current)
                    const extension = currentQuestionRef.current?.imgUrl?.split('.').pop()?.toLowerCase() || ""
                    const now = Date.now();
                    const diff = data.timeToPlay - now;
                    console.log("diff", diff)
                    console.log("extension", extension)
                    console.log("video ref", videoRef.current)
                    console.log("audio ref", audioRef.current)
                    if (diff > 0) {
                        setTimeout(() => {
                            if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
                                console.log("audio ref inside", audioRef.current)

                                const audio = audioRef.current;
                                if (audio) {
                                    audio.load();
                                    audio.play().catch(err => console.log(err));
                                }
                            }

                            if (["mp4", "webm", "ogg"].includes(extension)) {
                                videoRef.current?.play();
                            }
                        }, diff);
                    }
                }

                if (data.action === "stop") {
                    setIsPlaying(false);
                    audioRef.current?.pause();
                    videoRef.current?.pause();
                }
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    useEffect(() => {

        return () => {
            const resetCurrentTurn = async () => {
                dispatch(setCurrentTurn(0))
                if (isHost) {
                    await sendCurrentTurn(roomId, 0);
                }
            }

            resetCurrentTurn()
        }
    }, [])

    // ===== VALIDATION =====
    const isValidGrid =
        Array.isArray(initialGrid) &&
        initialGrid.length === gridSize &&
        initialGrid.every(
            row => Array.isArray(row) && row.length === gridSize
        );

    const isValidColors =
        Array.isArray(gridColors) &&
        gridColors.length === gridSize &&
        gridColors.every(
            row => Array.isArray(row) && row.length === gridSize
        );

    if (!isValidGrid || !isValidColors) {
        console.error('Invalid grid data:', {
            gridSize,
            initialGrid,
            gridColors,
        });
        return (
            <div className="text-red-500 text-center">
                Invalid grid data
            </div>
        );
    }

    const columnLabels = Array.from({ length: gridSize }, (_, i) => (i + 1).toString());
    const rowLabels = Array.from({ length: gridSize }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    return (
        <>
            {/* COLUMN LABELS */}
            <div
                className="grid mb-2 w-fit"
                style={{ gridTemplateColumns: `repeat(${gridSize + 1}, 3.5rem)` }}
            >
                <div />
                {columnLabels.map(label => (
                    <div
                        key={label}
                        className="flex items-center justify-center font-bold text-cyan-100 w-14 h-14"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* GRID */}
            <div className="flex flex-col gap-2">
                {rowLabels.map((rowLabel, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                        {/* ROW LABEL */}
                        <div className="flex items-center justify-center font-bold text-cyan-100 w-14 h-14">
                            {rowLabel}
                        </div>

                        {/* CELLS */}
                        {initialGrid[rowIndex].map((cell, colIndex) => {
                            const showMenu =
                                menu.visible &&
                                menu.rowIndex === rowIndex &&
                                menu.colIndex === colIndex;

                            return (
                                <div key={`${rowIndex}-${colIndex}`} className="relative">
                                    <div
                                        onClick={() =>
                                            isHost &&
                                            !isSpectator &&
                                            onCellClick(rowIndex, colIndex)
                                        }
                                        className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 transition
                                            ${isHost && !isSpectator
                                                ? 'cursor-pointer hover:scale-105'
                                                : 'cursor-not-allowed'
                                            }`}
                                        style={{
                                            backgroundColor: gridColors[rowIndex][colIndex],
                                            borderColor: showMenu ? '#38bdf8' : '#334155'
                                        }}
                                    >
                                        <span className="text-black text-lg font-semibold">
                                            {cell}
                                        </span>
                                    </div>

                                    {/* CONTEXT MENU */}
                                    {showMenu && isHost && !isSpectator && (
                                        <div
                                            ref={menuRef as React.RefObject<HTMLDivElement>}
                                            className="absolute left-16 top-1/2 -translate-y-1/2 flex gap-1 bg-white border rounded shadow-lg p-1 z-10"
                                        >
                                            <Button
                                                size="xs"
                                                onClick={() =>
                                                    onMenuAction('select', rowIndex, colIndex)
                                                }
                                            >
                                                SELECT
                                            </Button>
                                            {['red', 'green', 'blue', 'orange'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`w-6 h-6 rounded bg-${color}-500`}
                                                    onClick={() =>
                                                        onMenuAction(
                                                            color as any,
                                                            rowIndex,
                                                            colIndex
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* MODALS */}
            {(showModal && (buzzedPlayer || staredPlayer)) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
                        <h2 className="font-semibold mb-4">
                            {buzzedPlayer
                                ? `${buzzedPlayer} đã nhấn chuông`
                                : `${staredPlayer} đã chọn ngôi sao`}
                        </h2>
                        <Button onClick={onCloseModal}>Đóng</Button>
                    </div>
                </div>
            )}


            {showMediaModal && currentQuestion?.imgUrl && (
                <MediaModal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)}>
                    {renderMediaContent()}
                </MediaModal>
            )}
        </>
    );
};

export default GameGridRound4;
