import React, { useState, useEffect, ReactNode } from 'react';
import Header from './Header';

interface PlayProps {
    questionComponent: ReactNode;
    isHost?: boolean;
}

interface Player {
    score: number;
    index: number;
    username: string;
    position: number;
}

const Play: React.FC<PlayProps> = ({ questionComponent, isHost = false }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]);
    const [playerFlashes, setPlayerFlashes] = useState(Array(playerScores.length).fill(""));

    const simulateSocketScoreUpdate = () => {
        const playerIndex = Math.floor(Math.random() * playerScores.length);
        const scoreChange = Math.random() > 0.5 ? 10 : -10;
        console.log(`Simulated socket event: Player ${playerIndex + 1} score changed by ${scoreChange}`);

        setPlayerScores((prevScores) => {
            const newScores = [...prevScores];
            newScores[playerIndex] += scoreChange;
            return newScores;
        });
        triggerPlayerFlash(playerIndex, scoreChange > 0);
    };

    useEffect(() => {
        const socketInterval = setInterval(() => {
            simulateSocketScoreUpdate();
        }, 5000);
        return () => clearInterval(socketInterval);
    }, []);

    const triggerPlayerFlash = (index: number, isCorrect: boolean) => {
        const flashColor = isCorrect ? "flash-correct" : "flash-incorrect";
        setPlayerFlashes((prevFlashes) => {
            const newFlashes = [...prevFlashes];
            newFlashes[index] = flashColor;
            return newFlashes;
        });
        setTimeout(() => {
            setPlayerFlashes((prevFlashes) => {
                const newFlashes = [...prevFlashes];
                newFlashes[index] = "";
                return newFlashes;
            });
        }, 3000);
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleScoreAdjust = (index: number, amount: number) => {
        setPlayerScores((prevScores) => {
            const newScores = [...prevScores];
            newScores[index] += amount;
            return newScores;
        });
        triggerPlayerFlash(index, amount > 0);
    };

    const handleNextQuestion = () => {
        alert('Moving to the next question!');
    };

    const getSortedPlayers = (): Player[] => {
        return playerScores
            .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
            .sort((a, b) => b.score - a.score)
            .map((player, rank) => ({ ...player, position: rank }));
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-r from-blue-500 to-teal-400 flex flex-col overflow-auto">
            <Header />
            <div className="flex flex-1 p-4 gap-4">
                <div className="w-4/5 flex flex-col">
                    <div className="w-full h-2 bg-gray-300 rounded-full mb-2">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-1000"
                            style={{ width: `${(timeLeft / 30) * 100}%` }}
                        ></div>
                    </div>
                    {questionComponent}
                    {!isHost && (
                        <div className="mt-2 w-full">
                            <input
                                type="text"
                                className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg text-center"
                                placeholder="Type your answer..."
                            />
                        </div>
                    )}
                    <div className="flex justify-around mt-4">
                        {playerScores.map((score, index) => (
                            <div key={index} className={`flex flex-col items-center ${playerFlashes[index]}`}>
                                <img
                                    src="https://via.placeholder.com/60"
                                    alt="Player"
                                    className="w-16 h-16 rounded-full"
                                />
                                <p className="text-white mt-2 ">
                                    Score: <b>{score}</b>
                                </p>
                                <p className="text-white">Player {index + 1}</p>
                                {isHost && (
                                    <div className="flex gap-2 mt-2">
                                        {[10, 20, 30].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => handleScoreAdjust(index, amount)}
                                                className="bg-green-500 text-white p-2 rounded-md"
                                            >
                                                +{amount}
                                            </button>
                                        ))}
                                        {[10, 20, 30].map((amount) => (
                                            <button
                                                key={-amount}
                                                onClick={() => handleScoreAdjust(index, -amount)}
                                                className="bg-red-500 text-white p-2 rounded-md"
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
                <div className="w-1/5 flex flex-col">
                    <div className="bg-gray-300 text-center font-bold text-lg p-3 rounded-lg">
                        ROUND 1
                    </div>
                    {!isHost ? (
                        <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1 relative">
                            {getSortedPlayers().map((player) => (
                                <div
                                    key={player.index}
                                    className="player-item absolute w-full flex items-center"
                                    style={{
                                        top: `${player.position * 50}px`,
                                        transition: 'top 0.5s ease',
                                    }}
                                >
                                    <img
                                        src="https://via.placeholder.com/30"
                                        alt={player.username}
                                        className="w-8 h-8 rounded-full mr-2"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm">{player.username}</p>
                                        <div className="w-full bg-gray-200 text-center py-1 rounded-lg">
                                            Score: {player.score}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
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
            <button
                className="fixed bottom-6 right-6 bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? '✖' : '💬'}
            </button>
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