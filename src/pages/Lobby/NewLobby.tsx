import { useEffect, useState } from "react";
import {
    Users,
    Sparkles,
    Crown,
    User,
    Clock,
    Wifi,
    Copy,
    CheckCircle,
    LogOut,
    Play,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { setCurrentPlayer } from "../../app/store/slices/gameSlice";
import { useFirebaseListener } from "../../shared/hooks";
import useGameApi from "../../shared/hooks/api/useGameApi";
import { useNavigate } from "react-router-dom";




interface LobbyRoomProps {
    isHost?: boolean;
}

const LobbyRoom = ({ isHost = false }: LobbyRoomProps) => {
    const [roomCode] = useState("ABC123");
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [phase, setPhase] = useState<string>("")
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "1";
    const testName = searchParams.get("testName") || ""
    const multiplayerScoringMode = searchParams.get("playMode") || "manual"
    const { multiplayerStart } = useGameApi()
    const navigate = useNavigate()

    useEffect(() => {
        if (isHost) return
        const unsubscribe = listenToCountDownStarted(
            (data) => {
                if (countdown !== null && countdown > 0) {
                    const timer = setTimeout(() => {
                        setCountdown(countdown - 1);
                    }, 1000);
                    return () => clearTimeout(timer);
                } else if (countdown === 0) {
                    // Countdown finished, go to next question
                    //   setCurrentQuestion(prev => prev + 1);
                    //   setShowAnswer(false);
                    //   setSelectedAnswer(null);
                    setCountdown(null);
                    navigate(`/play?roomId=${roomId}&testName=${testName}&roomMode=multiplayer&playMode=${multiplayerScoringMode}`);
                }
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    useEffect(() => {
        const unsubscribe = listenToMultiplayerGameState((data) => {
            if (data && data.phase === "COUNTDOWN") {
                console.log("state data", data)
                setCountdown(3);
            }
        })

        return () => {
            unsubscribe();
        };
    }, [])

    // Countdown effect
    useEffect(() => {

        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            // Countdown finished, go to next question
            //   setCurrentQuestion(prev => prev + 1);
            //   setShowAnswer(false);
            //   setSelectedAnswer(null);
            setCountdown(null);
            if (isHost) {
                navigate(`/host?roomId=${roomId}&testName=${testName}&roomMode=multiplayer&playMode=${multiplayerScoringMode}`);
            }

            if (!isHost) {
                navigate(`/play?roomId=${roomId}&testName=${testName}&roomMode=multiplayer&playMode=${multiplayerScoringMode}`);
            }
        }
    }, [countdown]);

    const handleNextQuestion = async () => {
        await multiplayerStart(roomId, testName, multiplayerScoringMode)
    };




    const dispatch = useAppDispatch();

    const {
        listenToNewPlayer,
        setupDisconnect,
        startWatchingPendingRemovals,
        connectOnRejoin,
        listenToCountDownStarted,
        listenToMultiplayerGameState
    } = useFirebaseListener();

    const { currentPlayer, players } = useAppSelector(
        (state) => state.game
    );

    //   const onlinePlayers = players.filter(
    //     (p) => p.status === "active"
    //   );

    /* =======================
       Restore cached player
    ======================== */
    useEffect(() => {
        if (isHost || currentPlayer) return;

        try {
            const cached = localStorage.getItem("currentPlayer");
            if (!cached) return;

            const parsed = JSON.parse(cached);
            if (parsed?.uid) {
                dispatch(setCurrentPlayer(parsed));
                console.log("✅ Restored cached player", parsed);
            }
        } catch {
            localStorage.removeItem("currentPlayer");
        }
    }, [isHost]);



    /* =======================
       Handle disconnect
    ======================== */
    useEffect(() => {
        if (isHost || !roomId) return;

        const uid = currentPlayer?.uid;
        if (!uid) return;

        setupDisconnect(roomId, uid);
    }, [roomId, currentPlayer]);

    /* =======================
       Listen new player (rejoin)
    ======================== */
    useEffect(() => {
        const unsubscribe = listenToNewPlayer(async () => {
            if (isHost) return;

            const uid = currentPlayer?.uid;
            if (!uid) return;

            await connectOnRejoin(roomId, uid);
            console.log("🔄 Player rejoined");
        });

        return () => unsubscribe();
    }, [currentPlayer, isHost]);

    /* =======================
       Host: watch removals
    ======================== */
    useEffect(() => {
        if (!isHost) return;

        startWatchingPendingRemovals(roomId);
    }, [isHost, roomId]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-screen bg-slate-800/60 relative flex flex-col overflow-hidden">
            {/* Background */}
            <div className="absolute bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>

            {/* Animated ocean background */}
            {/* <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1708864163871-311332fb9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHVuZGVyd2F0ZXIlMjBibHVlfGVufDF8fHx8MTc2NjQ4OTMzMnww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center" />
            </div> */}

            {/* Floating bubbles animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            {/* <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
            </div> */}

            {/* Header */}
            <header className="relative z-20  from-cyan-900 via-blue-900 to-blue-950 border-b border-cyan-700/50">
                      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                            <img src="/images/magellan-logo.png" className="w-8 h-8 text-slate-900" ></img>
                        </div>
                          <div>
                            <h1 className="text-2xl font-bold text-white">Hành Trình Magellan</h1>
                            <p className="text-sm text-cyan-200">
                              Khám phá tri thức vượt đại dương
                            </p>
                          </div>
                        </div>
            
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 text-white">
                          <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 border border-white/20"
                        >
                            <span className="text-white/60 text-sm">Mã phòng:</span>
                            <span className="font-mono font-bold text-cyan-400 text-lg">
                                {roomId}
                            </span>
                            {copied ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-white/60" />
                            )}
                        </button>
                            <Users className="w-6 h-6" />
                            <span className="text-lg font-semibold">{players.length}</span>
                          </div>
                        </div>
                      </div>
                    </header>

            {/* Status */}
            <div className="px-6 py-3 flex justify-center  border-b border-white/5">
                <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Đang chờ bắt đầu...</span>
                </div>
            </div>

            {/* Main */}
            <main className="p-6 max-w-5xl mx-auto space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">
                        Phòng chờ thi
                    </h2>
                    <p className="text-white/60">
                        {players.length} người chơi đã tham gia
                    </p>
                </div>

                {/* Players */}
                <div className="rounded-2xl border border-white/10 bg-slate-800/50">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between">
                        <h3 className="text-white font-medium flex gap-2">
                            <Users className="w-5 h-5 text-cyan-400" />
                            Danh sách thí sinh
                        </h3>
                        <span className="text-white/50 text-sm">
                            {players.length} thí sinh
                        </span>
                    </div>

                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {players.map((player) => {
                            //   const isOnline = player.status === "active";
                            const isMe = currentPlayer?.uid === player.uid;

                            return (
                                <div
                                    key={player.uid}
                                    className={`rounded-xl p-4 flex items-center gap-3 border transition-all
                    ${isMe
                                            ? "border-cyan-400 bg-cyan-500/10"
                                            : "border-white/10 bg-slate-700/50"
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600">
                                            {player.avatar ? (
                                                <img
                                                    src={player.avatar}
                                                    alt={player.userName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-white/60 m-auto" />
                                            )}
                                        </div>
                                        <div
                                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-700 bg-emerald-500`}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {player.userName}
                                            {isMe && " (Bạn)"}
                                        </p>
                                        {/* <p
                      className={`text-xs text-emerald-400`}
                    >
                      {isOnline ? "Đã sẵn sàng" : "Offline"}
                    </p> */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Host / Waiting */}
                {isHost ? (
                    <div className="rounded-2xl border border-cyan-500/30 bg-slate-800/80 p-6 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <Crown className="w-8 h-8 text-cyan-400" />
                            <div>
                                <h3 className="text-white font-bold">
                                    Bạn là Chủ phòng
                                </h3>
                                <p className="text-white/60 text-sm">
                                    Bắt đầu khi sẵn sàng
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-4 rounded-xl bg-emerald-600 text-white font-bold flex gap-3"
                        >
                            <Play />
                            Bắt đầu thi
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-800/50 p-8 text-center">
                        <Wifi className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                        <h3 className="text-white font-bold mt-3">
                            Đang chờ chủ phòng
                        </h3>
                    </div>
                )}

                {/* Leave */}
                <div className="flex justify-center">
                    <button className="flex gap-2 px-6 py-3 rounded-xl border border-rose-500/30 bg-rose-600/20 text-rose-400">
                        <LogOut />
                        Rời phòng
                    </button>
                </div>
            </main>

            {countdown !== null && (
                <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center">
                        <div
                            key={countdown}
                            className="relative animate-[countdownPulse_1s_ease-out]"
                        >
                            {countdown > 0 ? (
                                <>
                                    <div className="text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-cyan-600 leading-none drop-shadow-2xl">
                                        {countdown}
                                    </div>
                                    <div className="absolute inset-0 text-[200px] font-black text-cyan-500/20 blur-3xl leading-none">
                                        {countdown}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                        BẮT ĐẦU!
                                    </div>
                                    <div className="absolute inset-0 text-6xl font-bold text-emerald-500/30 blur-2xl">
                                        BẮT ĐẦU!
                                    </div>
                                </>
                            )}
                        </div>
                        <p className="mt-8 text-white/60 text-lg">
                            {countdown > 0 ? "Chuẩn bị câu hỏi tiếp theo..." : ""}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LobbyRoom;
