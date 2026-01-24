import React from 'react'
import { Question } from '../../../shared/types';

interface QuestionAndAnswerProps {
    currentQuestion: Question | null;
    currentCorrectAnswer?: string;
}

const QuestionAndAnswer: React.FC<QuestionAndAnswerProps> = ({
    currentQuestion,
    currentCorrectAnswer,
}) => {
    return (
        <>
            <h2 className="text-xl font-sans font-bold text-white mb-2 text-center drop-shadow select-none">
                {currentQuestion?.question || ""}
            </h2>

            {currentCorrectAnswer && (
                <h3 className="
    text-base 
    font-sans
    font-light 
    italic 
    text-white-300/80 
    mb-4 
    text-center 
    tracking-wide
  ">
                    Đáp án: {currentCorrectAnswer}
                </h3>
            )}


        </>


    )
}

export default QuestionAndAnswer