import React from 'react'
import { useHost } from '../context/hostContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/playerContext';
import { openBuzz } from './services';
import { playSound } from './services';
import { deletePath } from '../services/firebaseServices';

const HostManagement = () => {
    const {
        handleNextQuestion,
        handleShowAnswer,
        handleStartTime,
        handleStartRound,
        handleCorrectAnswer,
        currentAnswer,
        hostInitialGrid
    } = useHost();

    const { initialGrid, selectedTopic, easyQuestionNumber, mediumQuestionNumber, hardQuestionNumber, setEasyQuestionNumber, setMediumQuestionNumber, setHardQuestionNumber, level } = usePlayer()

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const currentRound = searchParams.get("round") || "1";
    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "1"

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

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-4 lg:p-6 mt-4">

            {/* Host actions - First row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4">
                <button
                    onClick={() => handleCorrectAnswer(currentAnswer)}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-green-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    HIỆN ĐÁP ÁN ĐÚNG
                </button>
                <button
                    onClick={() => openBuzz(roomId)}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-red-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    MỞ BẤM CHUÔNG
                </button>
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
                        handleNextQuestion()
                    }}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-yellow-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    CÂU HỎI TIẾP THEO
                </button>
            </div>

            {/* Show Answer and Start Timer - Second row */}
            <div className="flex flex-col gap-3 lg:gap-4 mb-4">
                <button
                    onClick={handleShowAnswer}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-blue-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    HIỆN CÂU TRẢ LỜI THÍ SINH
                </button>
                <button
                    onClick={handleStartTime}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-purple-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    BẮT ĐẦU ĐẾM GIỜ
                </button>
            </div>

            {/* Start Round - Third row */}
            <div className="mb-4">
                <button
                    onClick={() => {
                        handleStartRound(currentRound, roomId, initialGrid)
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white p-4 lg:p-5 rounded-xl shadow-lg border border-orange-400/50 transition-all duration-200 hover:scale-105 font-bold text-base lg:text-lg"
                >
                    BẮT ĐẦU VÒNG THI
                </button>
            </div>

            {/* Sound controls - Fourth row */}
            <div className="flex flex-col gap-3 lg:gap-4">
                <button
                    onClick={() => {
                        playSound(roomId, currentRound)
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-indigo-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    CHẠY ÂM THANH BẮT ĐẦU VÒNG THI
                </button>
                <button
                    onClick={() => {
                        playSound(roomId, "opening")
                    }}
                    className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white p-3 lg:p-4 rounded-xl shadow-lg border border-pink-400/50 transition-all duration-200 hover:scale-105 font-medium text-sm lg:text-base w-full"
                >
                    CHẠY ÂM THANH MỞ ĐẦU
                </button>
            </div>
        </div>  
    );
};

export default HostManagement;