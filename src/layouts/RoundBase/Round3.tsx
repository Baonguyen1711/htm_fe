import React, { useState, useEffect, useRef } from 'react';
import Play from '../Play';
import { Question, RoundBase } from '../../type';
import { getPacketNames } from '../../components/services';
import { useSearchParams } from 'react-router-dom';
import { deletePath, listenToSound, listenToPackets, listenToQuestions, listenToSelectedPacket, listenToCurrentQuestionsNumber, listenToTimeStart, listenToAnswers, setUsedTopic, listenToUsedTopics, setReturnToTopicSelection, listenToReturnToTopicSelection } from '../../services/firebaseServices';
import { ref, set, database } from '../../firebase-config';
import { usePlayer } from '../../context/playerContext';
import { setCurrentPacketQuestion } from '../../components/services';
import { useTimeStart } from '../../context/timeListenerContext';
import { setSelectedPacketToPlayer } from '../services';
import { sendCorrectAnswer } from '../../components/services';
import { useHost } from '../../context/hostContext';

import { useSounds } from '../../context/soundContext';
import { updateScore } from '../../pages/Host/Management/service';
// const topics = [
//     { name: "Xuân", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
//     { name: "Hạ", questions: ["Question 2.1", "Question 2.2", "Question 2.3", "Question 2.4", "Question 2.5", "Question 2.6", "Question 2.7", "Question 2.8", "Question 2.9", "Question 2.10", "Question 2.11", "Question 2.12", "Question 2.13", "Question 2.14", "Question 2.15"] },
//     { name: "Thu", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
//     { name: "Đông", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
// ];

interface QuestionComponentProps {
    isHost?: boolean;// Determines if the user is a spectator or not
}



