import React, { useState, useEffect, useRef } from 'react';
import Play from '../Play';
import { RoundBase } from '../../type';
import { getPacketNames } from '../../components/services';
import { useSearchParams } from 'react-router-dom';
import { deletePath, listenToSound, listenToPackets, listenToQuestions, listenToCurrentQuestionsNumber, listenToTimeStart, listenToAnswers } from '../../services/firebaseServices';
import { usePlayer } from '../../context/playerContext';
import { setCurrentPacketQuestion } from '../../components/services';
import { useTimeStart } from '../../context/timeListenerContext';
import { setSelectedPacketToPlayer } from '../services';
import { sendCorrectAnswer } from '../../components/services';
import { useHost } from '../../context/hostContext';

import { useSounds } from '../../context/soundContext';
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
    const sounds = useSounds();
    const [topics, setTopics] = useState<string[]>([]);
    const [correctAnswer, setCorrectAnswer] = useState<string>("")
    //const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [hiddenTopics, setHiddenTopics] = useState<string[]>([]);
    // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const { selectedTopic, setSelectedTopic, currentQuestion, setCurrentQuestion } = usePlayer()
    const { currentQuestionIndex, setCurrentQuestionIndex } = useHost()
    const [searchParams] = useSearchParams()
    const testName = searchParams.get("testName") || ""
    const roomId = searchParams.get("roomId") || ""
    const isFirstMounted = useRef(true)
    const { timeLeft, startTimer } = useTimeStart();
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
            setCorrectAnswer(`Đáp án: ${answer}`)
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


    useEffect(() => {
        if (!selectedTopic) return;

        // Start timer when selectedTopic changes
        startTimer(30);

        // Side effects based on timer reaching 0
    }, []);

    useEffect(() => {
        console.log("timeLeft", timeLeft);

        if (timeLeft === 0) {
            // When timer runs out, do your clean up / game logic:
            if (isHost) {
                deletePath(roomId, "currentQuestions")
                deletePath(roomId, "answers")
                setCurrentQuestionIndex(1)
            }
            setCurrentQuestion("");
            setCorrectAnswer("")
            setSelectedTopic(null);
            localStorage.removeItem("questions");

            // If you want to reset timer, call startTimer again here or leave stopped
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

    useEffect(() => {

        const unsubscribePlayers = listenToQuestions(roomId, (questions) => {
            console.log("questions", questions);

            if (!isHost && questions.length > 0) {
                setSelectedTopic(questions[0].packetName)
                localStorage.setItem("questions", JSON.stringify(questions))
            }
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToCurrentQuestionsNumber(roomId, (questionNumber) => {
            console.log("questionNumber outside", questionNumber);
            if (localStorage.getItem("questions")) {
                const question = JSON.parse(localStorage.getItem("questions") || "")[questionNumber - 1]
                if (question) {
                    console.log("decodeQuestion(question.question)", decodeQuestion(question.question));

                    const timeOut = setTimeout(() => {
                        setCurrentQuestion(decodeQuestion(question.question))
                    }, 1000)



                    if (questionNumber === 12) {
                        {
                            console.log("questionNumber inside", questionNumber);
                            setCurrentPacketQuestion(roomId, 1)
                            setCurrentQuestion("")
                            setSelectedTopic(null)
                            setCorrectAnswer("")
                            localStorage.removeItem("questions")
                        }
                    }
                }
            }
        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    const handleTopicSelect = async (topic: string) => {
        console.log("topic", topic);
        if (isHost) {
            const questions = await setSelectedPacketToPlayer(roomId, topic, testName)
            localStorage.setItem("questions", JSON.stringify(questions))
        }
        if (!isHost) return; // Non-host users cannot select topics
        setSelectedTopic(topic);
        setHiddenTopics((prev) => [...prev, topic]); // Add the selected topic to the hidden list
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
        <div className="flex flex-col items-center">
            {!selectedTopic ? (
                <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
                    {Array.isArray(topics) && topics.length > 0 ? (
                        topics
                            .filter((topic) => !hiddenTopics.includes(topic))
                            .slice(0, 8) // Only show up to 8 packages
                            .map((topic) => (
                                <button
                                    key={topic}
                                    className={`bg-blue-500 text-white text-xl font-bold p-8 rounded-2xl shadow-lg hover:bg-blue-700 transition-all duration-200 ${!isHost ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                    onClick={() => handleTopicSelect(topic)}
                                    disabled={!isHost}
                                    style={{ minHeight: "100px" }}
                                >
                                    {topic}
                                </button>
                            ))
                    ) : null}
                </div>
            ) : (
                <div className="w-full text-center">
                    <h2 className="text-xl font-bold">{selectedTopic}</h2>
                    <div className="my-4">
                        <p className="text-lg mt-2">
                            {currentQuestion ? currentQuestion : ""}
                        </p>
                        <p className="text-lg mt-2">
                            {correctAnswer ? correctAnswer : ""}
                        </p>
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