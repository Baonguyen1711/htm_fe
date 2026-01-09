import React, { useState, useEffect, useRef } from 'react'
import MultipleChoice from '../ui/MultipleChoice';

import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import PlayerAnswerInput from '../ui/Input/PlayerAnswerInput';
import { useSounds } from '../../context/soundContext';
import { useFirebaseListener } from '../../shared/hooks';
import { useAppSelector } from '../../app/store';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';
import useGameApi from '../../shared/hooks/api/useGameApi';
import { setCurrentPlayer, setShowCountdown } from '../../app/store/slices/gameSlice';
import { useAppDispatch } from '../../app/store';
import CountdownCard from '../ui/CountDownCard';
import { setSelectedChoice } from '../../app/store/slices/gameSlice';
import { setIsPausedButtonDisabled } from '../../app/store/slices/gameSlice';
import QuestionTimerBar from '../ui/QuestionTimeBar';


interface Round1Props {
    isHost: boolean,
    questionIndex: number,
    isSpectator?: boolean
    phase?: string
}

const MultipleChoiceQuestionBox: React.FC<Round1Props> = ({ isHost, questionIndex, phase, isSpectator = false }) => {
    const [params] = useSearchParams()
    const roomMode = params.get("roomMode") || "room"
    const testName = params.get("testName") || ""
    const [choices, setChoices] = useState<
        { position: string; content: string }[]
    >(["A", "B", "C", "D"].map((position) => ({
        position,
        content: ""
    })));
    const sounds = useSounds();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { startTimer } = useTimeStart();
    const { startMedia, stopMedia, multiplayerSubmit } = useGameApi()
    const { listenToTimeStart, listenToMedia, listenToCountDownStarted } = useFirebaseListener();
    const { currentQuestion, currentCorrectAnswer, showCountdown, selectedChoice } = useAppSelector(state => state.game);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const currentQuestionRef = useRef(currentQuestion);
    //const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const { timeElapsed, setPlayerAnswerTime } = useTimeStart()
    const currentPlayer = useAppSelector((state) => state.game.currentPlayer)
    const dispatch = useAppDispatch()

    const handleChoiceClick = (position: string) => {
        if (selectedChoice) return; // prevent multiple selections
        // const groupId = localStorage.getItem("groupId") || "";
        // console.log("groupId", groupId);
        dispatch(setSelectedChoice(position));

        // dispatch(setCurrentPlayer({
        //     answer: position,
        //     time: timeElapsed
        // }))
        multiplayerSubmit(roomId, position, currentPlayer?.stt || "", timeElapsed, currentPlayer?.userName || "", currentPlayer?.avatar || "", testName);
    };


    useEffect(() => {
        console.log("current question", currentQuestion)
        console.log("multiple choice question box")
        currentQuestionRef.current = currentQuestion;
        const choices = [
            { position: "A", content: currentQuestionRef.current?.answerA || "" },
            { position: "B", content: currentQuestionRef.current?.answerB || "" },
            { position: "C", content: currentQuestionRef.current?.answerC || "" },
            { position: "D", content: currentQuestionRef.current?.answerD || "" },
        ]
        console.log("choices", choices);
        setChoices(choices)
        dispatch(setSelectedChoice(null));
    }, [currentQuestion]);

    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                // const audio = sounds['timer_2'];
                // if (audio) {
                //     audio.play();
                // }

                startTimer(15)
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    useEffect(() => {
        const unsubscribe = listenToCountDownStarted(
            (data) => {
                const lobbyMusic = sounds["lobby_game"];
                if (lobbyMusic) {
                    console.log("lobbyMusic", lobbyMusic)
                    if (lobbyMusic.paused) {
                        console.log("play music")
                        lobbyMusic.play();
                        // lobbyMusic.currentTime = 0;
                    }
                }
                dispatch(setShowCountdown(true))
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
        <>
            <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden">
                {/* Question Header */}

                <div className="p-6 border-b border-white/10">
                    <QuestionTimerBar isHost={isHost} />
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium">
                            Câu {questionIndex || "1"}
                        </span>
                        {
                            currentCorrectAnswer !== "" && (
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-medium">
                                    {`Đáp án: ${currentCorrectAnswer}`}
                                </span>
                            )
                        }

                        {/* <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
                            10 điểm
                        </span> */}
                    </div>
                    <h2 className="text-xl text-white font-medium leading-relaxed">
                        {currentQuestion?.question || ""}
                    </h2>
                </div>

                {/* Media Area (if any) */}
                <div className="flex items-center justify-center
  bg-slate-900/50 border-b border-white/10
  max-h-[100vh]
  min-h-[65vh]
  overflow-hidden">
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

                {/* Answer Options */}
                <div className="p-4 flex-1 gap-4">
                    {
                        currentQuestion?.type === "TRAC_NGHIEM" && (
                            <MultipleChoice
                                choices={choices}
                                selectedChoice={selectedChoice}
                                correctAnswer={
                                    phase === "SHOW_ANSWER"
                                        ? currentCorrectAnswer
                                        : ""
                                }
                                phase={phase}
                                onChoiceClick={handleChoiceClick}
                                isHorizontal={!isHost}
                            />
                        )
                    }

                    {
                        currentQuestion?.type === "TU_LUAN" && (
                            <PlayerAnswerInput
                                isHost={isHost}
                                phase={phase}
                            />
                        )
                    }
                    {/* {answerOptions.map((option) => {
                  const isSelected = selectedAnswer === option.label;
                  const showCorrect = showAnswer && option.isCorrect;
                  const showWrong = showAnswer && isSelected && !option.isCorrect;

                  return (
                    <button
                      key={option.label}
                      onClick={() => !isHost && !showAnswer && setSelectedAnswer(option.label)}
                      disabled={isHost || showAnswer}
                      className={`p-4 rounded-xl border text-left transition-all ${showCorrect
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : showWrong
                          ? "bg-rose-500/20 border-rose-500 text-rose-400"
                          : isSelected
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                            : "bg-slate-700/30 border-white/10 text-white hover:bg-slate-700/50 hover:border-white/20"
                        } ${isHost ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="font-bold mr-2">{option.label}.</span>
                      {option.text}
                    </button>
                  );
                })} */}

                    {/* <MultipleChoiceQuestionBox
                  isHost={isHost}
                /> */}
                </div>
            </div>

            {/*=== OLD ===*/}


        </>



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

export default MultipleChoiceQuestionBox