const QuestionBoxRound3: React.FC<QuestionComponentProps> = ({ isHost = false }) => {
    const MAX_PACKET_QUESTION = 12
    const sounds = useSounds();
    const [topics, setTopics] = useState<string[]>([]);
    const [correctAnswer, setCorrectAnswer] = useState<string>("")
    //const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [hiddenTopics, setHiddenTopics] = useState<string[]>([]);
    const [usedTopics, setUsedTopics] = useState<string[]>([]);
    const [showReturnButton, setShowReturnButton] = useState(false);
    // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { selectedTopic, setSelectedTopic, currentQuestion, setCurrentQuestion, animationKey, setAnimationKey, setAnswerList } = usePlayer()
    const { currentQuestionIndex, setCurrentQuestionIndex, currentAnswer, setCurrentAnswer, selectedPlayer, handleNextQuestion, inGameQuestionIndex, setInGameQuestionIndex } = useHost()
    const [playerCurrentQuestionIndex, setPlayerCurrentQuestionIndex] = useState<number>(-1)
    const tempQuestionListRef = useRef<Question[]>([]);
    const [tempQuestionList, setTempQuestionList] = useState<Question[]>([])
    const [searchParams] = useSearchParams()
    const testName = searchParams.get("testName") || ""
    const roomId = searchParams.get("roomId") || ""
    const round = searchParams.get("round") || ""
    const isFirstMounted = useRef(true)
    const { timeLeft, startTimer, setTimeLeft } = useTimeStart();
    const salt = "HTMNBK2025";
    function decodeQuestion(encoded: string): string {
        // Decode base64 to bytes
        const binaryString = atob(encoded);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert bytes to UTF-8 string
        const decoded = new TextDecoder("utf-8").decode(bytes);

        // Check for tampering
        if (!decoded.startsWith(salt)) throw new Error("Tampered data!");

        return decoded.slice(salt.length);
    }

    // useEffect(() => {
    //     console.log("currentQuestionIndex in round 3", playerCurrentQuestionIndex);
    //     if (isHost) return
    //     if (playerCurrentQuestionIndex == MAX_PACKET_QUESTION) {

    //         const timeOut = setTimeout(() => {

    //             setCurrentQuestion("");
    //             setCorrectAnswer("")
    //             setCurrentQuestion("")
    //             setSelectedTopic(null);
    //             setPlayerCurrentQuestionIndex(0)

    //             console.log("clear at question 12");

    //         }, 6000)
    //     }
    // }, [playerCurrentQuestionIndex])

    // useEffect(() => {
    //     console.log("currentQuestionIndex in round 3", currentQuestionIndex);
    //     if (!isHost) return
    //     if (currentQuestionIndex > MAX_PACKET_QUESTION) {



    //         const timeOut = setTimeout(() => {
    //             // Show return button instead of auto-clearing
    //             setShowReturnButton(true);
    //             console.log("Showing return button - end of topic");
    //         }, 6000)
    //     }
    // }, [currentQuestionIndex])

    useEffect(() => {
        const unsubscribePlayers = listenToSound(roomId, async (type) => {

            const audio = sounds[`${type}`];
            if (audio) {
                audio.play();
            }
            console.log("sound type", type)
            await deletePath(roomId, "sound")
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToAnswers(roomId, (answer) => {
            if (answer) {
                setCorrectAnswer(`Đáp án: ${answer}`)
            }
            const timeOut = setTimeout(() => {
                setCorrectAnswer("")
            }, 1000)
            console.log("answer", answer)
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();

        };
    }, []);

    // Listen to used topics
    useEffect(() => {
        const unsubscribeUsedTopics = listenToUsedTopics(roomId, (topics) => {
            setUsedTopics(topics);
            console.log("Used topics updated:", topics);
        });

        return () => {
            unsubscribeUsedTopics();
        };
    }, [roomId]);

    // Listen to return to topic selection event
    useEffect(() => {
        const unsubscribeReturn = listenToReturnToTopicSelection(roomId, (shouldReturn) => {
            if (shouldReturn) {
                // Clear current game state and return to topic selection
                setCurrentQuestion("");
                setCorrectAnswer("");
                setSelectedTopic(null);
                setShowReturnButton(false);
                setPlayerCurrentQuestionIndex(-1);

                // Reset Firebase return flag
                if (isHost) {
                    setReturnToTopicSelection(roomId, false);
                }

                console.log("Returned to topic selection");
            }
        });

        return () => {
            unsubscribeReturn();
        };
    }, [roomId, isHost]);



    // Watch for changes in currentAnswer from host context
    useEffect(() => {
        if (isHost && currentAnswer) {
            const timeout = setTimeout(() => {
                setCorrectAnswer(currentAnswer)
            }, 1000);

            console.log("Host answer updated in Round 3:", currentAnswer)
            return () => clearTimeout(timeout);
        }
    }, [currentAnswer, isHost]);

    const isInitialMount = useRef(false)
    useEffect(() => {
        const unsubscribe = listenToTimeStart(roomId, async () => {


            // Skip the timer setting on the first mount, but allow future calls to run
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
            }
            startTimer(60)
            return () => {
                unsubscribe();

            };
        })

    }, [])


    // useEffect(() => {
    //     if (!selectedTopic) return;

    //     // Start timer when selectedTopic changes
    //     startTimer(60);

    //     return () => {


    //     }

    //     // Side effects based on timer reaching 0
    // }, []);
    const isInitialTimerMount = useRef(false)
    useEffect(() => {
        console.log("timeLeft", timeLeft);
        if (isInitialTimerMount.current) {
            isInitialTimerMount.current = false;
            return;
        }
        if (timeLeft === 0) {
            setAnimationKey((prev: number) => prev + 1); // Trigger animation or any other side effect
            // When timer runs out, show return button instead of auto-clearing
            //setShowReturnButton(true);
            console.log("Showing return button - timer expired");
        }
    }, [timeLeft]);

    useEffect(() => {
        if (!isHost) return
        const getTopic = async () => {
            const topics = await getPacketNames(testName, roomId)
            setTopics(topics)
        }

        getTopic()
    }, [])

    useEffect(() => {
        const unsubscribePlayers = listenToPackets(roomId, (packets) => {
            console.log("packets", packets);

            setTopics(packets)
            // setSelectedTopic(packets)
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    const isSelectedTopicFirstMounted = useRef(true)

    useEffect(() => {
        const unsubscribePlayers = listenToSelectedPacket(roomId, (packet) => {
            console.log("packets", packet);
            if (isSelectedTopicFirstMounted.current) {
                isSelectedTopicFirstMounted.current = false
                return
            }
            if (!isHost) {
                setSelectedTopic(packet)
            }
            // setSelectedTopic(packets)
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToQuestions(roomId, (questions) => {
            console.log("questions", questions);
            console.log("questions.question", questions.question);
            if (!isHost) {
                setPlayerCurrentQuestionIndex((prev: number) => (prev + 1))
            }

            // Clear previous answers when new question starts
            setAnswerList([])

            const timeOut = setTimeout(() => {
                setCurrentQuestion(questions.question)

                // If host, use the currentAnswer from host context
                if (isHost && currentAnswer) {
                    setCorrectAnswer(currentAnswer)
                }
            }, 1000)



            // if (questions.length > 0) {
            //     setSelectedTopic(questions[0].packetName)
            //     console.log("questions", questions);
            //     const currentQuestions = tempQuestionListRef.current
            //     tempQuestionListRef.current = [...currentQuestions, ...questions];
            //     localStorage.setItem("questions", JSON.stringify(questions))
            // }
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    // useEffect(() => {

    //     const unsubscribePlayers = listenToCurrentQuestionsNumber(roomId, (questionNumber) => {
    //         console.log("questionNumber outside", questionNumber);
    //         if (localStorage.getItem("questions")) {
    //             console.log("tempQuestionList",tempQuestionListRef.current);

    //             const question = tempQuestionListRef.current[questionNumber - 1].question;

    //             if (question) {
    //                 console.log("decodeQuestion(question.question)", question);

    //                 const timeOut = setTimeout(() => {
    //                     setCurrentQuestion(question)
    //                 }, 1000)



    //                 if (questionNumber === 12) {
    //                     {
    //                         console.log("questionNumber inside", questionNumber);
    //                         setCurrentPacketQuestion(roomId, 1)
    //                         setCurrentQuestion("")
    //                         setSelectedTopic(null)
    //                         setCorrectAnswer("")
    //                         localStorage.removeItem("questions")
    //                     }
    //                 }
    //             }
    //         }
    //     });

    //     return () => {
    //         unsubscribePlayers();
    //     };
    // }, []);

    const handleTopicSelect = async (topic: string) => {
        console.log("topic", topic);
        if (isHost) {
            setCurrentQuestionIndex("0"); 
            setCurrentAnswer("")
            setInGameQuestionIndex(0)
            setShowReturnButton(true)
            await setSelectedPacketToPlayer(roomId, topic)
        }
        if (!isHost) return; // Non-host users cannot select topics
        setSelectedTopic(topic);
        setCurrentQuestion(""); // Clear current question when selecting new topic
        setHiddenTopics((prev) => [...prev, topic]); // Add the selected topic to the hidden list
    };

    const handleReturnToTopicSelection = async () => {
        if (!isHost) return;

        // Mark current topic as used
        if (selectedTopic) {
            setUsedTopic(roomId, selectedTopic);
        }

        // Clear current game state
        setCurrentQuestion("");
        setCorrectAnswer("");
        setSelectedTopic(null);
        setShowReturnButton(false);
        //setPlayerCurrentQuestionIndex(-1);
        //setCurrentQuestionIndex("-1")

        // Clear Firebase paths
        deletePath(roomId, "currentQuestions");
        deletePath(roomId, "current_correct_answer");

        // Notify all players to return to topic selection
        setReturnToTopicSelection(roomId, true);

        console.log("Returned to topic selection");
    };

    const handleToggleUsedTopic = (topic: string) => {
        if (!isHost) return;

        if (usedTopics.includes(topic)) {
            // Remove from used topics
            const updatedTopics = usedTopics.filter(t => t !== topic);
            // Update Firebase with new list
            const usedTopicsRef = ref(database, `rooms/${roomId}/usedTopics`);
            set(usedTopicsRef, updatedTopics);
        } else {
            // Add to used topics
            setUsedTopic(roomId, topic);
        }
    };


    // useEffect(() => {
    //     if (selectedTopic && timeLeft > 0) {
    //         const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    //         return () => clearTimeout(timer);
    //     } else if (timeLeft === 0 && isHost) {
    //         // Automatically navigate back for hosts
    //         const resetTimer = setTimeout(() => {
    //             setSelectedTopic(null);
    //         }, 3000);
    //         return () => clearTimeout(resetTimer);
    //     }
    // }, [timeLeft, selectedTopic, isHost]);


    //const currentQuestions = topics.find((topic) => topic.name === selectedTopic)?.questions;

    return (
        <div className="flex flex-col items-center min-h-[600px]">
            {!selectedTopic ? (
                <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
                    {Array.isArray(topics) && topics.length > 0 ? (
                        topics
                            .slice(0, 8) // Only show up to 8 packages
                            .map((topic) => (
                                <div key={topic} className="relative">
                                    <button
                                        className={`w-full bg-blue-500 text-white text-xl font-bold p-8 rounded-2xl shadow-lg hover:bg-blue-700 transition-all duration-200 ${!isHost ? "cursor-not-allowed opacity-50" : ""
                                            } ${usedTopics.includes(topic) ? "opacity-60 bg-gray-500" : ""}`}
                                        onClick={() => handleTopicSelect(topic)}
                                        disabled={!isHost}
                                        style={{ minHeight: "100px" }}
                                    >
                                        {topic}
                                    </button>
                                    {isHost && (
                                        <div className="absolute top-2 right-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={usedTopics.includes(topic)}
                                                onChange={() => handleToggleUsedTopic(topic)}
                                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                            />
                                            <label className="ml-1 text-xs text-white font-semibold">
                                                {usedTopics.includes(topic) ? "✓" : ""}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : null}
                </div>
            ) : (
                <div className="w-full text-center">
                    <h2 className="text-xl font-bold text-white">{selectedTopic ? selectedTopic : ""}</h2>
                    <div className="my-4">
                        <p className="text-lg mt-2 text-white">
                            {currentQuestion ? currentQuestion : ""}
                        </p>
                        <p className="text-lg mt-2 text-white">
                            {correctAnswer ? correctAnswer : ""}
                        </p>




                        {/* Return to topic selection button */}
                        {showReturnButton && isHost && (
                            <>
                                <div className="mt-4">

                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <button
                                            onClick={() => {
                                                updateScore(roomId, [], "auto", "3", selectedPlayer?.stt.toString(), "true");
                                                setInGameQuestionIndex((prev: number) => prev + 1);
                                                handleNextQuestion(selectedTopic);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] rounded py-2 px-4"
                                        >
                                            Đúng
                                        </button>
                                        <button
                                            onClick={() => {
                                                setInGameQuestionIndex((prev: number) => prev + 1);
                                                handleNextQuestion(selectedTopic);
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white min-w-[120px] rounded py-2 px-4"
                                        >
                                            Sai
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleReturnToTopicSelection}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
                                    >
                                        Quay về màn hình chọn gói
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// const Round3: React.FC<RoundBase> = ({ isHost }) => {
//     return (
//         <Play
//             questionComponent={<QuestionComponent isHost={isHost}/>}
//             isHost={isHost}
//         />
//     );
// }

export default QuestionBoxRound3

