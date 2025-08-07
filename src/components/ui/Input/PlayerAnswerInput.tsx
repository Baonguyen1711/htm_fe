import { useEffect, useRef, useState } from "react";
import { Question } from "../../../shared/types";
import { useTimeStart } from "../../../context/timeListenerContext";
import { useAppDispatch, useAppSelector } from "../../../app/store"
import { setCurrentPlayer, setPlayerAnswer } from "../../../app/store/slices/gameSlice";

interface PlayerAnswerInputProps {
    isHost: boolean;

    playerAnswerRef?: React.RefObject<string>;
}

const PlayerAnswerInput: React.FC<PlayerAnswerInputProps> = ({ isHost, playerAnswerRef: externalPlayerAnswerRef }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { timeElapsed, setPlayerAnswerTime } = useTimeStart()
    const dispatch = useAppDispatch()
    const currentPlayer = useAppSelector((state) => state.game.currentPlayer) 
    const playerAnswer = useAppSelector((state) => state.game.currentPlayer?.answer)
    const { isInputDisabled } = useAppSelector((state) => state.game)
    const { currentQuestion } = useAppSelector((state) => state.game)


    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log("playerAnswer", playerAnswer)
        console.log("currentPlayer", currentPlayer)
        if (event.key === "Enter") {
            const inputElement = event.target as HTMLInputElement;
            // playerAnswerRef.current = inputElement.value;

            dispatch(setCurrentPlayer({
                answer: inputElement.value,
                time: timeElapsed
            }))

            inputElement.value = "";
        }
    };

    console.log("isInputDisabled", isInputDisabled)

    useEffect(() => {
        // Clear input when question changes
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        // playerAnswerRef.current = "";
        dispatch(setCurrentPlayer({
            answer: "",
            time: 0
        }))

    }, [currentQuestion]);

    if (isHost) return null;

    return (
        <div className="mt-2 w-full">
            <input
                type="text"
                ref={inputRef}
                className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg text-center"
                placeholder="Type your answer..."
                onKeyDown={handleKeyDown}
                disabled={isInputDisabled}
            />
            <p className="mt-2 text-lg text-white">
                {currentPlayer?.answer ? `Your answer: ${currentPlayer?.answer}` : ""}
            </p>
        </div>
    );
};

export default PlayerAnswerInput
