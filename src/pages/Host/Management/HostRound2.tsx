import HostQuestionBoxRound2 from '../../../components/Round2/HostQuestionBoxRound2';
import Host from '../../../layouts/Host/Host';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFirebaseListener from '../../../shared/hooks/firebase/useFirebaseListener';
import Modal from '../../../components/ui/Modal/Modal';
import { useSounds } from '../../../context/soundContext';

const HostRound2: React.FC = () => {
  const [params] = useSearchParams()
  const roomId = params.get("roomId") || ""
  const testName = params.get("testName") || ""
  const [obstacleWord, setObstacleWord] = useState("")
  const [hintWordArray, setHintWordArray] = useState<string[]>([])
  const { getQuestionByRound, resetBuzz } = useGameApi()
  const { listenToBuzzedPlayer } = useFirebaseListener();
  const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [markedCharInWord, setMarkedCharInWord] = useState<Record<string, number[]>>({})
  const sounds = useSounds();

  useEffect(() => {
    const getQuestions = async () => {
      let hintArrays = []
      const questions = await getQuestionByRound(testName, "2")

      //obstacle is the 7th question
      const obstacleWord = questions[6].answer

      for (let i = 0; i < questions.length - 1; i++) {
        console.log("questions[i].answer", questions[i].answer)
        hintArrays.push(questions[i].answer.toString().replace(/\s/g, ''))
      }

      setHintWordArray(hintArrays)
      setObstacleWord(obstacleWord)

      console.log("hintArrays", hintArrays);
      console.log("obstacleWord", obstacleWord);
      let markedCharInWord: Record<string, number[]> = {}

      if (hintWordArray) {
        for (let word of hintArrays) {
          let indexInTarget: number[] = []
          for (let i = 0; i <= word.length + 1; i++) {
            const char = word[i];
            console.log("char", char)
            console.log("obstacleWord", obstacleWord)
            console.log("hintWordArray", hintWordArray)
            if (obstacleWord && obstacleWord.includes(char)) {
              console.log("match at", i)
              console.log("indexInTarget before pushing", indexInTarget);
              indexInTarget.push(i)
              console.log("indexInTarget after pushing", indexInTarget);
            }
          }
          markedCharInWord[(hintArrays.indexOf(word)+1).toString()] = indexInTarget
        }
      }

      console.log("markedCharInWord", markedCharInWord)

      const keys = Object.keys(markedCharInWord);

      const randomTwoEntries = keys
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .reduce<Record<string, number[]>>((acc, key) => {
          acc[key] = markedCharInWord[key];
          return acc;
        }, {});

      console.log("randomTwoEntries", randomTwoEntries);
      setMarkedCharInWord(randomTwoEntries)

    }

    getQuestions()
  }, [])

  useEffect(() => {
    const unsubscribeBuzzedPlayer = listenToBuzzedPlayer(
      (playerName) => {
        const audio = sounds["buzz"];
        if (audio) {
          audio.play();
        }
        setShowModal(true)
        setBuzzedPlayer(playerName)
      }
    )

    return () => {
      unsubscribeBuzzedPlayer();
    };
  }, [])
  const handleCloseModal = () => {
    setShowModal(false);
    // Optionally clear buzzedPlayer if you want to reset it
    setBuzzedPlayer("");
    resetBuzz(roomId)

  };

  return (
    <>
      <Host
        QuestionComponent={<HostQuestionBoxRound2 hintWordArray={hintWordArray} obstacleWord={obstacleWord} isHost={true} markedCharInWord={markedCharInWord} />}
      />
      {showModal && buzzedPlayer &&
        <Modal
          text={`${buzzedPlayer} đã nhấn chuông trả lời`}
          buttons={[
            { text: "Đóng", onClick: handleCloseModal, variant: "primary" },
          ]}
          onClose={handleCloseModal}
        />
      }
    </>
  )
};

export default HostRound2;
