import React, { useState } from 'react'
import Play from '../../layouts/Play'
import { RoundBase } from '../../type';

interface QuestionBoxProps {
    question: string;
    imageUrl?: string;
    isHost?: boolean
}

const QuestionBox: React.FC<QuestionBoxProps> = ({ question, imageUrl, isHost = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="w-full flex flex-col items-center bg-white rounded-lg shadow-md p-6 flex-grow">
            {/* Nội dung câu hỏi */}
            <div
                className={`text-gray-700 text-xl font-semibold text-center mb-4 max-w-[90%] ${isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                    }`}
            >
                {question}
            </div>

            {/* Nút "Xem thêm" nếu câu hỏi dài */}
            {question.length > 150 && !isExpanded && (
                <button className="text-blue-500 text-sm underline" onClick={() => setIsExpanded(true)}>
                    Xem thêm
                </button>
            )}

            {/* Hình ảnh (nếu có) */}
            {imageUrl && (
                <div className="w-full h-[300px] flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => setIsModalOpen(true)}>
                    <img src={imageUrl} alt="Question Visual" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Modal hiển thị ảnh full kích thước */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)}>
                    <img src={imageUrl} alt="Full Size" className="max-w-full max-h-full" />
                </div>
            )}
        </div>
    );
};


const Round1: React.FC<RoundBase> = ({ isHost }) => {
    return (
        <Play
            questionComponent={<QuestionBox question="Câu hỏi mẫu?" imageUrl="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg" isHost={isHost} />}
            isHost={isHost}
        />
    );
}

export default Round1