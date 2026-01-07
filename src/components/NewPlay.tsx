import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import Header from './ui/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RulesModal from './ui/Modal/RulesModal';
import { useFirebaseListener } from '../shared/hooks';
import { useTimeStart } from '../context/timeListenerContext';
import {
    EyeIcon,
} from "@heroicons/react/24/solid";
import '../index.css';
import { useAppDispatch, useAppSelector } from '../app/store';
import { setCurrentCorrectAnswer, clearPlayerAnswerList, setCurrentPlayer, setCurrentRound, setCurrentQuestionNumber } from '../app/store/slices/gameSlice';
import { useSounds } from '../context/soundContext';
import { setIsPausedButtonDisabled } from '../app/store/slices/gameSlice';
import { nextQuestion } from '../app/store/slices/gameSlice';

interface PlayProps {
    questionComponent: React.ReactNode;
    PlayerScore?: React.ReactNode;
    PlayerAnswers?: React.ReactNode;
    HostManagement?: React.ReactNode;
    isHost?: boolean;
    isSpectator?: boolean
}

const Play: React.FC<PlayProps> = ({
    questionComponent,
    PlayerScore,
    PlayerAnswers,
    HostManagement,
    isHost = false,
    isSpectator
}) => {
    /* =========================
       PLAYER / SPECTATOR VIEW
       ========================= */

    const roundTabs = [
        { key: "1", label: "NHỔ NEO" },
        { key: "2", label: "VƯỢT SÓNG" },
        { key: "3", label: "BỨT PHÁ" },
        { key: "4", label: "CHINH PHỤC" },
        { key: "summary", label: "Tổng kết điểm" },
        { key: "turn", label: "Phân lượt" },
    ];

    const roundTime = {
        "1": 15,
        "2": 15,
        "3": 60,
        "4": 15,
        "turn": 10,
    }

    const sounds = useSounds();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [spectatorCount, setSpectatorCount] = useState<number>(0)
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [rulesRound, setRulesRound] = useState("1");
    const [userId, setUserId] = useState(localStorage.getItem("userId"))
    const [params] = useSearchParams()
    const round = (params.get("round") as "1" | "2" | "3" | "4" | "turn") || "1"

    const { timeLeft, startTimer } = useTimeStart();
    const [roomRules, setRoomRules] = useState(null)


    const [searchParams] = useSearchParams();


    const currentRound = searchParams.get("round") || "1";
    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "";
    const roomMode = searchParams.get("roomMode") || "room"
    const playMode = searchParams.get("playMode") || "manual"

    const {
        listenToCurrentQuestion,
        listenToCorrectAnswer,
        listenToNewPlayer,
        listenToSpectatorJoin,
        setupDisconnect,
        removeSpectator,
        listenToSound,
        listenToRules,
        startWatchingPendingRemovals,
        connectOnRejoin,
        deletePath
    } = useFirebaseListener();
    const dispatch = useAppDispatch();
    const { mode, scoreRules, currentPlayer, currentQuestionNumber } = useAppSelector(state => state.game)
    const currentQuestionNumberRef = useRef(currentQuestionNumber)
    const { spectatorsCount } = useAppSelector(state => state.room)
    const isInitialMount = useRef(true);
    const styles = `
       @keyframes shrink {
         from {
           width: 100%;
         }
         to {
           width: 0%;
         }
       }
     `;
    useEffect(() => {
        if (!isHost) return

        const startWatchingRemovals = async () => {
            console.log("start watching player removal")
            await startWatchingPendingRemovals(roomId)
        }

        startWatchingRemovals()

        return () => {

        }
    }, [])

    // useEffect(() => {
    //     if (isHost || isSpectator) return
    //     const uid = JSON.parse(localStorage.getItem("currentPlayer") || "").uid
    //     console.log("store uid", uid)

    //     if (!uid) return
    //     const rejoin = async () => {
    //         console.log(" player join!")
    //         await connectOnRejoin(roomId, uid)
    //     }

    //     rejoin()

    //     return () => {

    //     }
    // }, [])

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = ""; // cần gán returnValue để trình duyệt hiện cảnh báo
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        if (!isSpectator) return;
        const spectatorPath = localStorage.getItem('spectatorPath') || "";
        removeSpectator(spectatorPath);

        return () => {

        };
    }, [])

    useEffect(() => {

        dispatch(setCurrentRound(currentRound))
    }, [currentRound])

    useEffect(() => {
        // Only run once on component mount, not when currentPlayer changes
        if (!currentPlayer && !isHost) {
            try {
                const cachedPlayerString = localStorage.getItem("currentPlayer");
                if (cachedPlayerString && cachedPlayerString !== "null" && cachedPlayerString !== "undefined") {
                    const cachedPlayer = JSON.parse(cachedPlayerString);
                    if (cachedPlayer && typeof cachedPlayer === 'object' && cachedPlayer.uid) {
                        console.log("✅ Restored cached player:", cachedPlayer);
                        dispatch(setCurrentPlayer(cachedPlayer));
                    } else {
                        console.warn("⚠️ Invalid cached player data, clearing localStorage");
                        localStorage.removeItem("currentPlayer");
                    }
                }
            } catch (error) {
                console.error("❌ Error parsing cached player:", error);
                localStorage.removeItem("currentPlayer");
            }
        }
    }, [isHost]) // Only depend on isHost, not currentPlayer

    useEffect(() => {
        console.log("start listening", roomId);
        const unsubscribePlayers = listenToNewPlayer((

        ) => {
            if (isHost || isSpectator) return
            const uid = JSON.parse(localStorage.getItem("currentPlayer") || "").uid
            console.log("store uid", uid)

            if (!uid) return
            const rejoin = async () => {
                console.log(" player join!")
                await connectOnRejoin(roomId, uid)
            }

            rejoin()

            return () => {

            }
        })

        return () => {
            unsubscribePlayers()
        }
    }, [])

    useEffect(() => {
        const unsubscribeQuestion = listenToCurrentQuestion(() => {
            if (!isHost) {
                dispatch(setCurrentCorrectAnswer(""))
            }

            if (roomMode === "multiplayer" && playMode === "auto" && isHost) {
                console.log("setting current question number")
                console.log("currentQuestionNumberRef.current", currentQuestionNumberRef.current)
                dispatch(nextQuestion())
            }
            dispatch(setIsPausedButtonDisabled(true))
            dispatch(clearPlayerAnswerList())
        })

        return () => {
            unsubscribeQuestion()
        }
    }, [])

    useEffect(() => {
        const unsubscribeSound = listenToSound(

            (type) => {
                const audio = sounds[`${type}`];
                if (audio) {
                    audio.play();
                }
                deletePath("sound")
            }
        );

        return () => {
            unsubscribeSound();
        };
    }, []);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;
        const unsubscribeAnswer = listenToCorrectAnswer(
            () => {
                const audio = sounds['correct'];
                if (audio && roomMode !== "multiplayer") {
                    audio.play();
                }

                dispatch(setIsPausedButtonDisabled(false))

                if (currentRound === "3" && !isHost) {
                    timeout = setTimeout(() => {
                        dispatch(setCurrentCorrectAnswer(""))
                    }, 2000)
                }
            }
        );

        return () => {
            unsubscribeAnswer();
            if (timeout) {
                clearTimeout(timeout)
            }
        };
    }, []);


    useEffect(() => {
        if (!roomId || isHost) return;
        const uid = JSON.parse(localStorage.getItem("currentPlayer") || "").uid
        console.log("store uid", uid)

        if (!uid) return

        setupDisconnect(roomId, uid);

        return () => {

        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribeSpectator = listenToSpectatorJoin()

        return () => {
            unsubscribeSpectator()
        }
    }, [])

    useEffect(() => {
        const unsubscribeRules = listenToRules((data: any) => {
            console.log("Rules data received:", data);
            setRoomRules(data)

            // Show modal when host triggers it, regardless of round matching
            if (data && data.show) {
                setRulesRound(data.round);
                setShowRulesModal(true);
            } else {
                setShowRulesModal(false);
            }
        })

        return () => {
            unsubscribeRules()
        }
    }, [roomId, listenToRules])
    if (!isHost) {
        return (
            <div className="flex flex-1 p-4 gap-4">
                {/* LEFT: Question */}
                <div className="w-full lg:w-3/4">
                    <div className="h-full bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6">
                        {questionComponent}
                    </div>
                </div>

                {/* RIGHT: Score + Answers */}
                <div className="hidden lg:flex lg:w-1/4 flex-col gap-4">
                    {PlayerScore && (
                        <div className="bg-slate-800/70 rounded-2xl border border-blue-400/30 shadow-xl p-3">
                            {PlayerScore}
                        </div>
                    )}

                    <div className="flex-1">{PlayerAnswers}</div>
                </div>
            </div>
        );
    }

    /* =========================
       HOST VIEW (HORIZONTAL)
       ========================= */
    return (
        <div className="flex flex-1 p-4 gap-4">
            {/* LEFT: Question */}
            <div className="w-1/2">
                <div className="h-full bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6">
                    {questionComponent}
                </div>
            </div>

            {/* MIDDLE: HOST CONTROL */}
            <div className="w-1/4 flex items-center">
                <div className="w-full bg-gradient-to-br from-cyan-800/40 to-blue-900/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-2xl p-4">
                    {HostManagement}
                </div>
            </div>

            {/* RIGHT: SCORE + ANSWERS */}
            <div className="w-1/4 flex flex-col gap-4">
                {PlayerScore && (
                    <div className="bg-slate-800/70 rounded-2xl border border-blue-400/30 shadow-xl p-3">
                        {PlayerScore}
                    </div>
                )}

                <div className="flex-1">{PlayerAnswers}</div>
            </div>
        </div>
    );
};

export default Play;
