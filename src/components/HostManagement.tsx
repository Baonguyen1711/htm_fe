import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    ArrowRightCircleIcon,
    EyeIcon,
    ClockIcon,
    PlayCircleIcon,
    SpeakerWaveIcon,
    MusicalNoteIcon,
    DocumentTextIcon,
    EyeSlashIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import { Button } from '../shared/components/ui';

import HostGuideModal from './ui/Modal/HostGuideModal';

import useTokenRefresh from '../shared/hooks/auth/useTokenRefresh';
import useGameApi from '../shared/hooks/api/useGameApi';
import { getQuestions, increaseNumberOfSelectedRow } from '../app/store/slices/gameSlice';
import { useAppDispatch, useAppSelector } from '../app/store';
import useRoomApi from '../shared/hooks/api/useRoomApi';
import { useFirebaseListener } from '../shared/hooks';


const HostManagement = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();


    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "1"
    const [showingRules, setShowingRules] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [inGameQuestionIndex, setInGameQuestionIndex] = useState(0)

    const dispatch = useAppDispatch();

    const {
        startRound,
        broadcastAnswers,
        sendCorrectAnswer,
        startTimer,
        showRules,
        hideRules
    } = useGameApi()

    const { playSound } = useRoomApi()
    const { listenToRules } = useFirebaseListener()
    const { currentRound } = useAppSelector(state => state.game)
    // Initialize token refresh for host
    useTokenRefresh();

    const handleStartRoundClick = async () => {
        try {
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

    const handleBroadcastAnswersClick = async () => {
        try {
            await broadcastAnswers(roomId);
            toast.success('Đã gửi câu trả lời của tất cả các thí sinh đến người chơi!');
        } catch (error) {
            console.error('Error broadcasting answers:', error);
            toast.error('Lỗi khi gửi câu trả lời của tất cả các thí sinh đến người chơi');
        }
    }

    const handleNextQuestionclick = async () => {
        try {
            if (currentRound === "2") {
                dispatch(increaseNumberOfSelectedRow())
            }

            await dispatch(getQuestions({ isJump: false, roomId: roomId, testName: testName }));
            setInGameQuestionIndex((prev) => prev + 1)
            toast.success('Đã hiển thị câu hỏi tiếp theo!');
        } catch (error) {
            console.error('Error broadcasting answers:', error);
            toast.error('Lỗi khi hiển thị câu hỏi tiếp theo');
        }
    }

    const handleGoToQuestionclick = async () => {
        try {

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

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-4 lg:p-6 mt-4">

            {/* Host Question Preview */}
            {/* <HostQuestionPreview /> */}

            {/* Guide and Color Selection */}
            <div className="flex items-center justify-between mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowGuideModal(true)}
                        className="flex items-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                        title="Hướng dẫn host"
                    >
                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                        Hướng dẫn
                    </button>

                </div>

                <div className="text-gray-400 text-sm">
                    Vòng {currentRound} - {currentRound === "1" ? "NHỔ NEO" : currentRound === "2" ? "VƯỢT SÓNG" : currentRound === "3" ? "BỨT PHÁ" : currentRound === "4" ? "CHINH PHỤC" : "PHÂN LƯỢT"}
                </div>
            </div>

            {/* Host actions - First row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4">

                {/* <button
                    onClick={() => openBuzz(roomId)}
                    className="flex items-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-red-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <BellAlertIcon className="w-5 h-5 mr-2" />

                    MỞ BẤM CHUÔNG
                </button> */}
                <div className="flex items-center gap-3">
                    {/* Current Question Index Input - Disabled for Round 4 */}
                    {currentRound !== "4" && (
                        <input
                            min={0}
                            value={inGameQuestionIndex}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === "") {
                                    setInGameQuestionIndex(0);
                                } else {
                                    setInGameQuestionIndex(Number(val));
                                }
                            }}
                            className="w-16 px-2 py-2 rounded-lg border border-blue-400 bg-slate-700 text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                            style={{ minWidth: 0 }}
                        />
                    )}
                    {currentRound !== "4" && (
                        <Button
                            onClick={handleGoToQuestionclick}
                            variant="warning"
                            size="md"
                            fullWidth
                            leftIcon={<ArrowRightCircleIcon className="w-4 h-4" />}
                            className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                        >
                            CHUYỂN ĐẾN CÂU HỎI
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleStartRoundClick}
                        variant="success"
                        size="md"
                        fullWidth
                        leftIcon={<PlayCircleIcon className="w-4 h-4" />}
                        className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                    >
                        BẮT ĐẦU VÒNG THI
                    </Button>
                    {/* Current Question Index Input */}

                </div>
                <Button
                    onClick={handleNextQuestionclick}
                    variant="danger"
                    size="md"
                    fullWidth
                    leftIcon={<ArrowRightCircleIcon className="w-4 h-4" />}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    CÂU HỎI TIẾP THEO
                </Button>
                <Button
                    onClick={handleStartTimeClick}
                    variant="warning"
                    size="md"
                    fullWidth
                    leftIcon={<ClockIcon className="w-4 h-4" />}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    BẮT ĐẦU ĐẾM GIỜ
                </Button>
                <Button
                    onClick={handleBroadcastAnswersClick}
                    variant="success"
                    size="md"
                    fullWidth
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    HIỆN CÂU TRẢ LỜI THÍ SINH
                </Button>

            </div>

            {/* Show Answer and Start Timer - Second row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4">
                <Button
                    onClick={handleSendCorrectAnswer}
                    variant="danger"
                    size="md"
                    fullWidth
                    leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    HIỆN ĐÁP ÁN ĐÚNG
                </Button>
            </div>

            {/* Sound controls - Fourth row */}
            <div className="flex flex-col gap-3 lg:gap-4">
                <Button
                    onClick={() => {
                        playSound(roomId, currentRound)
                        toast.success(`Đã chạy âm thanh cho vòng thi ${currentRound}`);
                    }}
                    variant="warning"
                    size="md"
                    fullWidth
                    leftIcon={<SpeakerWaveIcon className="w-4 h-4" />}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    CHẠY ÂM THANH BẮT ĐẦU VÒNG THI
                </Button>
                <Button
                    onClick={() => {
                        playSound(roomId, "opening")
                        toast.success("Đã chạy âm thanh mở đầu!");
                    }}
                    variant="success"
                    size="md"
                    fullWidth
                    leftIcon={<MusicalNoteIcon className="w-4 h-4" />}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    CHẠY ÂM THANH MỞ ĐẦU
                </Button>
                <Button
                    onClick={handleToggleRules}
                    variant="danger"
                    size="md"
                    fullWidth
                    leftIcon={showingRules ? (
                        <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                        <DocumentTextIcon className="w-4 h-4" />
                    )}
                    className="p-2 lg:p-3 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    {showingRules ? 'ẨN LUẬT THI' : 'HIỂN THỊ LUẬT THI'}
                </Button>
            </div>

            {/* Modals */}
            <HostGuideModal
                isOpen={showGuideModal}
                onClose={() => setShowGuideModal(false)}
                round={currentRound}
            />

            {/* <PlayerColorSelector
                    isOpen={showColorSelector}
                    onClose={() => setShowColorSelector(false)}
                    players={playerScores}
                    onSaveColors={handleSavePlayerColors}
                    currentColors={playerColors}
                /> */}
        </div>
    );
};

export default HostManagement;