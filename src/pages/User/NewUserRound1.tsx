import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users, Clock, Play, SkipForward, Eye, EyeOff, Volume2,
  BookOpen, Award, ChevronRight, Sparkles, Timer, CheckCircle,
  RotateCcw, Pause, ExternalLink, Trophy,
  Music, VolumeX
} from "lucide-react";
import Leaderboard from "../../components/ui/LeaderBoard";
import { getQuestions, setSelectedChoice, setCurrentCorrectAnswer, setAnswersCount, setScoresRanking, setCurrentPlayer } from "../../app/store/slices/gameSlice";
import { useAppDispatch } from "../../app/store";
import { useFirebaseListener } from "../../shared/hooks";
import { useAppSelector } from "../../app/store";
import { MultiplayerGameState } from "../../shared/types";
import MultipleChoiceQuestionBox from "../../components/MultipleChoice/MultipleChoiceQuestionBox";
import useGameApi from "../../shared/hooks/api/useGameApi";

import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom";
import { useTimeStart } from "../../context/timeListenerContext";
import { useSounds } from "../../context/soundContext";
import BaseQuestionBoxRound1 from "../../components/Round1/BaseQuestionBoxRound1";

interface Player {
  id: number;
  name: string;
  score: number;
  avatar?: string;
  answerHistory?: ("correct" | "wrong" | "pending")[];
}

interface AnswerOption {
  label: string;
  text: string;
  isCorrect?: boolean;
}

interface NewHostMultipleChoiceProps {
  isHost: boolean
}

interface AnswerStats {
  label: string;
  count: number;
}


