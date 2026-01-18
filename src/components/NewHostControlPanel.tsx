import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    ArrowRightCircleIcon,
    EyeIcon,
    EyeDropperIcon,
    ClockIcon,
    PlayCircleIcon,
    SpeakerWaveIcon,
    MusicalNoteIcon,
    DocumentTextIcon,
    EyeSlashIcon,
    QuestionMarkCircleIcon,
    PauseIcon,
    StopIcon,
    PlayIcon,
} from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import { Button } from '../shared/components/ui';

import HostGuideModal from './ui/Modal/HostGuideModal';

import useTokenRefresh from '../shared/hooks/auth/useTokenRefresh';
import useGameApi from '../shared/hooks/api/useGameApi';
import { getQuestions, increaseNumberOfSelectedRow, setShowGameStartCountdown } from '../app/store/slices/gameSlice';
import { useAppDispatch, useAppSelector } from '../app/store';
import useRoomApi from '../shared/hooks/api/useRoomApi';
import { useFirebaseListener } from '../shared/hooks';
import { useSounds } from '../context/soundContext';
import AnswerCountChart from './ui/AnswerCountChart';

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

const HostManagement = () => {
  const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sounds = useSounds()

    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "1"
    const currentRound = searchParams.get("round") || "1"
    const roomMode = searchParams.get("roomMode") || "room"
    const playMode = searchParams.get("playMode") || "auto"
    const [showingRules, setShowingRules] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [inGameQuestionIndex, setInGameQuestionIndex] = useState(0)
  
    const [isRoundStarted, setIsRoundStarted] = useState(false)


    const { isRound2GridConfirmed, isRound4GridConfirmed, phase, currentQuestionNumber, answersCount, isPausedButtonDisabled } = useAppSelector(state => state.game);

    const dispatch = useAppDispatch();

    const {
        startRound,
        multiplayerStart,
        broadcastAnswers,
        sendCorrectAnswer,

        startTimer,
        showRules,
        hideRules,

        multiplayerPause,
        multiplayerEnd,
        updateGameState
    } = useGameApi()

    const { playSound } = useRoomApi()
    const { listenToRules, listenToRoundStart } = useFirebaseListener()
    //const { currentRound } = useAppSelector(state => state.game)
    // Initialize token refresh for host
    useTokenRefresh();

    useEffect(() => {
        const unsubscribeRoundStart = listenToRoundStart(
            (round) => {
                if (round === currentRound) {
                    setIsRoundStarted(true);
                } else {
                    setIsRoundStarted(false);
                }
            }
        )

        return () => {
            unsubscribeRoundStart();
        };
    }, [currentRound]);

    const handleStartRoundClick = async () => {
        if (roomMode === "multiplayer" && playMode === "auto") {
            console.log("get next question multiplayer")
            dispatch(setShowGameStartCountdown(true))
            await multiplayerStart(roomId, localStorage.getItem('testId') || "", playMode)
            toast.success(`Đã bắt đầu trận đấu`)
            //await dispatch(getQuestions({ isJump: false, round: "multiplayer", roomId: roomId, testName: testName }));
        }
        if (currentRound === "2" && !isRound2GridConfirmed) {
            toast.error('Vui lòng xác nhận hàng ngang trước khi bắt đầu vòng thi!');
            return;
        }

        if (currentRound === "4" && !isRound4GridConfirmed) {
            toast.error('Vui lòng xác nhận bảng trước khi bắt đầu vòng thi!');
            return;
        }
        try {
            dispatch(setShowGameStartCountdown(true))
            await startRound(roomId);
            toast.success(`Đã bắt đầu vòng thi ${currentRound}`);
        } catch (error) {
            console.error('Error starting round:', error);
            toast.error('Lỗi khi bắt đầu vòng thi');
        }
    }

    const handleStartTimeClick = async () => {
        try {
            await startTimer(roomId);
            toast.success("Đã bắt đầu đếm giờ!")
        } catch (error) {
            console.error('Error starting round:', error);
            toast.error('Lỗi khi bắt đầu đếm giờ');
        }
    }

    const handleShowingSummary = async () => {
        try {
            await startRound(roomId, "summary");
            toast.success("Đã bắt đầu đếm giờ!")
        } catch (error) {
            console.error('Error starting round:', error);
            toast.error('Lỗi khi bắt đầu đếm giờ');
        }
    }

    const handlePauseTimeClick = async () => {
        try {
            const lobby = sounds["lobby_game"];
            console.log("lobby", lobby)
            if (lobby) {
                console.log("lobby paused", lobby.paused)
                if (!lobby.paused) {
                    lobby.pause();
                }
            }
            await multiplayerPause(roomId);
            toast.success("Đã tạm dừng trận đấu!")
        } catch (error) {
            console.error('Error starting round:', error);
            toast.error('Lỗi khi tạm dừng đếm giờ');
        }
    }

    const handleResumeTimeClick = async () => {
        try {
            console.log("currentQuestionNumber", currentQuestionNumber)
            await multiplayerStart(roomId, localStorage.getItem('testId') || "", playMode, currentQuestionNumber);
            toast.success("Đã tiếp tục trận đấu!")
        } catch (error) {
            console.error('Error starting round:', error);
            toast.error('Lỗi khi tiếp tục trận đấu');
        }
    }

    const handleEndGameClick = async () => {
        try {
            await multiplayerEnd(roomId);
            toast.success("Đã kết thúc trận đấu!")
        } catch (error) {
            console.error('Error starting round:', error);
            toast.error('Lỗi khi kết thúc trận đấu');
        }
    }

    const handleBroadcastAnswersClick = async () => {
        try {
            await broadcastAnswers(roomId);
            toast.success('Đã gửi câu trả lời của tất cả các thí sinh đến người chơi!');
        } catch (error) {
            console.error('Error broadcasting answers:', error);
            toast.error('Lỗi khi gửi câu trả lời của tất cả các thí sinh đến người chơi');
        }
    }

    const openLeaderboard = async () => {
        try {
            await updateGameState(roomId, { phase: "LEADERBOARD" });
            toast.success("Đã mở bảng xếp hạng");
        } catch {
            toast.error("Không thể mở leaderboard");
        }
    };

    const handleNextQuestionclick = async () => {
        try {
            if (currentRound === "2") {
                dispatch(increaseNumberOfSelectedRow())
            }
            console.log("roomMode", roomMode)
            if (roomMode === "multiplayer" && playMode === "auto") {
                console.log("get next question multiplayer")
                //await multiplayerStart(roomId, localStorage.getItem('testId') || "")
                //await dispatch(getQuestions({ isJump: false, round: "multiplayer", roomId: roomId, testName: testName }));
            } else {
                if(playMode === "manual" ) {
                    await dispatch(getQuestions({ isJump: false, round: "multiplayer", roomId: roomId, testName: testName }));
                } else {
                    await dispatch(getQuestions({ isJump: false, roomId: roomId, testName: testName }));
                }
            }
            setInGameQuestionIndex((prev) => prev + 1)
            toast.success('Đã hiển thị câu hỏi tiếp theo!');
        } catch (error) {
            console.error('Error broadcasting answers:', error);
            toast.error('Lỗi khi hiển thị câu hỏi tiếp theo');
        }
    }

    const handleGoToQuestionclick = async () => {
        try {
            if (roomMode === "multiplayer" && playMode === "manual") {
                console.log("get next question multiplayer")
                await dispatch(getQuestions({ questionNumber: inGameQuestionIndex, round: "multiplayer", isJump: true, roomId: roomId, testName: testName }));
                return
                //await multiplayerStart(roomId, localStorage.getItem('testId') || "")
                //await dispatch(getQuestions({ isJump: false, round: "multiplayer", roomId: roomId, testName: testName }));
            }
            await dispatch(getQuestions({ questionNumber: inGameQuestionIndex, isJump: true, roomId: roomId, testName: testName }));
            toast.success(`Đã chuyển đến câu hỏi số: ${inGameQuestionIndex}`);
        } catch (error) {
            console.error("Error jumping to question:", error);
            toast.error("Lỗi khi chuyển đến câu hỏi!");
        }
    }

    const handleSendCorrectAnswer = async () => {
        try {
            await sendCorrectAnswer(roomId);
            toast.success('Đã hiển thị câu trả lời đúng cho người chơi!');
        } catch (error) {
            console.error('Error sending correct answer:', error);
            toast.error('Lỗi khi hiển thị câu trả lời đúng cho người chơi!');
        }
    }

    const handleToggleRules = async () => {
        try {
            if (showingRules) {
                // Hide rules
                await hideRules(roomId);
                setShowingRules(false);
                toast.success('Đã ẩn luật thi');
            } else {
                // Show rules
                await showRules(roomId, currentRound);
                setShowingRules(true);
                toast.success(`Đã hiển thị luật thi vòng ${currentRound}`);
            }
        } catch (error) {
            console.error('Error toggling rules:', error);
            toast.error('Lỗi khi thay đổi hiển thị luật thi');
        }
    };


    // Listen to rules changes to sync local state
    useEffect(() => {
        const unsubscribe = listenToRules((rulesData: any) => {
            console.log("Host: Rules data received:", rulesData);
            if (rulesData && rulesData.show) {
                setShowingRules(true);
            } else {
                setShowingRules(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [listenToRules]);

    useEffect(() => {
        setInGameQuestionIndex(0);
        // Clear rules when entering new round to prevent auto-show
        setShowingRules(false);
        // Also clear rules from Firebase to ensure clean state
        hideRules(roomId).catch(console.error);
    }, [currentRound, hideRules, roomId]);

  /* ================= UI ================= */

  return (
    <div className="flex flex-col gap-4">

      {/* HEADER */}
      <Card>
        <div className="flex justify-between items-center">
          <button
            className={`${baseBtn} w-auto flex items-center gap-2`}
            onClick={() => setShowGuideModal(true)}
          >
            <QuestionMarkCircleIcon className="w-4 h-4" />
            Hướng dẫn Host
          </button>

          <div className="text-right text-sm text-slate-400">
            Vòng {currentRound}
          </div>
        </div>
      </Card>

      {/* ĐIỀU KHIỂN CÂU HỎI */}
      <Card title="Điều khiển câu hỏi">
        <div className="flex gap-3">
          <input
            type="number"
            value={inGameQuestionIndex}
            onChange={e => setInGameQuestionIndex(Number(e.target.value))}
            className="w-16 rounded-lg bg-slate-800 border border-white/10 text-center text-slate-100"
          />
          <button className={baseBtn} onClick={handleGoToQuestionclick}>
            Đến câu
          </button>
        </div>

        <button className={baseBtn} onClick={handleNextQuestionclick}>
          <PlayIcon className="w-4 h-4 inline mr-1" />
          Câu hỏi tiếp theo
        </button>

        <button className={baseBtn} onClick={handleStartRoundClick}>
          <PlayIcon className="w-4 h-4 inline mr-1" />
          Bắt đầu vòng
        </button>
      </Card>

      {/* ĐIỀU KHIỂN TRẬN */}
      {(roomMode === "multiplayer" || playMode === "manual") && (
        <Card title="Điều khiển trận đấu">
          <button
            className={baseBtn}
            onClick={handlePauseTimeClick}
            disabled={isPausedButtonDisabled}
          >
            <PauseIcon className="w-4 h-4 inline mr-1" />
            Tạm dừng
          </button>

          <button className={baseBtn} onClick={handleResumeTimeClick}>
            <PlayIcon className="w-4 h-4 inline mr-1" />
            Tiếp tục
          </button>

          <button className={baseBtn} onClick={handleEndGameClick}>
            <StopIcon className="w-4 h-4 inline mr-1" />
            Kết thúc
          </button>
        </Card>
      )}

      {/* ĐIỀU KHIỂN TRẬN */}
      { (
        <Card title="Điều khiển trận đấu">
          <button
            className={baseBtn}
            onClick={handleShowingSummary}
          >
            <EyeIcon className="w-4 h-4 inline mr-1" />
            Hiển thị tổng kết sau vòng
          </button>
        </Card>
      )}

      {/* ĐÁP ÁN */}
      <Card title="Hiển thị đáp án">
        <button className={baseBtn} onClick={openLeaderboard}>
          <EyeIcon className="w-4 h-4 inline mr-1" />
          Hiện đáp án người chơi
        </button>

        <button className={baseBtn} onClick={handleSendCorrectAnswer}>
          Hiện đáp án đúng
        </button>
      </Card>

      {/* ÂM THANH & LUẬT */}
      <Card title="Âm thanh & luật">
        <button className={baseBtn} onClick={() => playSound(roomId, "opening")}>
          Phát âm thanh bắt đầu cuộc thi
        </button>
        <button className={baseBtn} onClick={() => playSound(roomId, currentRound)}>
          Phát âm thanh vòng
        </button>

        <button className={baseBtn} onClick={handleToggleRules}>
          {showingRules ? "Ẩn luật" : "Hiện luật"}
        </button>
      </Card>

      <HostGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        round={currentRound}
      />
    </div>
  )
}

export default HostManagement
