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
import { setCurrentCorrectAnswer, clearPlayerAnswerList, setCurrentPlayer, setCurrentRound } from '../app/store/slices/gameSlice';
import { useSounds } from '../context/soundContext';


interface PlayProps {
    questionComponent: ReactNode;
    isHost?: boolean;
    isSpectator?: boolean;
    PlayerScore: ReactNode
    SideBar: ReactNode
}

interface Player {
    score: number;
    index: number;
    username: string;
    position: number;
}

const Play: React.FC<PlayProps> = ({ questionComponent, isHost = false, PlayerScore, SideBar, isSpectator = false }) => {


    const roundTabs = [
        { key: "1", label: "NHỔ NEO" },
        { key: "2", label: "VƯỢT SÓNG" },
        { key: "3", label: "BỨT PHÁ" },
        { key: "4", label: "CHINH PHỤC" },
        { key: "summary", label: "Tổng kết điểm" },
        { key: "turn", label: "Phân lượt" },
    ];

    const roundTime = {
        "1": 10,
        "2": 15,
        "3": 60,
        "4": 15,
        "turn": 10,
    }

    const navigate = useNavigate()
    const playerAnswerRef = useRef("");
    const sounds = useSounds();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [spectatorCount, setSpectatorCount] = useState<number>(0)
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [rulesRound, setRulesRound] = useState("1");
    const [userId, setUserId] = useState(localStorage.getItem("userId"))
    const [params] = useSearchParams()
    const round = (params.get("round") as "1" | "2" | "3" | "4" | "turn") || "1"
    // const { playerScores, setPlayerScores, animationKey, setAnimationKey, mode, rules } = useHost()
    const isMounted = useRef(false);
    const { timeLeft, startTimer } = useTimeStart();
    const [roomRules, setRoomRules] = useState(null)


    const [searchParams] = useSearchParams();


    const currentRound = searchParams.get("round") || "1";
    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "";

    const {
        listenToCurrentQuestion,
        listenToCorrectAnswer,
        listenToNewPlayer,
        listenToSpectatorJoin,
        setupDisconnect,
        removeSpectator,
        listenToSound,
        listenToRules,
        deletePath
    } = useFirebaseListener();
    const dispatch = useAppDispatch();
    const { mode, scoreRules, currentPlayer } = useAppSelector(state => state.game)
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
        const unsubscribePlayers = listenToNewPlayer(() => {
            console.log("start listening inside", roomId);
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
                if (audio) {
                    audio.play();
                }

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
        if (!roomId || isHost ) return;
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
        <div className="relative "
            style={{ zoom: "0.75" }}
        >
            {/* Ocean/Starry Night Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
                {/* Stars overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
                {/* Ocean waves effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
                {/* Subtle animated waves */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col min-h-full">
                <Header isHost={isHost} spectatorCount={spectatorsCount} />

                <div className="flex flex-1 p-4 gap-4">
                    <div className="w-full lg:w-4/5 flex flex-col">
                        {/* Progress bar with ocean theme */}
                        <div className="w-full h-3 bg-slate-700/50 rounded-full mb-4 border border-blue-400/30 shadow-lg">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full shadow-inner"
                                style={{
                                    width: timeLeft > 0 ? '100%' : '100%', // Always reset to 100% width
                                    animation: timeLeft > 0 ? `shrink ${roundTime[round]}s linear forwards` : 'none',
                                    animationPlayState: timeLeft > 0 ? 'running' : 'paused',
                                }}
                            // key={animationKey} // Restart animation on round change
                            ></div>
                        </div>

                        {/* Question component with ocean-themed styling */}
                        <div className={`bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4  ${isHost ? "min-h-[400px]" : "min-h-[400px]"}`}>
                            {questionComponent}
                        </div>

                        {/* Player score with ocean theme */}
                        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-xl">
                            {PlayerScore}
                        </div>
                    </div>

                    <div className="hidden lg:flex lg:w-1/5 flex-col gap-4">
                        {/* Round indicator with nautical theme */}
                        {!isHost && (
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-bold text-lg p-4 rounded-xl shadow-xl border border-blue-400/50">
                                <div className="text-sm opacity-90 mb-1">Vòng</div>
                                <div className="text-xl">
                                    {roundTabs.find(tab => tab.key === currentRound)?.label || ""}
                                </div>
                            </div>
                        )}
                        {/* Sidebar with ocean theme */}
                        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-xl p-4 flex-1">
                            {SideBar}
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <img
                            src="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg"
                            alt="Full Size"
                            className="max-w-full max-h-full rounded-xl shadow-2xl"
                        />
                    </div>
                )}
            </div>

            {/* Rules Modal */}
            <RulesModal
                isOpen={showRulesModal}
                onClose={() => {
                    setShowRulesModal(false);
                }}
                round={rulesRound}
                mode={mode}
                roomRules={scoreRules}
            />


        </div>
    );
};



export default Play;