const NewHostMultipleChoice: React.FC<NewHostMultipleChoiceProps> = ({ isHost }) => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || ""
  const testName = searchParams.get("testName") || ""
  const playMode = searchParams.get("playMode") || ""


  const [now, setNow] = useState(Date.now())

  const [currentRound] = useState("NHỔ NEO");

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showStudentAnswer, setShowStudentAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTimer, setLeaderboardTimer] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentState, setCurrentState] = useState<MultiplayerGameState>()
  const [choices, setChoices] = useState<
    { position: string; content: string }[]
  >(["A", "B", "C", "D"].map((position) => ({
    position,
    content: ""
  })));

  const [stats, setStats] = useState<AnswerStats[]>([])
  const [isGameEnded, setIsGameEnded] = useState<boolean>(false)
  const [isMusicPaused, setIsMusicPaused] = useState<boolean>(false)
  const sounds = useSounds()


  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentQuestion, players, currentPlayer, selectedChoice } = useAppSelector(state => state.game)
  const { listenToMultiplayerGameState, listenToCurrentQuestion, listenToCorrectAnswer, listenToPlayerAnswerList, listenToMultiplayerGameEnd, listenToSound, listenToMultiplayerGamePause, deletePath } = useFirebaseListener()
  const { sendCorrectAnswer, startTimer, multiplayerResume, multiplayerPause, getSpecificQuestion, multiplayerSubmit, getNextQuestion, updateGameState, multiplayerEnd } = useGameApi()
  const currentQuestionRef = useRef(currentQuestion)
  const isFirstMouned = useRef(false)
  const { timeLeft } = useTimeStart()

  const roundTime: Record<string, number> = {
    "1": 15,
    "2": 15,
    "3": 60,
    "4": 15,
    "turn": 10,
  };



  const totalTime = 15
  console.log("total Time")


  const rounds = ["NHỔ NEO", "VƯỢT SÓNG", "BỨT PHÁ", "CHINH PHỤC"];

  const formatSeconds = (seconds: number) =>
    Math.max(0, Math.ceil(seconds));

  const handleEndGameClick = async () => {
    try {
      await multiplayerEnd(roomId)
      toast.success('Đã tạm dừng trận đấu!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (e) {
      console.log("error pausing game", e)
      toast.error('Lỗi khi dừng trận đấu!', {
        position: 'top-right',
        autoClose: 2000,
      });
    }
  }

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
    const lobbyMusic = sounds["lobby_game"];
    if (lobbyMusic) {
      console.log("lobbyMusic", lobbyMusic)
      if (lobbyMusic.paused) {
        console.log("play music")
        lobbyMusic.play();
        lobbyMusic.currentTime = 0;
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = listenToMultiplayerGamePause(
      (data) => {
        console.log("pause", data)
        if (!data) return



      }
    )
    return () => {
      unsubscribe();
    };
  }, [])



  // const timeLeft = (() => {
  //   if (!currentState) return null
  //   if (currentState.paused) return null
  //   if (currentState.phase !== "QUESTION") return null

  //   const start = currentState.phaseStartTime// delay 1s
  //   const elapsed = now - start

  //   console.log("start", start)
  //   console.log("now", now)
  //   console.log("elapsed", elapsed)

  //   return Math.max(
  //     0,
  //     currentState.phaseDuration - elapsed
  //   )
  // })()

  const progress =
    timeLeft !== null && totalTime > 0
      ? (timeLeft / totalTime) * 100
      : 0

  console.log("progress", progress)



  const hasSubmittedRef = useRef(false);
  const prevScoresRef = useRef<any>(null)
  useEffect(() => {
    hasSubmittedRef.current = false;
  }, [currentQuestion]);

  useEffect(() => {
    let timeId: NodeJS.Timeout
    const unsubscribe = listenToMultiplayerGameState((data) => {

      const handleStateListener = async () => {
        setCurrentState(data)

        if (data && data.phase === "COUNTDOWN") {
          if (data.currentQuestion === 1 && !isFirstMouned.current) {
            isFirstMouned.current = true;
            return; // skip UI countdown, KHÔNG skip phase flow
          }
          console.log("state data", data)
          setCountdown(3);
        }

        if (data && data.phase === "QUESTION") {
          console.log("state data", data)

          dispatch(setCurrentCorrectAnswer(""))

          if (isHost) {
            await getSpecificQuestion(
              {
                testName: testName,
                roomId: roomId,
                round: "multiplayer",
                questionNumber: data.currentQuestion
              }
            )
          }

          // timeId = setTimeout(async () => {
          //   await startTimer(roomId)
          // }, 1000)
        }

        if (data && data.phase === "SHOW_ANSWER" && isHost) {
          console.log("state data", data)
          await sendCorrectAnswer(roomId);
        }

        // if (data && data.phase === "LEADERBOARD") {
        //   console.log("state data", data)
        //   handleShowLeaderboardTimed()
        // }

        if (data && data.ended) {
          console.log("state data", data)
          setIsGameEnded(true)

          timeId = setTimeout(() => {
            if (isHost) {
              navigate(`/host?round=final&roomId=${roomId}&testName=${testName}`)
            }

            if (!isHost) {
              navigate(`/play?round=final&roomId=${roomId}&testName=${testName}`)
            }
          }, 3000)
        }
      }

      handleStateListener()
    })

    return () => {
      unsubscribe();
      clearTimeout(timeId)
    };
  }, [])


  useEffect(() => {
    let timeId: NodeJS.Timeout
    const unsubscribe = listenToMultiplayerGameEnd(
      (data) => {
        if (!data) return
        setIsGameEnded(true)

        const lobbyMusic = sounds["lobby_game"];
        if (lobbyMusic) {
          console.log("lobbyMusic", lobbyMusic)
          if (!lobbyMusic.paused) {
            console.log("pause music")
            lobbyMusic.pause();
            lobbyMusic.currentTime = 0;
          }
        }

        timeId = setTimeout(() => {
          if (isHost) {
            navigate(`/host?round=final&roomId=${roomId}&testName=${testName}`)
          }

          if (!isHost) {
            navigate(`/play?round=final&roomId=${roomId}&testName=${testName}`)
          }
        }, 3000)

      }
    )
    return () => {
      unsubscribe();
      clearTimeout(timeId)
    };
  }, [])

  useEffect(() => {
    if (!currentState?.phaseId) return

    const id = setInterval(() => {
      setNow(Date.now())
    }, 100)

    return () => clearInterval(id)
  }, [currentState?.phaseId])


  useEffect(() => {
    const unsubscribe = listenToCurrentQuestion(() => {

    })
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = listenToCorrectAnswer(() => {

    })
    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {

  }, [])

  // Auto-show leaderboard for player after question ends (simulate)
  useEffect(() => {
    if (!isHost && showLeaderboard && leaderboardTimer > 0) {
      const timer = setTimeout(() => {
        setLeaderboardTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isHost && showLeaderboard && leaderboardTimer === 0) {
      setShowLeaderboard(false);
    }
  }, [isHost, showLeaderboard, leaderboardTimer]);

  useEffect(() => {
    const unsubscribePlayerAnswerList = listenToPlayerAnswerList((scores) => {
      console.log("scores list", scores)
      if (!scores) return
      if (JSON.stringify(scores) === JSON.stringify(prevScoresRef.current)) {
        return
      }

      prevScoresRef.current = scores
      const mappedScores = Object.values(scores).map((raw: any) => ({
        ...raw,
        isCorrect: raw.is_correct,
        answers: Array.isArray(raw.answers) ? raw.answers : []
      }));

      console.log("mappedScores", mappedScores)

      const answersCount = Object.values(scores).map((item: any) => item.answer)

      const stats: AnswerStats[] = ["A", "B", "C", "D"].map(label => ({
        label,
        count: answersCount.filter(a => a === label).length
      }));
      if (isHost) {
        dispatch(setAnswersCount(answersCount))
        setStats(stats)
      }
      console.log("mappedScores", mappedScores);
      dispatch(setScoresRanking(mappedScores))
    });
    return () => {
      unsubscribePlayerAnswerList();
    };
  }, [])

  const prevPhaseRef = useRef<string | null>(null);
  useEffect(() => {
    dispatch(setCurrentPlayer({
      answer: "",
    }))

    if (currentState?.paused) {
      const lobbyMusic = sounds["lobby_game"];
      if (lobbyMusic) {
        console.log("lobbyMusic", lobbyMusic)
        if (!lobbyMusic.paused) {
          console.log("pause music")
          lobbyMusic.pause();
          lobbyMusic.currentTime = 0;
        }
      }
    }

    if (!currentState?.paused) {
      const lobbyMusic = sounds["lobby_game"];
      if (lobbyMusic) {
        console.log("lobbyMusic", lobbyMusic)
        if (lobbyMusic.paused) {
          console.log("pause music")
          lobbyMusic.play();
          lobbyMusic.currentTime = 0;
        }
      }
    }
    if (currentState?.phase === "QUESTION") {
      hasSubmittedRef.current = false
      console.log("reset submitted ref")
    }

    if (
      currentState?.phase === "LEADERBOARD" &&
      prevPhaseRef.current !== "LEADERBOARD"
    ) {
      handleShowLeaderboardTimed();
    }

    prevPhaseRef.current = currentState?.phase || null;

    const handleTimeEnd = async () => {
      if (isHost) return
      console.log("time left until time end", timeLeft)
      if (currentState?.phase === "SHOW_ANSWER" && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        const submittedAnswer = {
          answer: currentPlayer?.answer || "",
          stt: currentPlayer?.stt || "",
          time: currentPlayer?.time || 0,
          player_name: currentPlayer?.userName || "",
          avatar: currentPlayer?.avatar || ""
        }

        console.log("submitted answer when time end", submittedAnswer)
        if (!selectedChoice) {
          if (submittedAnswer.answer === "") {
            await multiplayerSubmit(roomId, "", submittedAnswer.stt, submittedAnswer.time, submittedAnswer.player_name, submittedAnswer.avatar, testName)
          } else {
            await multiplayerSubmit(roomId, submittedAnswer.answer, submittedAnswer.stt, submittedAnswer.time, submittedAnswer.player_name, submittedAnswer.avatar, testName)
          }
        }
      }
    }

    handleTimeEnd()

  }, [currentState?.phase]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    const unsubscribeAnswer = listenToCorrectAnswer(
      () => {

        // dispatch(setIsPausedButtonDisabled(false))
        timeout = setTimeout(() => {
          dispatch(setCurrentCorrectAnswer(""))
        }, 2000)

      }
    );

    return () => {
      unsubscribeAnswer();
      if (timeout) {
        clearTimeout(timeout)
      }
    };
  }, []);

  const handleSendCorrectAnswer = async () => {
    try {
      await sendCorrectAnswer(roomId);
      toast.success('Đã hiển thị câu trả lời đúng cho người chơi!');
    } catch (error) {
      console.error('Error sending correct answer:', error);
      toast.error('Lỗi khi hiển thị câu trả lời đúng cho người chơi!');
    }
  }

  const handleMusicIconClick = async () => {
    if (isMusicPaused) {
      setIsMusicPaused(false)
    }

    if (!isMusicPaused) {
      setIsMusicPaused(true)
    }
  }

  useEffect(() => {
    const lobbyMusic = sounds["lobby_game"];
    if (lobbyMusic) {
      console.log("lobbyMusic", lobbyMusic)
      if (!lobbyMusic.paused) {
        console.log("pause music")
        lobbyMusic.pause();
        lobbyMusic.currentTime = 0;
      } else {
        console.log("music resume")
        lobbyMusic.play();
        lobbyMusic.currentTime = 0;
      }


    }
  }, [isMusicPaused])


  const handlePauseGame = async () => {
    try {
      await multiplayerPause(roomId)
      toast.success('Đã tạm dừng trận đấu!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (e) {
      console.log("error pausing game", e)
      toast.error('Lỗi khi dừng trận đấu!', {
        position: 'top-right',
        autoClose: 2000,
      });
    }

  }

  const handleResumeGame = async () => {
    try {

      await multiplayerResume(roomId, testName)
      toast.success('Đã tiếp tục trận đấu!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (e) {
      toast.error('Lỗi khi tiếp tục trận đấu!', {
        position: 'top-right',
        autoClose: 2000,
      });
      console.log("error resuming game", e)
    }

  }

  const handleOpenLeaderboardTab = () => {
    const url = `/quiz-mc/leaderboard?role=${isHost ? "host" : "player"}`;
    window.open(url, "_blank");
  };

  const handleShowLeaderboardTimed = () => {
    if (showLeaderboard) return;
    console.log("showing leaderboard")
    setShowLeaderboard(true);
    setLeaderboardTimer(3); // Show for 5 seconds
  };

  const handleNextQuestion = async () => {
    try {
      await getNextQuestion({
        roomId: roomId,
        testName: testName,
        round: "multiplayer"
      })

      toast.success('Đã gửi câu hỏi tiếp theo!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (e) {
      toast.error('Lỗi khi gửi câu hỏi!', {
        position: 'top-right',
        autoClose: 2000,
      });
      console.log("error sending next question", e)
    }
  };

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

  const openLeaderBoard = async () => {
    try {
      await updateGameState(roomId, {
        phase: "LEADERBOARD"
      })

      toast.success('Đã hiển thị bảng xếp hạng!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (e) {
      toast.error('Lỗi khi hiển thị bảng xếp hạng', {
        position: 'top-right',
        autoClose: 2000,
      });
      console.log("error starting time", e)
    }
  }

  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Countdown finished, go to next question

      setShowAnswer(false);
      setSelectedAnswer(null);
      setCountdown(null);
    }
  }, [countdown]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl border-b border-white/10 bg-slate-900/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Hành Trình Magellan</h1>
                <p className="text-xs text-white/60">
                  {isHost ? "Chế độ Host - Trắc nghiệm" : "Chế độ Thí sinh - Trắc nghiệm"}
                </p>
              </div>
            </div>

            {/* Player Count & Score */}
            <div className="flex items-center gap-4">
              {/* {!isHost && (
                
              )} */}

              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <button
                  className="px-4 py-3 rounded-xl bg-slate-600 text-white hover:bg-slate-500 transition-all"
                  onClick={handleMusicIconClick}
                >
                  {
                    isMusicPaused ? (
                      <VolumeX className="w-5 h-5" />
                    )
                      :
                      (
                        <Music className="w-5 h-5" />
                      )
                  }

                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/80">
                <Users className="w-5 h-5" />
                <span className="font-medium">{players.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timer Progress Bar */}
      <div className="relative z-10 px-6 py-3 flex items-center gap-4 bg-slate-800/50 border-b border-white/5">
        {/* <div className="flex-1 h-2 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-500 rounded-full"
            style={{ width: "75%" }}
          />
        </div> */}

        {isHost ? (
          <div className="flex items-center gap-4 w-full">

            {/* Progress + Time */}
            <div className="flex-1">
              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-700/50 rounded-full border border-blue-400/30 shadow-lg overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-50
              ${timeLeft !== null && timeLeft <= 5
                      ? "bg-gradient-to-r from-red-500 to-orange-400 animate-pulse"
                      : "bg-gradient-to-r from-blue-400 to-cyan-300"
                    }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Time text */}
              <div className="mt-1 text-center text-white/70 font-mono text-sm">
                {timeLeft !== null && `${formatSeconds(timeLeft)} s`}

              </div>
            </div>

            {/* Control Button */}
            <button
              onClick={() => {
                setIsTimerRunning(!isTimerRunning)
                handleStartTimer()
              }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${isTimerRunning
                  ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                  : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Timer className="w-4 h-4" />
              )}
              {isTimerRunning ? "Dừng" : "Bắt đầu"}
            </button>
          </div>
        ) : (
          <div className="w-full mb-4">
            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-700/50 rounded-full border border-blue-400/30 shadow-lg overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-50
        ${timeLeft !== null && timeLeft <= 5
                    ? "bg-gradient-to-r from-red-500 to-orange-400 animate-pulse"
                    : "bg-gradient-to-r from-blue-400 to-cyan-300"
                  }`}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* Time text */}
            <div className="mt-1 text-center text-white/70 font-mono text-sm">
              {timeLeft !== null && `${formatSeconds(timeLeft)} s`}

            </div>
          </div>

        )}
      </div>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="grid grid-cols-12 gap-6 max-w-[1800px] mx-auto">

          {/* Main Quiz Area */}
          <div className={`${isHost ? "col-span-6" : "col-span-9"} space-y-6`}>
            {/* Question Card */}
            <BaseQuestionBoxRound1
                isHost={false}
            />

            {/* Player Leaderboard Toggle (for players only) */}
            {!isHost && (
              <div className="flex items-center gap-3">
                <button
                  onClick={openLeaderBoard}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Mở bảng xếp hạng
                </button>
                {/* <button
                  onClick={handleShowLeaderboardTimed}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  Xem nhanh (5s)
                </button> */}
              </div>
            )}
          </div>

          {/* Host Controls & Stats */}
          {isHost && (
            <div className="col-span-3 space-y-4">

              {/* Answer Display Controls */}
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl p-4 space-y-3">
                <h4 className="text-white/70 text-sm font-medium px-2">Hiển thị đáp án</h4>

                <button
                  onClick={openLeaderBoard}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${showStudentAnswer
                    ? "bg-cyan-500 text-slate-900"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                    }`}
                >
                  {showStudentAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showStudentAnswer ? "Ẩn thống kê" : "Hiện thống kê"}
                </button>

                <button
                  onClick={() => {
                    handleSendCorrectAnswer()
                    setShowAnswer(!showAnswer)
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${showAnswer
                    ? "bg-amber-500 text-slate-900"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                    }`}
                >
                  {showAnswer ? <EyeOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {showAnswer ? "Ẩn đáp án" : "Hiện đáp án"}
                </button>
              </div>

              {/* Question Navigation */}
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl p-4 space-y-3">
                <h4 className="text-white/70 text-sm font-medium px-2">Điều hướng</h4>
                {
                  playMode === "auto" ?
                    (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePauseGame}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-500 transition-all"
                          >
                            <SkipForward className="w-4 h-4" />
                            Tạm dừng
                          </button>
                        </div>

                        <button
                          onClick={handleResumeGame}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                          Tiếp tục
                        </button>
                      </>
                    )
                    :
                    (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={"1"}
                            className="w-16 px-3 py-2 rounded-lg bg-slate-700 border border-white/10 text-white text-center text-sm"
                          />
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-500 transition-all">
                            <SkipForward className="w-4 h-4" />
                            Đến câu
                          </button>
                        </div>

                        <button
                          onClick={handleNextQuestion}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                          Câu tiếp theo
                        </button>
                      </>
                    )
                }

              </div>

              {/* Utilities */}
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl p-4 space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-500 transition-all"
                  onClick={handleEndGameClick}
                >
                  <RotateCcw className="w-4 h-4" />
                  Kết thúc trận đấu
                </button>

                {/* <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-500 transition-all">
                  <RotateCcw className="w-4 h-4" />
                  Chấm điểm tự động
                </button>

                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-all">
                  <Award className="w-4 h-4" />
                  Xác nhận điểm
                </button> */}
              </div>
            </div>
          )}

          {/* Leaderboard Sidebar */}
          <div className="col-span-3 space-y-4">
            {/* Round Info */}
            {/* <div className="rounded-2xl border border-cyan-500/30 bg-slate-800/80 backdrop-blur-xl overflow-hidden">
              <div className="bg-cyan-500 px-6 py-4 text-center">
                <p className="text-slate-900/70 text-sm">Vòng</p>
                <h3 className="text-xl font-bold text-slate-900">{currentRound}</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center gap-2">
                  {rounds.map((round, idx) => (
                    <div
                      key={round}
                      className={`w-3 h-3 rounded-full ${round === currentRound ? "bg-cyan-500" : "bg-slate-600"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div> */}

            {/* Leaderboard */}
            {
              isHost && (
                <div className="h-[500px]">
                  <Leaderboard
                    isHost={isHost}
                    currentQuestion={currentState?.currentQuestion || 1}
                    onOpenNewTab={handleOpenLeaderboardTab}
                  />
                </div>
              )
            }

          </div>
        </div>
      </main>

      {/* Timed Leaderboard Overlay for Player */}
      {!isHost && showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="w-full max-w-md animate-scale-in">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Bảng Xếp Hạng</h3>
              <span className="text-white/60 text-sm">Đóng sau {leaderboardTimer}s</span>
            </div>
            <Leaderboard
              isHost={false}
              currentQuestion={currentState?.currentQuestion || 1}
            />
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
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

      {isGameEnded && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center">
            {/* <div
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
            </div> */}
            <p className="mt-8 text-white/60 text-lg">
              {"Trận đấu đã kết thúc!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewHostMultipleChoice;
