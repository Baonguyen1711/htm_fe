import React, { useState, useEffect } from 'react'
import Play from '../../layouts/Play'
import { RoundBase } from '../../type';
import { listenToQuestions, listenToAnswers } from '../../services/firebaseServices';
import { useSearchParams } from 'react-router-dom';


interface QuestionBoxProps {
    question: string;
    imageUrl?: string;
    isHost?: boolean
}

const QuestionBoxRound1: React.FC = () => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const [currentQuestion, setCurrentQuestion] = useState<QuestionBoxProps>()
    const [correctAnswer,setCorrectAnswer] = useState<string>("")
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [finalUrl, setFinalUrl] = useState<string>("")

    useEffect(() => {
        const unsubscribePlayers = listenToQuestions(roomId, (question) => {
            setCurrentQuestion(question)
            console.log("current question", question)
            if(question.imgUrl){
                const match = question.imgUrl.match(/\/d\/(.+?)\//);
                const fileId = match ? match[1] : null; 
                console.log("image url", question.imgUrl.match(/\/d\/(.+?)\//))
                setFinalUrl(`https://drive.usercontent.google.com/download?id=${fileId}&export=view`)
            }
            
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToAnswers(roomId, (answer) => {
            setCorrectAnswer(`Đáp án: ${answer}`)
            const timeOut = setTimeout(()=>{
                setCorrectAnswer("")
            },4000)
            console.log("answer", answer)
            clearTimeout(timeOut)
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();

        };
    }, []);

    return (
        <div className="w-full flex flex-col items-center bg-white rounded-lg shadow-md p-6 flex-grow">
            {/* Nội dung câu hỏi */}
            <div
                className={`text-gray-700 text-xl font-semibold text-center mb-4 max-w-[90%] ${isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                    }`}
            >
                {currentQuestion?.question}
            </div>

            <div
                className={`text-gray-700 text-xl font-semibold text-center mb-4 max-w-[90%] ${isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                    }`}
            >
                {correctAnswer}
            </div>

            {/* Nút "Xem thêm" nếu câu hỏi dài
            {question.length > 150 && !isExpanded && (
                <button className="text-blue-500 text-sm underline" onClick={() => setIsExpanded(true)}>
                    Xem thêm
                </button>
            )} */}

            {/* Hình ảnh (nếu có) */}
            {finalUrl && (
                <div className="w-full h-[300px] flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => setIsModalOpen(true)}>
                    <iframe src={finalUrl} className="w-full h-full object-cover"></iframe>
                    {/* <img src={finalUrl} alt="Question Visual" className="w-full h-full object-cover" /> */}
                </div>
            )}

            {/* Modal hiển thị ảnh full kích thước */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)}>
                    <img src={finalUrl} alt="Full Size" className="max-w-full max-h-full" />
                </div>
            )}
        </div>
    );
};


// const Round1: React.FC<RoundBase> = ({ isHost }) => {
//     return (
//         <Play
//             questionComponent={<QuestionBox question="Câu hỏi mẫu?" imageUrl="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg" isHost={isHost} />}
//             isHost={isHost}
//         />
//     );
// }

export default QuestionBoxRound1