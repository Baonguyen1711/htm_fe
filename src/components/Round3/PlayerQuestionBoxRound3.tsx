import React, { useEffect, useState } from 'react'
import { useFirebaseListener } from '../../shared/hooks';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { useSearchParams } from 'react-router-dom';
import { setCurrentCorrectAnswer, setCurrentQuestion } from '../../app/store/slices/gameSlice';
import BaseQuestionBoxRound3 from './BaseQuestionBoxRound3';

interface PlayerQuestionBoxRound3Props {
    isHost: boolean,
    isSpectator?: boolean
}
const PlayerQuestionBoxRound3: React.FC<PlayerQuestionBoxRound3Props> = ({ isHost }) => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""

    // local state
    const [shouldReturnToTopicSelection, setShouldReturnToTopicSelection] = useState(true)

    // listener
    const { listenToPacketsName, listenToSelectedPacketName, listenToReturnToPacketsSelection } = useFirebaseListener()


    //redux dispatch
    const dispatch = useAppDispatch()

    //global state
    const { selectedPacketName, packetNames, currentCorrectAnswer, currentQuestion, currentTurn } = useAppSelector((state) => state.game);

    useEffect(() => {
        const unsubscribePackets = listenToPacketsName()

        return () => {
            unsubscribePackets();
        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribeSelectedPacket = listenToSelectedPacketName()

        return () => {
            unsubscribeSelectedPacket();
        };
    }, [roomId]);

    useEffect(() => {
        const unsubscribeShouldReturn = listenToReturnToPacketsSelection(
            (shouldReturn) => {
                console.log("shouldReturn", shouldReturn)
                setShouldReturnToTopicSelection(shouldReturn)
                dispatch(setCurrentQuestion(null))
                dispatch(setCurrentCorrectAnswer(""))
            }
        )

        return () => {
            unsubscribeShouldReturn();
        };
    }, [roomId]);



    return (
        <BaseQuestionBoxRound3
            isHost={isHost}
            isSpectator={false}
            selectedPacketName={selectedPacketName}
            packetNames={packetNames}
            shouldReturnToPacketSelection={shouldReturnToTopicSelection}
            currentQuestion={currentQuestion}
            currentCorrectAnswer={currentCorrectAnswer}

            handleTopicSelect={() => { }}
            handleToggleUsedTopic={() => { }}
            handleCorrectClick={() => { }}
            handleIncorrectClick={() => { }}
            handleReturnToTopicSelection={() => { }}
        />
    );
}

export default PlayerQuestionBoxRound3