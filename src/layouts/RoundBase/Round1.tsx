import React, { useState, useEffect, useRef } from 'react'
import Play from '../../layouts/Play'
import { RoundBase } from '../../type';
import { listenToTimeStart, listenToQuestions, listenToAnswers, listenToSound, deletePath } from '../../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import { usePlayer } from '../../context/playerContext';
import PlayerAnswerInput from '../../components/ui/PlayerAnswerInput';
import { Question } from '../../type';
import { submitAnswer } from '../services';
import { useSounds } from '../../context/soundContext';
import { set } from 'firebase/database';

// interface QuestionBoxProps {
//     question: string;
//     imgUrl?: string;
//     isHost?: boolean
// }

interface Round1Props {
    isHost: boolean,
    isSpectator?: boolean
}

const QuestionBoxRound1: React.FC<Round1Props> = ({ isHost, isSpectator = false }) => {
    const sounds = useSounds();
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const [currentQuestion, setCurrentQuestion] = useState<Question>()
    const [correctAnswer, setCorrectAnswer] = useState<string>("")
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { timeLeft, startTimer, setTimeLeft } = useTimeStart();
    const { setAnswerList, playerAnswerRef, position, animationKey, setAnimationKey } = usePlayer()

    useEffect(() => {
        console.log("playerAnswerRef.current", playerAnswerRef.current);
    }, [playerAnswerRef.current])
    // useEffect(() => {
    //     if (isInitialMount) return


    //     startTimer(10);

    //     return () => {
    //         // Clean up timer
    //     }


    // }, []);
    const isInitialMount = useRef(false)
    useEffect(() => {
        const unsubscribe = listenToTimeStart(roomId, async () => {


            // Skip the timer setting on the first mount, but allow future calls to run
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
            }
            startTimer(10)
            return () => {
                unsubscribe();

            };
        })

    }, [])

    const isInitialTimerMount = useRef(false)
    useEffect(() => {
        console.log("timeLeft", timeLeft);


        if (isInitialTimerMount.current) {
            isInitialTimerMount.current = false;
            return;
        }
        if (timeLeft === 0) {

            setAnimationKey((prev: number) => prev + 1);
            if (!isHost) {
                console.log("playerAnswerRef.current", playerAnswerRef.current);
                console.log("position", position);


                // When timer runs out, do your clean up / game logic:
                submitAnswer(roomId, playerAnswerRef.current, position)

            }
            // If you want to reset timer, call startTimer again here or leave stopped
        }
    }, [timeLeft]);
    useEffect(() => {
        const unsubscribePlayers = listenToQuestions(roomId, (question) => {
            setCurrentQuestion(question)
            console.log("current question", question)
            setAnswerList(null)

        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

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
            const audio = sounds['correct'];
            if (audio) {
                audio.play();
            }
            setCorrectAnswer(`Đáp án: ${answer}`)
            const timeOut = setTimeout(() => {
                setCorrectAnswer("")
            }, 4000)
            console.log("answer", answer)
            clearTimeout(timeOut)
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();

        };
    }, []);

    return (
        <div
            className={`bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full flex flex-col items-center`}
        >
            {/* Question text */}
            <div
                className={`text-white text-xl font-semibold text-center mb-4 max-w-[90%] ${isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                    }`}
            >
                {currentQuestion?.question}
            </div>

            {/* Correct answer */}
            <div
                className={`text-cyan-200 text-lg font-semibold text-center mb-4 max-w-[90%] ${isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                    }`}
            >
                {correctAnswer}
            </div>

            {/* Media */}
            <div
                className={`w-full h-[300px] flex items-center justify-center overflow-hidden cursor-pointer mb-4  min-h-[400px]`}
                onClick={() => setIsModalOpen(true)}
            >
                {(() => {
                    const url = currentQuestion?.imgUrl;
                    if (!url) return <p className="text-white">No media</p>;

                    const extension = url.split('.').pop()?.toLowerCase() || "";

                    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                        return <img src={url} alt="Question Visual" className="w-full h-full object-cover rounded-lg" />;
                    }

                    if (["mp3", "wav", "ogg"].includes(extension)) {
                        return <audio controls className="w-full h-full">
                            <source src={url} type={`audio/${extension}`} />
                            Your browser does not support the audio element.
                        </audio>;
                    }

                    if (["mp4", "webm", "ogg"].includes(extension)) {
                        return <video controls className="w-full h-full object-cover rounded-lg">
                            <source src={url} type={`video/${extension}`} />
                            Your browser does not support the video tag.
                        </video>;
                    }

                    return <p className="text-white">Unsupported media type</p>;
                })()}
            </div>

            {/* Answer input */}
            {
                !isSpectator &&
                <PlayerAnswerInput
                    isHost={isHost}
                    question={currentQuestion}
                />
            }


            {/* Modal for full-size image */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)}>
                    <img src={currentQuestion?.imgUrl} alt="Full Size" className="max-w-full max-h-full rounded-xl" />
                </div>
            )}
        </div>
    );
};


// const Round1: React.FC<RoundBase> = ({ isHost }) => {
//     return (
//         <Play
//             questionComponent={<QuestionBox question="Câu hỏi mẫu?" imageUrl="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg" isHost={isHost} />}
//             isHost={isHost}
//         />
//     );
// }

export default QuestionBoxRound1