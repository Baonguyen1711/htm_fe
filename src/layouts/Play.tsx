import React, { useState, useEffect, ReactNode } from 'react';
import Header from './Header';

interface PlayProps {
    questionComponent: ReactNode;
}

const Play: React.FC<PlayProps> = ({questionComponent}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30); // Thời gian đếm ngược (30s)
    const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái modal ảnh

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-blue-500 to-teal-400 flex flex-col overflow-auto">
            {/* Header */}
            <Header />

            {/* Main Game Section */}
            <div className="flex flex-1 p-4 gap-4">
                {/* Question Section (80%) */}
                <div className="w-4/5 flex flex-col">
                    {/* Thanh đếm thời gian */}
                    <div className="w-full h-2 bg-gray-300 rounded-full mb-2">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(timeLeft / 30) * 100}%` }}
                        ></div>
                    </div>

                    {questionComponent}

                    {/* Ô nhập câu trả lời (rộng bằng question box) */}
                    <div className="mt-2 w-full">
                        <input
                            type="text"
                            className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg text-center"
                            placeholder="Type your answer..."
                        />
                    </div>

                    {/* Player Scores dưới Question Section */}
                    <div className="flex justify-around mt-4">
                        {Array(4).fill(0).map((_, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <img
                                    src="https://via.placeholder.com/60"
                                    alt="Player"
                                    className="w-16 h-16 rounded-full"
                                />
                                <p className="text-white mt-2">Score: <b>{Math.floor(Math.random() * 100)}</b></p>
                                <p className="text-white">Username</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar (20%) */}
                <div className="w-1/5 flex flex-col">
                    {/* Round Indicator */}
                    <div className="bg-gray-300 text-center font-bold text-lg p-3 rounded-lg">
                        ROUND 1
                    </div>

                    {/* Player Scores */}
                    <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1">
                        {Array(3).fill(0).map((_, index) => (
                            <div key={index} className="mb-4">
                                <p className="text-sm">Username</p>
                                <div className="w-full bg-gray-200 text-center py-2 rounded-lg">
                                    Score: {Math.floor(Math.random() * 20)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Toggle Button */}
            <button
                className="fixed bottom-6 right-6 bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? "✖" : "💬"}
            </button>

            {/* Chat Box */}
            {isChatOpen && (
                <div className="fixed bottom-20 right-6 w-80 h-60 bg-white shadow-lg rounded-lg p-4">
                    <p className="text-sm font-bold">Chat</p>
                    <div className="h-40 overflow-y-auto bg-gray-100 p-2 rounded-lg">
                        <p className="text-xs">User1: Hello!</p>
                        <p className="text-xs text-right">You: Hi there!</p>
                    </div>
                    <input
                        type="text"
                        className="w-full h-10 mt-2 border border-gray-300 rounded-lg px-2"
                        placeholder="Type a message..."
                    />
                </div>
            )}

            {/* Modal Ảnh Full Kích Thước */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <img
                        src="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg"
                        alt="Full Size"
                        className="max-w-full max-h-full"
                    />
                </div>
            )}
        </div>
    );
}

export default Play;
