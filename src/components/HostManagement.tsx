import React from 'react'
import { useHost } from '../context/hostContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/playerContext';
import { round } from 'react-placeholder/lib/placeholders';
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
        <>
            <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1">
                {/* Round navigation */}
                <div className="flex justify-center items-center gap-2 mb-4">
                    <button
                        onClick={() => handleRoundChange(-1)}
                        disabled={parseInt(currentRound) <= 1}
                        className="text-2xl px-2 disabled:opacity-50"
                    >
                        ←
                    </button>
                    <span className="text-lg font-semibold">Round {currentRound}</span>
                    <button
                        onClick={() => handleRoundChange(1)}
                        disabled={parseInt(currentRound) >= 4}
                        className="text-2xl px-2 disabled:opacity-50"
                    >
                        →
                    </button>
                </div>

                {/* Host actions */}
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => handleCorrectAnswer(currentAnswer)}
                        className="bg-green-500 text-white p-2 flex-1 rounded-md"
                    >
                        Correct
                    </button>
                    <button
                        onClick={() => openBuzz(roomId)}
                        className="bg-red-500 text-white p-2 flex-1 rounded-md"
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
                                console.log("selectedTopic", level);

                                if (level === "Dễ") {
                                    handleNextQuestion(undefined, level, easyQuestionNumber.toString())
                                    console.log("easyQuestionNumber", easyQuestionNumber);
                                    console.log("easyQuestionNumber type", typeof easyQuestionNumber);

                                    setEasyQuestionNumber((prev: number) => (prev + 1))
                                }

                                if (level === "Trung bình") {
                                    handleNextQuestion(undefined, level, (20 + mediumQuestionNumber).toString())
                                    console.log("mediumQuestionNumber", mediumQuestionNumber);
                                    console.log("mediumQuestionNumber type", typeof mediumQuestionNumber);


                                    setMediumQuestionNumber((prev: number) => (prev + 1))
                                }

                                if (level === "Khó") {

                                    handleNextQuestion(undefined, level, (40 + hardQuestionNumber).toString())
                                    console.log("hardQuestionNumber", hardQuestionNumber);
                                    console.log("hardQuestionNumber type", typeof hardQuestionNumber);

                                    setHardQuestionNumber((prev: number) => (prev + 1))
                                }
                                return
                            }
                            handleNextQuestion()
                        }}
                        className="bg-yellow-500 text-black p-2 flex-1 rounded-md"
                    >
                        Next Question
                    </button>
                </div>

                <button
                    onClick={handleShowAnswer}
                    className="bg-blue-500 text-white w-full p-2 rounded-md mb-4"
                >
                    Show Answer
                </button>
                <button
                    onClick={handleStartTime}
                    className="bg-purple-500 text-white w-full p-2 rounded-md"
                >
                    Start Timer
                </button>
                <button
                    onClick={() => {
                        // if(currentRound === "2") {
                        //     handleStartRound(currentRound, roomId,initialGrid)
                        //     return
                        // }
                        handleStartRound(currentRound, roomId, initialGrid)
                    }}
                    className="bg-yellow-500 text-black p-2 flex-1 rounded-md"
                >
                    START ROUND
                </button>

                <div className="flex gap-4 mb-4">
                    {/* ...existing buttons... */}
                    <button
                        onClick={() => {
                            playSound(roomId, currentRound)

                        }}
                        className="bg-blue-700 text-white p-2 flex-1 rounded-md"
                    >
                        Play Round Sound
                    </button>
                    <button
                        onClick={() => {
                            playSound(roomId, "opening")
                        }}
                        className="bg-pink-500 text-white p-2 flex-1 rounded-md"
                    >
                        Play Opening Sound
                    </button>
                </div>
            </div>

        </>
    );
};

export default HostManagement;
