import React, { useEffect, useState } from 'react'
import { useFirebaseListener } from '../../shared/hooks';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { useConfirmModal } from '../../shared/hooks/ui/useConfirmModal';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { getPacketsName, getQuestions, setCurrentCorrectAnswer, setCurrentQuestion, setCurrentQuestionNumber, setSelectedPacketName, setUsedPackesName } from '../../app/store/slices/gameSlice';
import { gameApi } from '../../shared/services';
import BaseQuestionBoxRound3 from './BaseQuestionBoxRound3';

interface HostQuestionBoxRound3Props {
    isHost: boolean,
    isSpectator?: boolean
}
const HostQuestionBoxRound3: React.FC<HostQuestionBoxRound3Props> = ({ isHost }) => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const testName = searchParams.get("testName") || ""

    //local state
    const [showReturnButton, setShowReturnButton] = useState(false);
    const [usedPacketNames, setUsedPacketNames] = useState<string[]>([])

    // listener
    const { listenToUsedPackets } = useFirebaseListener()

    //global state
    const { selectedPacketName, packetNames, currentCorrectAnswer, currentQuestion, currentTurn } = useAppSelector((state) => state.game);
    const dispatch = useAppDispatch()

    // Confirmation modal hook
    const { showConfirmModal } = useConfirmModal();

    //api
    const { sendSelectedPacketName, sendUsedPacketName, sendShouldReturnToPacketSelection, updateScoring, sendCorrectAnswer } = gameApi

    useEffect(() => {
        const getInitialPacketsName = async () => {
            await dispatch(getPacketsName({
                testName: testName,
                roomId: roomId
            }))
        }

        getInitialPacketsName()
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
    }, [roomId]);

    const handleTopicSelect = async (topic: string) => {
        console.log("topic", topic);
        dispatch(setCurrentQuestionNumber(0))
        dispatch(setCurrentQuestion(null))

        dispatch(setCurrentCorrectAnswer(""))
        dispatch(setUsedPackesName([...usedPacketNames, topic]))
        dispatch(setSelectedPacketName(topic))

        setShowReturnButton(true)

        await sendSelectedPacketName(roomId, topic)
        await sendShouldReturnToPacketSelection(roomId, false)
        await sendUsedPacketName(roomId, [...usedPacketNames, topic])
    };

    const handleReturnToTopicSelection = async () => {
        dispatch(setSelectedPacketName(null))
        setShowReturnButton(false);

        await sendShouldReturnToPacketSelection(roomId, true)

        console.log("Returned to topic selection");
    };

    const handleToggleUsedTopic = (packet: string) => {
        const isCurrentlyUsed = usedPacketNames.includes(packet);

        showConfirmModal({
            text: isCurrentlyUsed
                ? `Bạn có chắc chắn muốn bỏ đánh dấu gói "${packet}" là đã sử dụng?`
                : `Bạn có chắc chắn muốn đánh dấu gói "${packet}" là đã sử dụng?`,
            onConfirm: async () => {
                if (isCurrentlyUsed) {
                    // Remove from used packets
                    const updatedpackets = usedPacketNames.filter(t => t !== packet);
                    await sendUsedPacketName(roomId, updatedpackets);
                    toast.success(`Đã bỏ đánh dấu gói "${packet}"`);
                } else {
                    // Add to used packets
                    await sendUsedPacketName(roomId, [...usedPacketNames, packet]);
                    toast.success(`Đã đánh dấu gói "${packet}" là đã sử dụng`);
                }
            },
            confirmText: isCurrentlyUsed ? 'Bỏ đánh dấu' : 'Đánh dấu',
            confirmVariant: 'primary'
        });
    };

    const handleCorrectClick = async () => {
        const scoringUpdate = {
            roomId: roomId,
            mode: "auto" as 'auto',
            round: "3",
            isCorrect: true,
            stt: currentTurn.toString()
        }

        await updateScoring(scoringUpdate)
        await sendCorrectAnswer({
            roomId: roomId
        })
        console.log("scoringUpdate", scoringUpdate);

        try {
            const result = await dispatch(getQuestions({ round: "3", roomId: roomId, testName: testName }))
        } catch (error) {
            toast.error("Đã hết câu hỏi")
            console.log("error", error)
        }

    }

    const handleIncorrectClick = async () => {
        await sendCorrectAnswer({
            roomId: roomId
        })
        try {
            const result = await dispatch(getQuestions({ round: "3", roomId: roomId, testName: testName }))
        } catch (error) {
            toast.error("Đã hết câu hỏi")
            console.log("error", error)
        }
    }
    return (
        <BaseQuestionBoxRound3
            isHost={isHost}
            isSpectator={false}
            selectedPacketName={selectedPacketName}
            packetNames={packetNames}
            showReturnButton={showReturnButton}
            currentQuestion={currentQuestion}
            currentCorrectAnswer={currentCorrectAnswer}

            handleTopicSelect={handleTopicSelect}
            handleToggleUsedTopic={handleToggleUsedTopic}
            handleCorrectClick={handleCorrectClick}
            handleIncorrectClick={handleIncorrectClick}
            handleReturnToTopicSelection={handleReturnToTopicSelection}
        />
    )
}

export default HostQuestionBoxRound3