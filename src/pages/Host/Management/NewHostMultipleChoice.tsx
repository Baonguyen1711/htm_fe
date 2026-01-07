import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users, Clock, Play, SkipForward, Eye, EyeOff, Volume2,
  BookOpen, Award, ChevronRight, Sparkles, Timer, CheckCircle,
  RotateCcw, Pause, ExternalLink, Trophy,
  Music, VolumeX
} from "lucide-react";
import Leaderboard from "../../../components/ui/LeaderBoard";
import AnswerStatsChart from "../../../components/ui/Host/AnswerStatsChart";
import { getQuestions, setSelectedChoice, setCurrentCorrectAnswer, setAnswersCount, setScoresRanking, setCurrentPlayer } from "../../../app/store/slices/gameSlice";
import { useAppDispatch } from "../../../app/store";
import { useFirebaseListener } from "../../../shared/hooks";
import { useAppSelector } from "../../../app/store";
import { MultiplayerGameState } from "../../../shared/types";
import MultipleChoiceQuestionBox from "../../../components/MultipleChoice/MultipleChoiceQuestionBox";
import useGameApi from "../../../shared/hooks/api/useGameApi";

import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom";
import { useTimeStart } from "../../../context/timeListenerContext";
import { useSounds } from "../../../context/soundContext";
import QuestionTimerBar from "../../../components/ui/QuestionTimeBar";

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
    <div className="h-screen bg-gradient-to-b from-cyan-900 via-blue-900 to-blue-950 relative flex flex-col overflow-hidden">
      {/* Animated ocean background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1708864163871-311332fb9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHVuZGVyd2F0ZXIlMjBibHVlfGVufDF8fHx8MTc2NjQ4OTMzMnww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center" />
      </div>

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

      <div className="relative z-10 flex flex-col h-full overflow-auto">
        {/* Header - giữ nguyên kiểu cũ nếu bạn có component Header riêng */}
        <header className="relative z-20  from-cyan-900 via-blue-900 to-blue-950 border-b border-cyan-700/50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/images/magellan-logo.png" className="w-8 h-8 text-slate-900" ></img>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hành Trình Magellan</h1>
                <p className="text-sm text-cyan-200">
                  {isHost ? "Chế độ Host" : "Chế độ Thí sinh"} - Trắc nghiệm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={handleMusicIconClick}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                {isMusicPaused ? <VolumeX className="w-6 h-6 text-white" /> : <Music className="w-6 h-6 text-white" />}
              </button>

              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 text-white">
                <Users className="w-6 h-6" />
                <span className="text-lg font-semibold">{players.length}</span>
              </div>
            </div>
          </div>
        </header>



        {/* Main Content */}
        <div className="container mx-auto px-6 py-4 flex-1 ">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Question Area */}

            <div className={isHost ? "col-span-6 flex flex-col h-full" : "col-span-7 flex flex-col h-full"}>

              <MultipleChoiceQuestionBox
                questionIndex={currentState?.currentQuestion || 1}
                isHost={isHost}
                phase={currentState?.phase}
              />
            </div>

            {/* Host Controls */}
            {isHost && (
              <div className="col-span-3 space-y-4">
                <AnswerStatsChart stats={stats} totalPlayers={players.length} />

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-4 space-y-3">
                  <h4 className="text-cyan-200 text-sm font-semibold">Hiển thị đáp án</h4>
                  <button
                    onClick={() => setShowStudentAnswer(!showStudentAnswer)}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    {showStudentAnswer ? "Ẩn thống kê" : "Hiện thống kê"}
                  </button>
                  <button
                    onClick={() => {
                      handleSendCorrectAnswer();
                      setShowAnswer(!showAnswer);
                    }}
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-all"
                  >
                    {showAnswer ? "Ẩn đáp án đúng" : "Hiện đáp án đúng"}
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-4 space-y-3">
                  <h4 className="text-cyan-200 text-sm font-semibold">Điều hướng</h4>
                  {/* Giữ nguyên logic playMode auto/manual như cũ */}
                  {playMode === "auto" ? (
                    <>
                      <button onClick={handlePauseGame} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold">
                        Tạm dừng
                      </button>
                      <button onClick={handleResumeGame} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold">
                        Tiếp tục
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleNextQuestion} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold">
                        Câu tiếp theo
                      </button>
                    </>
                  )}
                </div>

                <button onClick={handleEndGameClick} className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold">
                  Kết thúc trận đấu
                </button>
              </div>
            )}

            {/* Leaderboard / Player Answers */}
            <div className={isHost ? "col-span-3" : "col-span-5"}>
              <div className="h-full bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-4">
                <Leaderboard isHost={isHost} currentQuestion={currentState?.currentQuestion || 1} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown & Game End Overlay - giữ nguyên */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[100] bg-blue-950/95 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[180px] font-black text-cyan-400 drop-shadow-2xl">
              {countdown > 0 ? countdown : "BẮT ĐẦU!"}
            </div>
          </div>
        </div>
      )}

      {isGameEnded && (
        <div className="fixed inset-0 z-[100] bg-blue-950/95 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-8">Trận đấu đã kết thúc!</h1>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
};

export default NewHostMultipleChoice;
