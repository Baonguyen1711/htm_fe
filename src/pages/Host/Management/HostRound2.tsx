import Round2 from '../../../layouts/RoundBase/Round2';
import Host from '../../../layouts/Host/Host';
import { getQuestionByRound } from '../Test/service';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
const HostRound2: React.FC = () => {
    const [params] = useSearchParams()
    const roomId = params.get("roomId") || ""
    const testName = params.get("testName") || ""
    const [obstacleWord, setObstacleWord] = useState("")
    const [hintWordArray,setHintWordArray] = useState<string[]>([])
    useEffect(()=>{
      const getQuestions = async () => {
        let hintArrays = []
        const questions = await getQuestionByRound(testName,"2",roomId)
        const obstacleWord = questions[6].answer

        for (let i =0;i<questions.length-1;i++) {
          hintArrays.push(questions[i].answer.replace(/\s/g, ''))
        }

        setHintWordArray(hintArrays)
        setObstacleWord(obstacleWord)

        console.log("hintArrays",hintArrays);
        console.log("obstacleWord",obstacleWord);
        
        
      }

      getQuestions()
    },[])

    return (
        <Host
            QuestionComponent={<Round2 hintWordArray={hintWordArray} obstacleWord={obstacleWord} isHost={true}/>}
        />
    )
};

export default HostRound2;
