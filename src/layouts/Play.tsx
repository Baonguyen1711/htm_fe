import React, { useState, useEffect, ReactNode } from 'react';
import Header from './Header';

interface PlayProps {
    questionComponent: ReactNode;
    isHost?: boolean; // Indicates if the view is for a host
}

const Play: React.FC<PlayProps> = ({ questionComponent, isHost = false }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30); // Countdown timer (30s)
    const [isModalOpen, setIsModalOpen] = useState(false); // Fullscreen modal state
    const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]); // Player scores

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Function to adjust player scores
    const handleScoreAdjust = (index: number, amount: number) => {
        setPlayerScores((prevScores) => {
            const newScores = [...prevScores];
            newScores[index] += amount;
            return newScores;
        });
    };

    // Handle next question button click
    const handleNextQuestion = () => {
        alert('Moving to the next question!');
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-blue-500 to-teal-400 flex flex-col overflow-auto">
            {/* Header */}
            <Header />

            {/* Main Game Section */}
            <div className="flex flex-1 p-4 gap-4">
                {/* Question Section (80%) */}
                <div className="w-4/5 flex flex-col">
                    {/* Timer Bar */}
                    <div className="w-full h-2 bg-gray-300 rounded-full mb-2">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(timeLeft / 30) * 100}%` }}
                        ></div>
                    </div>

                    {questionComponent}

                    {/* Answer Input Box */}
                    {!isHost && 
                    <div className="mt-2 w-full">
                        <input
                            type="text"
                            className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg text-center"
                            placeholder="Type your answer..."
                        />
                    </div>}


                    {/* Player Scores Below Question Section */}
                    <div className="flex justify-around mt-4">
                        {playerScores.map((score, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <img
                                    src="https://via.placeholder.com/60"
                                    alt="Player"
                                    className="w-16 h-16 rounded-full"
                                />
                                <p className="text-white mt-2">
                                    Score: <b>{score}</b>
                                </p>
                                <p className="text-white">Player {index + 1}</p>
                                {isHost && (
                                    <div className="flex gap-2 mt-2">
                                        {[10, 20, 30].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => handleScoreAdjust(index, amount)}
                                                className="bg-green-500 text-white p-1 rounded-md"
                                            >
                                                +{amount}
                                            </button>
                                        ))}
                                        {[10, 20, 30].map((amount) => (
                                            <button
                                                key={-amount}
                                                onClick={() => handleScoreAdjust(index, -amount)}
                                                className="bg-red-500 text-white p-1 rounded-md"
                                            >
                                                -{amount}
                                            </button>
                                        ))}
                                    </div>
                                )}
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

                    {/* Sidebar Content */}
                    {!isHost ? (
                        // Player scores for non-host view
                        <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1">
                            {Array(3)
                                .fill(0)
                                .map((_, index) => (
                                    <div key={index} className="mb-4">
                                        <p className="text-sm">Username</p>
                                        <div className="w-full bg-gray-200 text-center py-2 rounded-lg">
                                            Score: {Math.floor(Math.random() * 20)}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        // Host controls for the host view
                        <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1">
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => alert('Correct Answer!')}
                                    className="bg-green-500 text-white p-2 flex-1 rounded-md"
                                >
                                    Correct
                                </button>
                                <button
                                    onClick={() => alert('Incorrect Answer!')}
                                    className="bg-red-500 text-white p-2 flex-1 rounded-md"
                                >
                                    Incorrect
                                </button>
                                <button
                                    onClick={handleNextQuestion}
                                    className="bg-yellow-500 text-black p-2 flex-1 rounded-md"
                                >
                                    Next Question
                                </button>
                            </div>
                            <button
                                onClick={() => alert('Show Answer!')}
                                className="bg-blue-500 text-white w-full p-2 rounded-md mb-4"
                            >
                                Show Answer
                            </button>
                            <button
                                onClick={() => alert('Start Timer!')}
                                className="bg-purple-500 text-white w-full p-2 rounded-md"
                            >
                                Start Timer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Toggle Button */}
            <button
                className="fixed bottom-6 right-6 bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? '✖' : '💬'}
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

            {/* Fullscreen Modal */}
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
};

export default Play;
