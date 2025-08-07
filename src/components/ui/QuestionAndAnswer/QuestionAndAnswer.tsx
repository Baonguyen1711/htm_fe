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
            <h2 className="text-2xl font-bold text-cyan-200 mb-2 text-center drop-shadow">
                {currentQuestion?.question || ""}
            </h2>

            <h2 className="text-xl font-semibold text-green-300 mb-4 text-center drop-shadow">
                {currentCorrectAnswer ? currentCorrectAnswer : ""}
            </h2>

        </>


    )
}

export default QuestionAndAnswer