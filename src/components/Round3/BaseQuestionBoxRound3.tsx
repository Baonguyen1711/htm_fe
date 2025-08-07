import React, { useEffect, useState } from 'react'
import { Question } from '../../shared/types';
import Modal from '../ui/Modal/Modal';
import useConfirmModal from '../../shared/hooks/ui/useConfirmModal';
import { useFirebaseListener } from '../../shared/hooks';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import QuestionAndAnswer from '../ui/QuestionAndAnswer/QuestionAndAnswer';
import { Button } from '../../shared/components/ui';

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
        <div className="flex flex-col items-center min-h-[600px]">
            {shouldReturnToPacketSelection ? (
                <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
                    {Array.isArray(packetNames) && packetNames.length > 0 ? (
                        packetNames
                            .slice(0, 8) // Only show up to 8 packages
                            .map((packet) => (
                                <div key={packet} className="relative">
                                    <button
                                        className={`w-full bg-blue-500 text-white text-xl font-bold p-8 rounded-2xl shadow-lg hover:bg-blue-700 transition-all duration-200 ${!isHost ? "cursor-not-allowed opacity-50" : ""
                                            } ${usedPacketNames.includes(packet) ? "opacity-60 bg-gray-500" : ""}`}
                                        onClick={() => handleTopicSelect(packet)}
                                        style={{ minHeight: "100px" }}
                                    >
                                        {packet}
                                    </button>
                                    {/* {
                                        Array.isArray(usedPacketNames) && (

                                        )
                                    } */}

                                    {isHost && Array.isArray(usedPacketNames) && (
                                        <div className="absolute top-2 right-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={usedPacketNames.includes(packet)}
                                                onChange={() => handleToggleUsedTopic(packet)}
                                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                            />
                                            <label className="ml-1 text-xs text-white font-semibold">
                                                {usedPacketNames.includes(packet) ? "✓" : ""}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))
                    ) : null}
                </div>
            ) : (
                <div className="w-full text-center">
                    <h2 className="text-xl font-bold text-white">{selectedPacketName ? selectedPacketName : ""}</h2>
                    <div className="my-4">
                        <QuestionAndAnswer
                            currentQuestion={currentQuestion}
                            currentCorrectAnswer={currentCorrectAnswer}
                        />

                        {/* Return to topic selection button */}
                        {!shouldReturnToPacketSelection && isHost && (
                            <>
                                <div className="mt-4">

                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <Button
                                            onClick={handleCorrectClick}
                                            variant="success"
                                            size="md"
                                            className="min-w-[120px]"
                                        >
                                            Đúng
                                        </Button>
                                        <Button
                                            onClick={handleIncorrectClick}
                                            variant="danger"
                                            size="md"
                                            className="min-w-[120px]"
                                        >
                                            Sai
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <Button
                                        onClick={handleReturnToTopicSelection}
                                        variant="warning"
                                        size="lg"
                                        className="font-bold shadow-lg"
                                    >
                                        Quay về màn hình chọn gói
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {modalState.isOpen && (
                <Modal
                    text={modalState.text}
                    buttons={modalState.buttons}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

export default BaseQuestionBoxRound3