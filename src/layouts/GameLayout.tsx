import { Pause, Timer, Waves } from "lucide-react";
import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import Header from "../components/ui/Header";
import { useNavigate, useSearchParams } from 'react-router-dom';
import RulesModal from "../components/ui/Modal/RulesModal";
import { useFirebaseListener } from '../shared/hooks';
import { useTimeStart } from '../context/timeListenerContext';
import {
    EyeIcon,
} from "@heroicons/react/24/solid";
import '../index.css';
import { useAppDispatch, useAppSelector } from '../app/store';
import { setCurrentCorrectAnswer, clearPlayerAnswerList, setCurrentPlayer, setCurrentRound, setCurrentQuestionNumber, setScoresRanking } from '../app/store/slices/gameSlice';
import { useSounds } from '../context/soundContext';
import { setIsPausedButtonDisabled } from '../app/store/slices/gameSlice';
import { nextQuestion } from '../app/store/slices/gameSlice';
import { MultiplayerGameState } from "../shared/types";
import HostControlPanel from "../components/HostControlPanel";
import { toast } from "react-toastify";
import useGameApi from "../shared/hooks/api/useGameApi";
import Leaderboard from "../components/ui/LeaderBoard";
import RoomModePlayerAnswer from "../components/ui/RoomModePlayerAnswer";
import SummaryAfterRound from "../components/ui/SummaryAfterRound";
import { scale } from "framer-motion";


interface PlayProps {
    questionComponent: ReactNode;
    isHost?: boolean;
    isMultiplayerMode?: boolean
    isSpectator?: boolean;
    PlayerScore?: ReactNode
    HostManagement?: ReactNode
}

interface LayoutProps {
    questionComponent: ReactNode;
    isHost: boolean
}

interface Player {
    id: number;
    name: string;
    score: number;
    avatar: string;
    answer?: string;
    timeElapsed?: number;
    isCorrect?: boolean;
}



interface AnswerStats {
    label: string;
    count: number;
}

