import React, { useState, useEffect, useRef } from 'react'

import { useSearchParams } from 'react-router-dom';
import { useTimeStart } from '../../context/timeListenerContext';
import PlayerAnswerInput from '../ui/Input/PlayerAnswerInput';
import { useSounds } from '../../context/soundContext';
import { useFirebaseListener } from '../../shared/hooks';
import { useAppSelector } from '../../app/store';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';


interface Round1Props {
    isHost: boolean,
    isSpectator?: boolean
}

const BaseQuestionBoxRound1: React.FC<Round1Props> = ({ isHost, isSpectator = false }) => {
    const sounds = useSounds();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {  startTimer } = useTimeStart();
    const { listenToTimeStart} = useFirebaseListener();
    const { currentQuestion, currentCorrectAnswer } = useAppSelector(state => state.game);

    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                const audio = sounds['timer_1'];
                if (audio) {
                    audio.play();
                }

                startTimer(10)
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])


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
                className={`w-full h-[300px] flex items-center justify-center overflow-hidden cursor-pointer mb-4  min-h-[400px]`}
                onClick={() => setIsModalOpen(true)}
            >
                {(() => {
                    const url = currentQuestion?.imgUrl;
                    if (!url) return <p className="text-white">No media</p>;

                    const extension = url.split('.').pop()?.toLowerCase() || "";

                    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
                        return <img src={url} alt="Question Visual" className="w-full h-full object-contain rounded-lg" />;
                    }

                    if (["m4a","mp3", "wav", "ogg"].includes(extension)) {
                        return <audio controls className="w-full h-full object-contain">
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

export default BaseQuestionBoxRound1