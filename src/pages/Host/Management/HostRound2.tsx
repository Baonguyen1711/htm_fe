import HostQuestionBoxRound2 from '../../../components/Round2/HostQuestionBoxRound2'; 
import Host from '../../../layouts/Host/Host';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFirebaseListener from '../../../shared/hooks/firebase/useFirebaseListener';
import Modal from '../../../components/ui/Modal/Modal';

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

  useEffect(() => {
    const getQuestions = async () => {
      let hintArrays = []
      const questions = await getQuestionByRound(testName, "2")

      //obstacle is the 7th question
      const obstacleWord = questions[6].answer 

      for (let i = 0; i < questions.length - 1; i++) {
        hintArrays.push(questions[i].answer.replace(/\s/g, ''))
      }

      setHintWordArray(hintArrays)
      setObstacleWord(obstacleWord)

      console.log("hintArrays", hintArrays);
      console.log("obstacleWord", obstacleWord);

    }

    getQuestions()
  }, [])

  useEffect(() => {
    const unsubscribeBuzzedPlayer = listenToBuzzedPlayer(
      (playerName) => {
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
        QuestionComponent={<HostQuestionBoxRound2 hintWordArray={hintWordArray} obstacleWord={obstacleWord} isHost={true} />}
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
