import React, { useState, useEffect, useRef } from 'react'

import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import PlayerAnswerInput from '../ui/Input/PlayerAnswerInput';
import { useSounds } from '../../context/soundContext';
import { useFirebaseListener } from '../../shared/hooks';
import { useAppSelector } from '../../app/store';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';
import useGameApi from '../../shared/hooks/api/useGameApi';


interface Round1Props {
    isHost: boolean,
    isSpectator?: boolean
}

const BaseQuestionBoxRound1: React.FC<Round1Props> = ({ isHost, isSpectator = false }) => {
    const sounds = useSounds();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { startTimer } = useTimeStart();
    const { startMedia, stopMedia } = useGameApi()
    const { listenToTimeStart, listenToMedia } = useFirebaseListener();
    const { currentQuestion, currentCorrectAnswer } = useAppSelector(state => state.game);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const currentQuestionRef = useRef(currentQuestion);

    useEffect(() => {
        console.log("current question", currentQuestion)
        currentQuestionRef.current = currentQuestion;
    }, [currentQuestion]);

    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                const audio = sounds['timer_2'];
                if (audio) {
                    audio.play();
                }

                startTimer(15)
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    useEffect(() => {
        const unsubscribe = listenToMedia(
            (data) => {
                console.log("media data", data)

                if (data.action === "play") {
                    setIsPlaying(true);
                    console.log("current question", currentQuestionRef.current)
                    const extension = currentQuestionRef.current?.imgUrl?.split('.').pop()?.toLowerCase() || ""
                    const now = Date.now();
                    const diff = data.timeToPlay - now;
                    console.log("diff", diff)
                    console.log("extension", extension)
                    console.log("video ref", videoRef.current)
                    if (diff > 0) {
                        setTimeout(() => {
                            if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
                                audioRef.current?.play();
                            }

                            if (["mp4", "webm", "ogg"].includes(extension)) {
                                videoRef.current?.play();
                            }
                        }, diff);
                    }
                }

                if (data.action === "stop") {
                    setIsPlaying(false);
                    audioRef.current?.pause();
                    videoRef.current?.pause();
                }
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    const handleClickPlayMedia = () => {
        if (!isPlaying) {
            startMedia(roomId)
            setIsPlaying(true)
        } else {
            stopMedia(roomId)
            setIsPlaying(false)
        }

    }


    return (
        <div
            className={`bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full flex flex-col items-center`}
        >
            <QuestionAndAnswer
                currentQuestion={currentQuestion}
                currentCorrectAnswer={currentCorrectAnswer}
            />

            {/* Media */}
            <div
                className={`w-full h-[400px] flex items-center justify-center overflow-hidden cursor-pointer mb-4 `}
                onClick={() => setIsModalOpen(true)}
            >
                {(() => {
                    const url = currentQuestion?.imgUrl;
                    if (!url) return <p className="text-white">No media</p>;

                    const extension = url.split('.').pop()?.toLowerCase() || "";

                    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                        return <img src={url} alt="Question Visual" className="w-full h-full object-contain rounded-lg" />;
                    }

                    if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
                        return <audio ref={audioRef} className="w-full h-full object-contain ">
                            <source src={url} type={`audio/${extension}`} />
                            Your browser does not support the audio element.
                        </audio>;
                    }

                    if (["mp4", "webm", "ogg"].includes(extension)) {
                        return <video ref={videoRef} className="w-full h-full object-contain rounded-lg min-h-[400px]">
                            <source src={url} type={`video/${extension}`} />
                            Your browser does not support the video tag.
                        </video>;
                    }

                    return <p className="text-white">Unsupported media type</p>;
                })()}
            </div>

            {isHost && (
                <div className="flex gap-2 mt-4 w-full">
                    <Button
                        onClick={handleClickPlayMedia}
                        variant="primary"
                        size="md"
                        className="flex-1 whitespace-nowrap"
                    >
                        {isPlaying ? "Dừng media" : "Chạy media"}
                    </Button>

                </div>
            )}

            {/* Answer input */}
            {
                !isSpectator &&
                <PlayerAnswerInput
                    isHost={isHost}
                />
            }


            {/* Modal for full-size image */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    {(() => {
                        const url = currentQuestion?.imgUrl;
                        if (!url) return <p className="text-white">No media</p>;

                        const extension = url.split('.').pop()?.toLowerCase() || "";

                        if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                            return (
                                <img
                                    src={url}
                                    alt="Full Size"
                                    className="max-w-full max-h-full rounded-xl"
                                />
                            );
                        }

                        if (["m4a", "mp3", "wav", "ogg"].includes(extension)) {
                            return (
                                <audio className="max-w-full">
                                    <source src={url} type={`audio/${extension}`} />
                                    Your browser does not support the audio element.
                                </audio>
                            );
                        }

                        if (["mp4", "webm", "ogg"].includes(extension)) {
                            return (
                                <video className="max-w-full max-h-full rounded-xl">
                                    <source src={url} type={`video/${extension}`} />
                                    Your browser does not support the video tag.
                                </video>
                            );
                        }

                        return <p className="text-white">Unsupported media type</p>;
                    })()}
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

export default BaseQuestionBoxRound1