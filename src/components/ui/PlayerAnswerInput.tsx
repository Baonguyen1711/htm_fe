import { useEffect, useRef, useState } from "react";
import { Question } from "../../type";
import { usePlayer } from "../../context/playerContext";
import { useTimeStart } from "../../context/timeListenerContext";

interface PlayerAnswerInputProps {
    isHost: boolean;
    question: Question | undefined;
    isDisabled?: boolean
}

const PlayerAnswerInput: React.FC<PlayerAnswerInputProps> = ({ isHost, question, isDisabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const {timeElapsed, setPlayerAnswerTime} = useTimeStart()
    const [playerAnswer, setPlayerAnswer] = useState("");
    const {playerAnswerRef} = usePlayer()

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const inputElement = event.target as HTMLInputElement;
            playerAnswerRef.current = inputElement.value;
            setPlayerAnswerTime(timeElapsed)
            setPlayerAnswer(playerAnswerRef.current)
            inputElement.value = "";
        }
    };

    useEffect(() => {
        console.log("playerAnswerRef.current when question", playerAnswerRef.current);
        
        // Clear input when question changes
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        playerAnswerRef.current = "";
        setPlayerAnswer("")

        console.log("playerAnswerRef.current after clear", playerAnswerRef.current);
        
    }, [question]);

    if (isHost) return null;

    return (
        <div className="mt-2 w-full">
            <input
                type="text"
                ref={inputRef}
                className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg text-center"
                placeholder="Type your answer..."
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
            />
            <p className="mt-2 text-lg text-white">
                {playerAnswer? `Your answer: ${playerAnswer}`: ""}
            </p>
        </div>
    );
};

export default PlayerAnswerInput
