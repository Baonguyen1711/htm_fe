import React, { useEffect, useState } from 'react'
import { Question } from '../../shared/types';
import Modal from '../ui/Modal/Modal';
import useConfirmModal from '../../shared/hooks/ui/useConfirmModal';
import { useFirebaseListener } from '../../shared/hooks';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import QuestionAndAnswer from '../ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';
import QuestionTimerBar from '../ui/QuestionTimeBar';

interface BaseQuestionBoxRound3Props {
    isHost: boolean,
    isSpectator?: boolean,
    selectedPacketName: string | null,
    packetNames: string[],
    shouldReturnToPacketSelection: boolean,
    currentQuestion: Question | null,
    currentCorrectAnswer: string,

    handleTopicSelect: (topic: string) => void,
    handleToggleUsedTopic: (packet: string) => void,
    handleCorrectClick: () => void,
    handleIncorrectClick: () => void,
    handleReturnToTopicSelection: () => void,
}

const BaseQuestionBoxRound3: React.FC<BaseQuestionBoxRound3Props> = ({
    isHost,
    selectedPacketName,
    packetNames,
    shouldReturnToPacketSelection,
    currentQuestion,
    currentCorrectAnswer,

    handleTopicSelect,
    handleToggleUsedTopic,
    handleCorrectClick,
    handleIncorrectClick,
    handleReturnToTopicSelection,
}) => {

    const baseBtn =
        "w-full px-4 py-2 rounded-xl border border-white/10 bg-slate-800/60 text-slate-100 \
   hover:bg-slate-700/60 hover:border-white/20 transition-all duration-200 \
   disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
    const { modalState, closeModal } = useConfirmModal();
    const [usedPacketNames, setUsedPacketNames] = useState<string[]>([])

    const { listenToUsedPackets, listenToTimeStart, listenToSound, deletePath } = useFirebaseListener()

    const { startTimer } = useTimeStart();
    const sounds = useSounds();


    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                const audio = sounds['timer_3'];
                if (audio) {
                    audio.play();
                }
                startTimer(60)
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])
    // Listen to used topics
    useEffect(() => {
        const unsubscribeUsedTopics = listenToUsedPackets(
            (usedPacketsName) => {
                console.log("usedPacketsName fetching", usedPacketsName)
                setUsedPacketNames(Array.isArray(usedPacketsName) ? usedPacketsName : []);
            }
        )


        return () => {
            unsubscribeUsedTopics();
        };
    }, []);
    return (
        <div className="w-full bg-slate-900/40 backdrop-blur-md border border-blue-400/20 rounded-xl shadow-xl px-5 py-4 flex flex-col gap-4">
            <QuestionTimerBar isHost={isHost}/>
            {shouldReturnToPacketSelection ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-3xl mx-auto">
                    {Array.isArray(packetNames) && packetNames.length > 0
                        ? packetNames.slice(0, 8).map((packet) => (
                            <div key={packet} className="relative">
                                <button
                                    className={`w-full h-24 sm:h-28 bg-slate-800/40 text-blue-100 text-lg font-semibold rounded-xl border border-blue-400/20 shadow-md hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-center ${!isHost ? "cursor-not-allowed opacity-50" : ""
                                        } ${usedPacketNames.includes(packet) ? "opacity-60 bg-gray-700/40" : ""}`}
                                    onClick={() => handleTopicSelect(packet)}
                                >
                                    {packet}
                                </button>

                                {isHost && Array.isArray(usedPacketNames) && (
                                    <div className="absolute top-2 right-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={usedPacketNames.includes(packet)}
                                            onChange={() => handleToggleUsedTopic(packet)}
                                            className="w-4 h-4 text-green-400 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                        />
                                        <label className="ml-1 text-xs text-white font-semibold">
                                            {usedPacketNames.includes(packet) ? "✓" : ""}
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))
                        : null}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-4">
                    <h2 className="text-xl font-bold text-blue-100">{selectedPacketName ?? ""}</h2>

                    <QuestionAndAnswer
                        currentQuestion={currentQuestion}
                        currentCorrectAnswer={currentCorrectAnswer}
                    />

                    {/* Host controls */}
                    {!shouldReturnToPacketSelection && isHost && (
                        <div className="flex flex-row items-center gap-4 w-full mt-4">

                            <button className={baseBtn} onClick={handleCorrectClick}>
                                Đúng
                            </button>

                            <button className={baseBtn} onClick={handleIncorrectClick}>
                                Sai
                            </button>

                            <button className={baseBtn} onClick={handleReturnToTopicSelection}>
                                Quay về màn hình chọn gói
                            </button>

                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {modalState.isOpen && (
                <Modal text={modalState.text} buttons={modalState.buttons} onClose={closeModal} />
            )}
        </div>
    );


}

export default BaseQuestionBoxRound3