const GameLayout: React.FC<PlayProps> = ({ questionComponent, isHost = false, PlayerScore, HostManagement, isSpectator = false, isMultiplayerMode = false }) => {

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
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    // const [spectatorCount, setSpectatorCount] = useState<number>(0)
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [rulesRound, setRulesRound] = useState("1");
    const [userId, setUserId] = useState(localStorage.getItem("userId"))
    const [params] = useSearchParams()
    const round = (params.get("round") as "1" | "2" | "3" | "4" | "turn") || "1"

    const { timeLeft } = useTimeStart();
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
        listenToRoundStart,
        connectOnRejoin,
        deletePath,
        listenToMultiplayerGameState,
        listenToPlayerAnswerList,
    } = useFirebaseListener();

    const { startTimer, hideRules } = useGameApi()
    const dispatch = useAppDispatch();
    const { mode, scoreRules, currentPlayer, currentQuestionNumber } = useAppSelector(state => state.game)
    const currentQuestionNumberRef = useRef(currentQuestionNumber)
    const { spectatorsCount } = useAppSelector(state => state.room)
    const [currentState, setCurrentState] = useState<MultiplayerGameState>()
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardTimer, setLeaderboardTimer] = useState(0);
    const [isShowingSummary, setIsShowingSummary] = useState<boolean>(false)
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

    const totalTime = 15
    console.log("total Time")


    const rounds = ["NHỔ NEO", "VƯỢT SÓNG", "BỨT PHÁ", "CHINH PHỤC"];

    const handleShowLeaderboardTimed = () => {
        console.log("showing leaderboard")
        const audio = sounds["leaderboard"];
        if (audio) {
            audio.play();
        }
        deletePath("sound")
        setShowLeaderboard(true);
    };


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
    }, [])

    useEffect(() => {
        const unsubscribePlayers = listenToRoundStart(
            (round) => {
                console.log("round", round)
                if (round === "summary") {
                    setIsShowingSummary(true)
                    return
                }

                setIsShowingSummary(false)

                if (isSpectator) {
                    navigate(`/spectator?round=${round}&roomId=${roomId}`, { replace: true });
                    return
                }

                console.log("isHost", isHost)

                if (!isHost) {
                    navigate(`/play?round=${round}&roomId=${roomId}`, { replace: true });
                }
            }
        )

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {
        const unsubscribe = listenToMultiplayerGameState((data) => {

            const handleStateListener = async () => {
                setCurrentState(data)



                if (data && data.phase === "LEADERBOARD") {
                    console.log("state data", data)
                    handleShowLeaderboardTimed()
                }

                if (data && data.phase !== "LEADERBOARD") {
                    console.log("state data", data)
                    setShowLeaderboard(false)
                }
            }

            handleStateListener()
        })

        return () => {
            unsubscribe();
        };
    }, [])

    useEffect(() => {
        const unsubscribePlayerAnswerList = listenToPlayerAnswerList((scores) => {
            console.log("scores list", scores)
            if (!scores) return

            const mappedScores = Object.values(scores).map((raw: any) => ({
                ...raw,
                isCorrect: raw.is_correct,
                answers: Array.isArray(raw.answers) ? raw.answers : []
            }));

            console.log("mappedScores", mappedScores);
            dispatch(setScoresRanking(mappedScores))
        });
        return () => {
            unsubscribePlayerAnswerList();
        };
    }, [])

    const formatSeconds = (seconds: number) =>
        Math.max(0, Math.ceil(seconds));

    const progress =
        timeLeft !== null && totalTime > 0
            ? (timeLeft / totalTime) * 100
            : 0

    console.log("progress", progress)

    const handleStartTimer = async () => {
        try {
            await startTimer(roomId);

            toast.success('Đã bắt đầu đếm thời gian!', {
                position: 'top-right',
                autoClose: 2000,
            });
        } catch (e) {
            toast.error('Lỗi khi bắt đầu đếm thời gian', {
                position: 'top-right',
                autoClose: 2000,
            });
            console.log("error starting time", e)
        }
    }
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
                if (audio && roomMode !== "multiplayer" && currentRound !== "3") {
                    audio.play();
                }

                dispatch(setIsPausedButtonDisabled(false))

                if (currentRound === "3" && !isHost) {
                    timeout = setTimeout(() => {
                        dispatch(setCurrentCorrectAnswer(""))
                    }, 2500)
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


    return (
        <>
            {/* Layer 1: Background cố định, luôn full màn hình */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900 via-blue-900 to-blue-950" />

                {/* Hình ảnh đại dương */}
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1708864163871-311332fb9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHVuZGVyd2F0ZXIlMjBibHVlfGVufDF8fHx8MTc2NjQ4OTMzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')"
                        }}
                    />
                </div>

                {/* Bong bóng nổi */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white opacity-20 animate-float"
                            style={{
                                width: `${Math.random() * 30 + 10}px`,
                                height: `${Math.random() * 30 + 10}px`,
                                left: `${Math.random() * 100}%`,
                                bottom: `-50px`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${Math.random() * 10 + 10}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Layer 2: Nội dung chính, có thể scroll nếu cần */}
            <div className="relative z-10 min-h-screen flex flex-col"
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
            >
                {/* Header */}
                <Header isHost={isHost} isMultiplayer={isMultiplayerMode} spectatorCount={spectatorsCount} />

                {/* Main Content */}
                <div className="container mx-auto px-4 py-4 flex-1"
                    style={{
                        zoom: isMultiplayerMode ? 0.87 : 0.95
                    }}
                >
                    <div className="grid grid-cols-12 gap-4 h-full">
                        {/* Question */}
                        <div className={`
    ${isHost ? "col-span-6" : isMultiplayerMode ? "col-span-12" : "col-span-7"}
    flex min-h-[90vh]
  `}>
                            {questionComponent}
                        </div>

                        {/* Host controls */}
                        {isHost && (
                            <div className="col-span-3 flex flex-col gap-4">
                                {HostManagement}
                            </div>
                        )}

                        {/* Leaderboard / PlayerScore */}
                        <div className={isHost ? "col-span-3" : "col-span-5"}>
                            {PlayerScore}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard overlay */}
            {showLeaderboard && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-start justify-center p-8">
                    <div className="w-full max-w-md animate-scale-in mt-8">
                        {
                            isMultiplayerMode && (
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-white font-bold text-lg">Bảng Xếp Hạng</h3>
                                </div>
                            )
                        }
                        <RoomModePlayerAnswer isHost={isHost} isMultiplayer={isMultiplayerMode} />
                    </div>
                </div>
            )}

            {isShowingSummary && (
                <div className="fixed inset-0 z-[999]">
                    <SummaryAfterRound
                        isHost={isHost}
                        isSpectator={isSpectator}
                    />
                </div>
            )}

            {/* CSS cho animation float */}
            {/* <style>{`
            @keyframes float {
                0% {
                    transform: translateY(100vh) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 0.2;
                }
                90% {
                    opacity: 0.2;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
                    opacity: 0;
                }
            }
            .animate-float {
                animation: float linear infinite;
            }
        `}</style> */}

            <RulesModal
                isOpen={showRulesModal}
                isHost={isHost}
                onClose={async () => {
                    if (isHost) {
                        await hideRules(roomId);
                        setShowRulesModal(false);
                    }

                }}
                round={rulesRound}
                // mode={mode}
                roomRules={scoreRules}
            />
        </>
    );
}

export default GameLayout