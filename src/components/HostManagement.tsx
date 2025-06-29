import React, { useEffect, useState } from 'react'
import { useHost } from '../context/hostContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/playerContext';
import { openBuzz } from './services';
import { playSound } from './services';
import { deletePath } from '../services/firebaseServices';
import { updateScore } from '../pages/Host/Management/service';
import {
    CheckCircleIcon,
    BellAlertIcon,
    ArrowRightCircleIcon,
    EyeIcon,
    ClockIcon,
    PlayCircleIcon,
    SpeakerWaveIcon,
    MusicalNoteIcon,
} from "@heroicons/react/24/solid";
import { toast } from 'react-toastify';
import HostQuestionPreview from './HostQuestionPreview';

const HostManagement = () => {
    const {
        handleNextQuestion,
        handleShowAnswer,
        handleStartTime,
        handleStartRound,
        handleCorrectAnswer,
        currentAnswer,
        playerScores,
        setPlayerScores,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        hostInitialGrid
    } = useHost();

    const { initialGrid, selectedTopic, easyQuestionNumber, mediumQuestionNumber, hardQuestionNumber, setEasyQuestionNumber, setMediumQuestionNumber, setHardQuestionNumber, level } = usePlayer()

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentRound = searchParams.get("round") || "1";
    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "1"
    const [inGameQuestionIndex, setInGameQuestionIndex] = useState<number>(0);
    const handleRoundChange = async (delta: number) => {
        console.log("currentRound", currentRound)
        const newRound = parseInt(currentRound) + delta;
        console.log("new round", newRound)
        if (newRound >= 1 && newRound <= 4) { // limit to 1-4 rounds
            navigate(`?round=${newRound}&testName=${testName}&roomId=${roomId}`);
        }
        await deletePath(roomId, "questions");
        await deletePath(roomId, "answers");
        await deletePath(roomId, "turn"); // Clear turn assignments
        await deletePath(roomId, "isModified"); // Clear isModified state
    };

    useEffect(() => {
        setInGameQuestionIndex(0);
    }, [currentRound]);

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-4 lg:p-6 mt-4">

            {/* Host Question Preview */}
            <HostQuestionPreview />

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
                        <button
                        onClick={async () => {
                            try {
                                setCurrentQuestionIndex(inGameQuestionIndex.toString());

                                // Fetch and display the specified question
                                if (currentRound === "3") {
                                    await handleNextQuestion(selectedTopic, undefined, inGameQuestionIndex.toString());
                                } else if (currentRound === "4") {
                                    await handleNextQuestion(undefined, level, inGameQuestionIndex.toString());
                                } else {
                                    await handleNextQuestion(undefined, undefined, inGameQuestionIndex.toString());
                                }

                                toast.success(`Đã chuyển đến câu hỏi số: ${inGameQuestionIndex}`);
                            } catch (error) {
                                console.error("Error jumping to question:", error);
                                toast.error("Lỗi khi chuyển đến câu hỏi!");
                            }
                        }}
                        className="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-yellow-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                    >
                            <ArrowRightCircleIcon className="w-4 h-4 mr-2" />
                            CHUYỂN ĐẾN CÂU HỎI
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                    onClick={() => {
                        console.log("playerScores before starting round", playerScores);

                        const newScoreList = [...playerScores]
                        for (let score of newScoreList) {
                            score["isCorrect"] = false;
                            score["isModified"] = false
                        }
                        setPlayerScores(newScoreList)
                        //updateScore(roomId, playerScores, "manual", currentRound)
                        handleStartRound(currentRound, roomId, initialGrid)
                        toast.success(`Đã bắt đầu vòng thi ${currentRound}`);
                    }}
                    className="w-full flex items-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-green-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base"
                >
                    <PlayCircleIcon className="w-4 h-4 mr-2" />

                    BẮT ĐẦU VÒNG THI
                </button>
                    {/* Current Question Index Input */}
                    
                </div>
                <button
                        onClick={() => {
                            if (currentRound === "3") {
                                // Use the input box value for round 3
                                handleNextQuestion(selectedTopic, undefined, inGameQuestionIndex.toString())
                                setInGameQuestionIndex(prev => prev + 1);
                                return
                            }
                            if (currentRound === "4") {
                                if (level === "Dễ") {
                                    handleNextQuestion(undefined, level, easyQuestionNumber.toString())
                                    setEasyQuestionNumber((prev: number) => (prev + 1))
                                }
                                if (level === "Trung bình") {
                                    handleNextQuestion(undefined, level, (20 + mediumQuestionNumber).toString())
                                    setMediumQuestionNumber((prev: number) => (prev + 1))
                                }
                                if (level === "Khó") {
                                    handleNextQuestion(undefined, level, (40 + hardQuestionNumber).toString())
                                    setHardQuestionNumber((prev: number) => (prev + 1))
                                }
                                return
                            }
                            // Use the input box value for other rounds
                            handleNextQuestion(undefined, undefined, inGameQuestionIndex.toString())
                            setInGameQuestionIndex(prev => prev + 1);
                        }}
                        className="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-yellow-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                    >
                        <ArrowRightCircleIcon className="w-4 h-4 mr-2" />
                        CÂU HỎI TIẾP THEO
                    </button>
                    <button
                    onClick={() => {
                        handleStartTime()
                        toast.success("Đã bắt đầu đếm giờ!");
                    }}
                    className="flex items-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-red-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <ClockIcon className="w-4 h-4 mr-2" />

                    BẮT ĐẦU ĐẾM GIỜ
                </button>
                <button
                    onClick={() => {
                        handleShowAnswer()
                        toast.success("Đã hiển thị câu trả lời cho người chơi!");
                    }}
                    className="flex items-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-green-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <EyeIcon className="w-4 h-4 mr-2" />

                    HIỆN CÂU TRẢ LỜI THÍ SINH
                </button>
               
            </div>

            {/* Show Answer and Start Timer - Second row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4">
                 <button
                    onClick={() => handleCorrectAnswer(currentAnswer)}
                    className="flex items-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-green-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />

                    HIỆN ĐÁP ÁN ĐÚNG
                </button>
               

            </div>

            {/* Sound controls - Fourth row */}
            <div className="flex flex-col gap-3 lg:gap-4">
                <button
                    onClick={() => {
                        playSound(roomId, currentRound)
                        toast.success(`Đã chạy âm thanh cho vòng thi ${currentRound}`);
                    }}
                    className="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-yellow-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <SpeakerWaveIcon className="w-4 h-4 mr-2" />

                    CHẠY ÂM THANH BẮT ĐẦU VÒNG THI
                </button>
                <button
                    onClick={() => {
                        playSound(roomId, "opening")
                        toast.success("Đã chạy âm thanh mở đầu!");
                    }}
                    className="flex items-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-2 lg:p-3 rounded-lg shadow-md border border-red-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <MusicalNoteIcon className="w-4 h-4 mr-2" />

                    CHẠY ÂM THANH MỞ ĐẦU
                </button>
            </div>
        </div>
    );
};

export default HostManagement;