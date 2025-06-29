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
    };

    useEffect(() => {
        setInGameQuestionIndex(0);
    }, [currentRound]);

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-4 lg:p-6 mt-4">

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
                    {/* Current Question Index Input */}
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
                    <button
                        onClick={() => {
                            setCurrentQuestionIndex(inGameQuestionIndex);
                            toast.success(`Đã cập nhật câu hỏi hiện tại: ${inGameQuestionIndex}`);
                        }}
                        className="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-yellow-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                    >
                        <ArrowRightCircleIcon className="w-5 h-5 mr-2" />
                        CẬP NHẬT CÂU HỎI HIỆN TẠI
                    </button>
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
                    className="w-full flex items-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white p-4 lg:p-5 rounded-xl shadow-lg border border-orange-400/50 transition-all duration-200 hover:scale-105 font-bold text-base lg:text-lg"
                >
                    <PlayCircleIcon className="w-6 h-6 mr-2" />

                    BẮT ĐẦU VÒNG THI
                </button>
                    {/* Current Question Index Input */}
                    
                </div>
                <button
                        onClick={() => {
                            if (currentRound === "3") {
                                handleNextQuestion(selectedTopic)
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
                            setInGameQuestionIndex(prev => prev + 1);
                            handleNextQuestion()
                        }}
                        className="flex items-center bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-yellow-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                    >
                        <ArrowRightCircleIcon className="w-5 h-5 mr-2" />
                        CÂU HỎI TIẾP THEO
                    </button>
                    <button
                    onClick={() => {
                        handleStartTime()
                        toast.success("Đã bắt đầu đếm giờ!");
                    }}
                    className="flex items-center bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-purple-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <ClockIcon className="w-5 h-5 mr-2" />

                    BẮT ĐẦU ĐẾM GIỜ
                </button>
                <button
                    onClick={() => {
                        handleShowAnswer()
                        toast.success("Đã hiển thị câu trả lời cho người chơi!");
                    }}
                    className="flex items-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-blue-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <EyeIcon className="w-5 h-5 mr-2" />

                    HIỆN CÂU TRẢ LỜI THÍ SINH
                </button>
               
            </div>

            {/* Show Answer and Start Timer - Second row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4">
                 <button
                    onClick={() => handleCorrectAnswer(currentAnswer)}
                    className=" flex items-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-green-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />

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
                    className="flex items-center bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-indigo-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <SpeakerWaveIcon className="w-5 h-5 mr-2" />

                    CHẠY ÂM THANH BẮT ĐẦU VÒNG THI
                </button>
                <button
                    onClick={() => {
                        playSound(roomId, "opening")
                        toast.success("Đã chạy âm thanh mở đầu!");
                    }}
                    className="flex items-center bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-pink-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    <MusicalNoteIcon className="w-5 h-5 mr-2" />

                    CHẠY ÂM THANH MỞ ĐẦU
                </button>
            </div>
        </div>
    );
};

export default HostManagement;