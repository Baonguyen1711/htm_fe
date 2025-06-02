
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
// Create a context for Axios with Authentication
const HostContext = createContext<any>(null);

export const HostProvider = ({ children }: { children: React.ReactNode }) => {
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
  const [animationKey, setAnimationKey] = useState(0);
  

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
      let answer = ""
      console.log("currentQuestionIndex", currentQuestionIndex);
      console.log("type currentQuestionIndex", typeof currentQuestionIndex);


      if (currentQuestionIndex != "1") {
        console.log("currentQuestionIndex", currentQuestionIndex);
        console.log("[parseInt(currentQuestionIndex) - 2]", JSON.parse(localStorage.getItem("questions") || "")[parseInt(currentQuestionIndex) - 2]);

        answer = JSON.parse(localStorage.getItem("questions") || "")[parseInt(currentQuestionIndex) - 2].answer || ""
        console.log("answer", answer);
      }

      console.log("currentQuestionIndex", currentQuestionIndex);


      sendCorrectAnswer(hostRoomId, answer)

      if (currentQuestionIndex === "12") {
        setCurrentQuestionIndex("1")
        setCurrentPacketQuestion(hostRoomId, parseInt(currentQuestionIndex));
        sendCorrectAnswer(hostRoomId, "")
        return
      }
      setTimeout(() => {
        setCurrentPacketQuestion(hostRoomId, parseInt(currentQuestionIndex));
        setCurrentQuestionIndex((prev) => (parseInt(prev) + 1).toString());
      }, 1000);

      alert('Moving to the next question!');
      return
    }

    if (currentRound === "4" && difficulty && number) {
      const question = await getNextQuestion(testName, number, currentRound, hostRoomId, undefined, difficulty)
      setCurrentAnswer(question.answer)
      console.log(question)
      alert('Moving to the next question!')
      return
    }
    setCurrentQuestionIndex((prev) => (parseInt(prev) + 1).toString())
    const question = await getNextQuestion(testName, currentQuestionIndex, currentRound, hostRoomId)
    setCurrentAnswer(question.answer)
    console.log(question)
    alert('Moving to the next question!');
  };

  const handleShowAnswer = async () => {
    await sendAnswerToPlayer(hostRoomId)
    alert("answer sent!")
  };

  const handleStartTime = async () => {
    console.log("start time on ", hostRoomId);
    // if (currentRound === "2") {
    //   const playSound = async () => {
    //     const audio = sounds[`timer_2`];
    //     if (audio) {
    //       console.log("Attempting to play sound");
    //       try {
    //         await audio.play();
    //         console.log("Sound played successfully");
    //       } catch (err) {
    //         console.error("Failed to play sound:", err);
    //       }
    //     }
    //   }

    //   playSound()
    // }

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

    await startTime(hostRoomId);
    alert("time started!");
  }

  const handleStartRound = async (round: string, roomId: string, grid?: string[][]) => {
    if (grid) {
      console.log("grid", grid)
      await goToNextRound(roomId, round, grid)
      alert("grid sent!")
      return;
    }
    await goToNextRound(roomId, round)


  }

  const handleCorrectAnswer = async (answer: string) => {
    await sendCorrectAnswer(hostRoomId, answer)
    alert("correct answer sent!")
  }


  // const getSortedPlayers = (): Player[] => {
  //     return playerScores
  //         .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
  //         .sort((a, b) => b.score - a.score)
  //         .map((player, rank) => ({ ...player, position: rank }));
  // };

  return (
    <HostContext.Provider value={{ animationKey, setCurrentAnswer, handleScoreAdjust, handleNextQuestion, handleStartRound, currentQuestionIndex, setCurrentQuestionIndex, playerFlashes, setPlayerFlashes, playerScores, setPlayerScores, spotsNumber, handleShowAnswer, handleStartTime, hostInitialGrid, setHostInitialGrid, currentQuestionNumber, setCurrentQuestionNumber, handleCorrectAnswer, currentAnswer }}>
      {children}
    </HostContext.Provider>
  );
};

// Custom hook to use Axios with Bearer authentication
export const useHost = () => {
  return useContext(HostContext);
};
