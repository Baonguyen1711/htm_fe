
import { useEffect, useState, createContext, useContext } from "react";
import { User, Score } from "../type";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getNextQuestion, prefetchQuestion } from '../pages/Host/Test/service';
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
  const spotsNumber = [1, 2, 3, 4, 5, 6, 7, 8] // Support up to 8 players
  const [searchParams] = useSearchParams()
  const currentRound = searchParams.get("round") || ""
  const testName = searchParams.get("testName") || ""
  const hostRoomId = searchParams.get("roomId") || ""
  const navigate = useNavigate()
  const [playerScores, setPlayerScores] = useState<Score[]>(
    Array(8).fill(null).map(() => ({ // Initialize for 8 players
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
  const [prefetchedQuestion, setPrefetchedQuestion] = useState<any>(null)
  const [prefetchedAnswer, setPrefetchedAnswer] = useState<string>("")
  const [showCurrentAnswer, setShowCurrentAnswer] = useState<boolean>(false)
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
  const [playerColors, setPlayerColors] = useState<Record<string, string>>({});

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
    // If a specific question number is provided (for crash recovery), jump to that question
    if (number && number !== currentQuestionIndex) {
      console.log(`Jumping to specific question: ${number}`)
      setCurrentQuestionIndex(number)

      const question = await getNextQuestion(testName, number, currentRound, hostRoomId, topic, difficulty)
      setCurrentAnswer(question.answer)
      setShowCurrentAnswer(true)

      // Clear prefetched data since we're jumping
      setPrefetchedQuestion(null)
      setPrefetchedAnswer("")

      // Prefetch the next question after jumping
      const nextNum = (parseInt(number) + 1).toString()
      await prefetchNextQuestion(topic, difficulty, nextNum)
      return
    }

    // Increment question index first
    const nextQuestionIndex = (parseInt(currentQuestionIndex) + 1).toString()
    setCurrentQuestionIndex(nextQuestionIndex)

    console.log(`Moving to question ${nextQuestionIndex} in round ${currentRound}`)

    // Handle round 3 logic
    if (currentRound === "3") {
      if(currentAnswer !== ""){
        sendCorrectAnswer(hostRoomId, currentAnswer)
      }
      if(parseInt(nextQuestionIndex) > 12) {
        setCurrentAnswer("")
        setShowCurrentAnswer(false)
        return
      }

      try {
        const question = await getNextQuestion(testName, nextQuestionIndex, currentRound, hostRoomId, topic)
        setCurrentAnswer(question.answer)
        setShowCurrentAnswer(true)

        // Prefetch next question
        const prefetchNum = (parseInt(nextQuestionIndex) + 1).toString()
        await prefetchNextQuestion(topic, difficulty, prefetchNum)
      } catch (error) {
        console.log(`No more questions in round 3`)
        setCurrentAnswer("")
        setShowCurrentAnswer(false)
        setPrefetchedQuestion(null)
        setPrefetchedAnswer("")
      }
      return
    }

    // Handle round 4 logic
    if (currentRound === "4" && difficulty && number) {
      const question = await getNextQuestion(testName, number, currentRound, hostRoomId, undefined, difficulty)
      setCurrentAnswer(question.answer)
      setShowCurrentAnswer(true)
      console.log(question)

      // Prefetch next question
      const nextNum = (parseInt(number) + 1).toString()
      await prefetchNextQuestion(topic, difficulty, nextNum)
      return
    }

    // Default logic for other rounds
    try {
      const question = await getNextQuestion(testName, nextQuestionIndex, currentRound, hostRoomId)
      setCurrentAnswer(question.answer)
      setShowCurrentAnswer(true)
      console.log("question.answer", question.answer)

      // Prefetch next question
      const prefetchNum = (parseInt(nextQuestionIndex) + 1).toString()
      await prefetchNextQuestion(topic, difficulty, prefetchNum)
    } catch (error) {
      console.log(`No more questions in round ${currentRound}`)
      setCurrentAnswer("")
      setShowCurrentAnswer(false)
      setPrefetchedQuestion(null)
      setPrefetchedAnswer("")
    }
  };

  const prefetchNextQuestion = async (topic?: string, difficulty?: string, questionNumber?: string) => {
    try {
      let nextQuestionNumber: string;

      if (questionNumber) {
        // Use the provided question number
        nextQuestionNumber = questionNumber
      } else if (currentRound === "3") {
        const currentNum = parseInt(currentQuestionIndex)
        if(currentNum >= 12) {
          return // No more questions to prefetch
        }
        nextQuestionNumber = (currentNum + 1).toString()
      } else if (currentRound === "4" && difficulty) {
        // For round 4, calculate question number based on dynamic level configuration
        const currentNum = parseInt(currentQuestionIndex)
        nextQuestionNumber = (currentNum + 1).toString()

        // Note: The actual question mapping will be handled by the backend
        // based on room configuration when the question is requested
      } else {
        // For other rounds, increment from current index
        nextQuestionNumber = (parseInt(currentQuestionIndex) + 1).toString()
      }

      console.log(`Prefetching question ${nextQuestionNumber} for round ${currentRound}`)
      const prefetchData = await prefetchQuestion(testName, nextQuestionNumber, currentRound, hostRoomId, topic, difficulty)
      setPrefetchedQuestion(prefetchData.question)
      setPrefetchedAnswer(prefetchData.answer)
      console.log("Prefetched next question:", prefetchData.question?.question)
    } catch (error) {
      console.error("Error prefetching next question:", error)
    }
  }

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
    await deletePath(roomId, "current_correct_answer"); // Clear current answer
    await deletePath(roomId, "turn"); // Clear turn assignments
    await deletePath(roomId, "isModified"); // Clear isModified state
    // Don't clear showRules here - let host control modal display manually
    await goToNextRound(roomId, round)

  }

  const handleCorrectAnswer = async (answer: string) => {
    await sendCorrectAnswer(hostRoomId, answer)
    toast.success("Đã gửi câu trả lời đúng đến người chơi!");
  }

  // Reset and prepare for new round
  useEffect(() => {
    if (testName && hostRoomId && currentRound) {
      // Reset everything for new round
      setCurrentQuestionIndex("0") // Start at 0, will increment to 1 on first click
      setCurrentAnswer("")
      setShowCurrentAnswer(false)
      setPrefetchedQuestion(null)
      setPrefetchedAnswer("")

      console.log(`Round ${currentRound} started - reset to question 0`)
    }
  }, [currentRound, testName, hostRoomId])


  // const getSortedPlayers = (): Player[] => {
  //     return playerScores
  //         .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
  //         .sort((a, b) => b.score - a.score)
  //         .map((player, rank) => ({ ...player, position: rank }));
  // };

  return (
    <HostContext.Provider value={{ numberOfSelectedRow, setNumberOfSelectedRow, rules, setRules, mode, setMode, animationKey, currentAnswer, setCurrentAnswer, prefetchedQuestion, prefetchedAnswer, showCurrentAnswer, setShowCurrentAnswer, handleScoreAdjust, handleNextQuestion, handleStartRound, currentQuestionIndex, setCurrentQuestionIndex, playerFlashes, setPlayerFlashes, playerScores, setPlayerScores, spotsNumber, handleShowAnswer, handleStartTime, hostInitialGrid, setHostInitialGrid, currentQuestionNumber, setCurrentQuestionNumber, handleCorrectAnswer, playerColors, setPlayerColors }}>
      {children}
    </HostContext.Provider>
  );
};

// Custom hook to use Axios with Bearer authentication
export const useHost = () => {
  return useContext(HostContext);
};
