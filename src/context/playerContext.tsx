
import { useEffect, useState, createContext, useContext, useRef } from "react";
import { User, Score } from "../type";
import { Answer } from "../type";

// Create a context for Axios with Authentication
const PlayerContext = createContext<any>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const playerAnswerRef = useRef<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [startedListening, setStartedListening] = useState<boolean>(false)
  const [players, setPlayers] = useState<User[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState<string>("")
  const [currentPlayerAvatar, setCurrentPlayerAvatar] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")
  const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]); // Support up to 8 players
  const [position,setPosition] = useState<string>("")
  const [playerFlashes, setPlayerFlashes] = useState<Score[]>([]);
  const [scoreList, setScoreList] = useState<Score[]>([]);
  const [playersArray, setPlayerArray] = useState<User[]>(() => {
    const storedPlayers = localStorage.getItem("playerList");
    return storedPlayers ? JSON.parse(storedPlayers) : players;
  })
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [easyQuestionNumber, setEasyQuestionNumber] = useState<number>(1)
  const [mediumQuestionNumber, setMediumQuestionNumber] = useState<number>(1)
  const [hardQuestionNumber, setHardQuestionNumber] = useState<number>(1)
  const [level, setLevel] = useState<string>("")
  const [answerList, setAnswerList] = useState<Answer[]>([])
  const [initialGrid, setInitialGrid] = useState<string[][]>([])
  const [animationKey, setAnimationKey] = useState(0);
  const [roomRule, setRoomRules] = useState(null)
  

//   const triggerPlayerFlash = (index: number, isCorrect: boolean) => {
//     const flashColor = isCorrect ? "flash-correct" : "flash-incorrect";
//     setPlayerFlashes((prevFlashes) => {
//         const newFlashes = [...prevFlashes];
//         newFlashes[index] = flashColor;
//         return newFlashes;
//     });
//     setTimeout(() => {
//         setPlayerFlashes((prevFlashes) => {
//             const newFlashes = [...prevFlashes];
//             newFlashes[index] = "";
//             return newFlashes;
//         });
//     }, 3000);
// };
  return (
    <PlayerContext.Provider value={{ currentPlayerAvatar, setCurrentPlayerAvatar,roomRule, setRoomRules,animationKey, setAnimationKey,players, setPlayers, roomId, setRoomId, playersArray, setPlayerArray, playerFlashes, setPlayerFlashes,position, setPosition, startedListening, setStartedListening,scoreList, setScoreList, setInitialGrid, initialGrid, setCurrentPlayerName, currentPlayerName, selectedTopic, setSelectedTopic, easyQuestionNumber,setEasyQuestionNumber, mediumQuestionNumber, setMediumQuestionNumber, hardQuestionNumber, setHardQuestionNumber, level,setLevel, currentQuestion, setCurrentQuestion, answerList, setAnswerList, playerAnswerRef }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use Axios with Bearer authentication
export const usePlayer = () => {
  return useContext(PlayerContext);
};
