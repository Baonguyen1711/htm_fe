
import { useEffect, useState, createContext, useContext } from "react";
import { User, Score } from "../type";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getNextQuestion } from '../pages/Host/Test/service';
import { sendAnswerToPlayer, startTime } from "../pages/Host/Management/service";
import { sendGridToPlayers, goToNextRound } from "../components/services";
import { setCurrentChunk, setCurrentPacketQuestion, sendCorrectAnswer } from "../components/services";
import { deletePath } from "../services/firebaseServices";
import { round } from "react-placeholder/lib/placeholders";
import { useSounds } from "./soundContext";
import { playSound } from "../components/services";
import { listenToScores } from "../services/firebaseServices";
import { toast } from 'react-toastify';
import { setSelectedPacketToPlayer } from "../layouts/services";
// Create a context for Axios with Authentication
const HostContext = createContext<any>(null);

export const HostProvider = ({ children }: { children: React.ReactNode }) => {
  const testId = localStorage.getItem("testId") || ""
  const sounds = useSounds();
  const spotsNumber = [1, 2, 3, 4]
  const [searchParams] = useSearchParams()
  const currentRound = searchParams.get("round") || ""
  const testName = searchParams.get("testName") || ""
  const hostRoomId = searchParams.get("roomId") || ""
  const navigate = useNavigate()
  const [playerScores, setPlayerScores] = useState<Score[]>(
    Array(4).fill(null).map(() => ({
      score: "0",
      isCorrect: false,
      playerName: "",
      avatar: "",
      isModified: false
    }))
  );
  const [playerFlashes, setPlayerFlashes] = useState(Array(playerScores.length).fill(""));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<string>("1")
  const [currentAnswer, setCurrentAnswer] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(30);
  const [hostInitialGrid, setHostInitialGrid] = useState<string[][]>([])
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<Number>(0)
  const [numberOfSelectedRow, setNumberOfSelectedRow] = useState<Number>(0)
  const [mode, setMode] = useState<"manual" | "auto">("manual")
  const [rules, setRules] = useState({
    round1: [15, 10, 10, 10],
    round2: [15, 10, 10, 10],
    round3: 10,
    round4: [10, 20, 30]
  })
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const unsubscribeScores = listenToScores(hostRoomId, (scoreList) => {
      if (Array.isArray(scoreList)) {
        console.log("Received scoreList:", scoreList);

        setPlayerScores(scoreList);
      }
      console.log("Updated scoreList:", scoreList);
    })

    return () => {
      unsubscribeScores()
    }
  }, [])

  const handleScoreAdjust = (index: string, amount: number, isCorrect: boolean, playerName: string, avatar: string) => {
    console.log("playerScores before update ", playerScores);

    setPlayerScores((prevScores) => {
      const newScores = [...prevScores];
      console.log("index ", index);
      console.log("newScores", newScores[0].stt);
      const player: any = newScores.find((player) => player.stt === index.toString())
      console.log("player", player);
      if (player) {
        player.score = (parseInt(player.score) + amount).toString();
        player.isCorrect = isCorrect;
        player.isModified = true;
      }

      console.log("newScores", player);

      return player ? newScores : prevScores;

    });

    console.log("playerScores after update ", playerScores);
  };

  const handleNextQuestion = async (topic?: string, difficulty?: string, number?: string) => {
    if (currentRound === "3") {
      if(currentAnswer!=""){
        sendCorrectAnswer(hostRoomId, currentAnswer)
      }
      if(parseInt(currentQuestionIndex) >12) {
        setCurrentAnswer("")
        return
      }
      
      setCurrentQuestionIndex((prev) => (parseInt(prev) + 1).toString())
      const question = await getNextQuestion(testName, currentQuestionIndex, currentRound, hostRoomId, topic)
      setCurrentAnswer(question.answer)
     
      return
    }

    if (currentRound === "4" && difficulty && number) {
      const question = await getNextQuestion(testName, number, currentRound, hostRoomId, undefined, difficulty)
      setCurrentAnswer(question.answer)
      console.log(question)
      return
    }
    setCurrentQuestionIndex((prev) => (parseInt(prev) + 1).toString())
    const question = await getNextQuestion(testName, currentQuestionIndex, currentRound, hostRoomId)
    setCurrentAnswer(question.answer)
    console.log("question.answer", question.answer)
  };

  const handleShowAnswer = async () => {
    await sendAnswerToPlayer(hostRoomId)
  };

  const handleStartTime = async () => {
    console.log("start time on ", hostRoomId);


    if (currentRound === "1") {
      playSound(hostRoomId, "timer_1");
    }

    if (currentRound === "2") {
      playSound(hostRoomId, "timer_2");
    }

    if (currentRound === "3") {
      playSound(hostRoomId, "timer_3");
    }

    if (currentRound === "4") {
      playSound(hostRoomId, "timer_4");
    }

    if (currentRound === "turn") {
      playSound(hostRoomId, "timer_1");
    }

    await startTime(hostRoomId);
  }

  const handleStartRound = async (round: string, roomId: string, grid?: string[][]) => {
    if (grid) {
      console.log("grid", grid)
      await goToNextRound(roomId, round, grid)
      return;
    }
    console.log("roomId", roomId);

    if (round !== "1") {

    }
    await deletePath(roomId, "questions");
    await deletePath(roomId, "answers");
    await goToNextRound(roomId, round)

  }

  const handleCorrectAnswer = async (answer: string) => {
    await sendCorrectAnswer(hostRoomId, answer)
    toast.success("Đã gửi câu trả lời đúng đến người chơi!");
  }


  // const getSortedPlayers = (): Player[] => {
  //     return playerScores
  //         .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
  //         .sort((a, b) => b.score - a.score)
  //         .map((player, rank) => ({ ...player, position: rank }));
  // };

  return (
    <HostContext.Provider value={{ numberOfSelectedRow, setNumberOfSelectedRow, rules, setRules, mode, setMode, animationKey, currentAnswer, setCurrentAnswer, handleScoreAdjust, handleNextQuestion, handleStartRound, currentQuestionIndex, setCurrentQuestionIndex, playerFlashes, setPlayerFlashes, playerScores, setPlayerScores, spotsNumber, handleShowAnswer, handleStartTime, hostInitialGrid, setHostInitialGrid, currentQuestionNumber, setCurrentQuestionNumber, handleCorrectAnswer }}>
      {children}
    </HostContext.Provider>
  );
};

// Custom hook to use Axios with Bearer authentication
export const useHost = () => {
  return useContext(HostContext);
};
