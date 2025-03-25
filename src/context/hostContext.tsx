
import { useEffect, useState, createContext, useContext } from "react";
import { User } from "../type";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getNextQuestion } from '../pages/Host/Test/service';
import { sendAnswer, startTime } from "../pages/Host/Management/service";

// Create a context for Axios with Authentication
const HostContext = createContext<any>(null);

export const HostProvider = ({ children }: { children: React.ReactNode }) => {
    const spotsNumber = [1,2,3,4]
    const [searchParams] = useSearchParams()
    const currentRound = searchParams.get("round") || ""
    const testName = searchParams.get("testName") || ""
    const hostRoomId = searchParams.get("roomId") || ""
    const navigate = useNavigate()
    const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]);
    const [playerFlashes, setPlayerFlashes] = useState(Array(playerScores.length).fill(""));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<string>("1")
    const [currentAnswer, setCurrentAnswer] = useState<string>("")
    const [timeLeft, setTimeLeft] = useState(30);

    const triggerPlayerFlash = (index: number, isCorrect: boolean) => {
        const flashColor = isCorrect ? "flash-correct" : "flash-incorrect";
        setPlayerFlashes((prevFlashes) => {
            const newFlashes = [...prevFlashes];
            newFlashes[index] = flashColor;
            return newFlashes;
        });
        setTimeout(() => {
            setPlayerFlashes((prevFlashes) => {
                const newFlashes = [...prevFlashes];
                newFlashes[index] = "";
                return newFlashes;
            });
        }, 3000);
    };

    const handleScoreAdjust = (index: number, amount: number) => {
        setPlayerScores((prevScores) => {
            const newScores = [...prevScores];
            newScores[index] += amount;
            return newScores;
        });
        triggerPlayerFlash(index, amount > 0);
    };

    const handleNextQuestion = async () => {
        setCurrentQuestionIndex((prev)=>(parseInt(prev)+1).toString())
        const question = await getNextQuestion(testName,currentQuestionIndex,currentRound,hostRoomId)
        setCurrentAnswer(question.answer)
        console.log(question)
        alert('Moving to the next question!');
    };

    const handleShowAnswer = async () => {
      await sendAnswer(hostRoomId,currentAnswer)
      alert("answer sent!")
    };

    const handleStartTime = async () => {
      await startTime(hostRoomId)
      alert("time started!")
    }
    

    // const getSortedPlayers = (): Player[] => {
    //     return playerScores
    //         .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
    //         .sort((a, b) => b.score - a.score)
    //         .map((player, rank) => ({ ...player, position: rank }));
    // };

  return (
    <HostContext.Provider value={{handleScoreAdjust, handleNextQuestion, triggerPlayerFlash, currentQuestionIndex,setCurrentQuestionIndex,playerFlashes,setPlayerFlashes,playerScores,setPlayerScores, spotsNumber, handleShowAnswer, handleStartTime}}>
      {children}
    </HostContext.Provider>
  );
};

// Custom hook to use Axios with Bearer authentication
export const useHost = () => {
  return useContext(HostContext);
};
