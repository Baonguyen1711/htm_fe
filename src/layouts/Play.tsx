import React, { useState, useEffect, ReactNode } from 'react';
import Header from './Header';
import { usePlayer } from '../context/playerContext';
import { User } from '../type';
import { addPlayerToRoom, listenToPlayers, listenToScores, listenToAnswers, listenToTimeStart } from '../services/firebaseServices';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getNextQuestion } from '../pages/Host/Test/service';
import { useHost } from '../context/hostContext';
import HostManagement from '../components/HostManagement';
import PlayerScore from '../components/PlayerScore';
import HostScore from '../components/PlayerAnswer';



interface PlayProps {
    questionComponent: ReactNode;
    isHost?: boolean;
    PlayerScore: ReactNode
    SideBar: ReactNode
}

interface Player {
    score: number;
    index: number;
    username: string;
    position: number;
}

const Play: React.FC<PlayProps> = ({ questionComponent, isHost = false, PlayerScore, SideBar }) => {

    const navigate = useNavigate()
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false)

    const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]);
    // const [playerFlashes, setPlayerFlashes] = useState(Array(playerScores.length).fill(""));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<string>("0")
    const { players, setPlayers, roomId, setRoomId, playersArray, setPlayerArray } = usePlayer()


    useEffect(() => {
        const unsubscribePlayers = listenToPlayers(roomId, (updatedPlayers) => {
            console.log("updatedPlayers", updatedPlayers)
            console.log("Object.keys(updatedPlayers)", Object.keys(updatedPlayers))
            console.log("Object.keys(updatedPlayers).length", Object.keys(updatedPlayers).length)
            if (updatedPlayers && Object.keys(updatedPlayers).length > 0) {
                const playersList = Object.values(updatedPlayers);
                setPlayerArray(playersList);
                localStorage.setItem("playerList", JSON.stringify(playersList));
                console.log("Updated localStorage:", localStorage.getItem("playerList"));
            } else {
                console.log("Skipping update: invalid updatedPlayers", updatedPlayers);
            }
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {
        const unsubscribeTimeStart = listenToTimeStart(roomId, (signal) => {
            if (signal === "START") {
                setIsRunning(true)
            }
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribeTimeStart();
        };
    }, []);

    // const simulateSocketScoreUpdate = () => {
    //     const playerIndex = Math.floor(Math.random() * playerScores.length);
    //     const scoreChange = Math.random() > 0.5 ? 10 : -10;
    //     console.log(`Simulated socket event: Player ${playerIndex + 1} score changed by ${scoreChange}`);

    //     setPlayerScores((prevScores) => {
    //         const newScores = [...prevScores];
    //         newScores[playerIndex] += scoreChange;
    //         return newScores;
    //     });
    //     triggerPlayerFlash(playerIndex, scoreChange > 0);
    // };

    // useEffect(() => {
    //     const socketInterval = setInterval(() => {
    //         simulateSocketScoreUpdate();
    //     }, 5000);
    //     return () => clearInterval(socketInterval);
    // }, []);

    // const triggerPlayerFlash = (index: number, isCorrect: boolean) => {
    //     const flashColor = isCorrect ? "flash-correct" : "flash-incorrect";
    //     setPlayerFlashes((prevFlashes) => {
    //         const newFlashes = [...prevFlashes];
    //         newFlashes[index] = flashColor;
    //         return newFlashes;
    //     });
    //     setTimeout(() => {
    //         setPlayerFlashes((prevFlashes) => {
    //             const newFlashes = [...prevFlashes];
    //             newFlashes[index] = "";
    //             return newFlashes;
    //         });
    //     }, 3000);
    // };

    useEffect(() => {
        if (isRunning) {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                // When timeLeft reaches 0, stop the timer and reset
                setIsRunning(false);
                setTimeLeft(30);
            }
        }
    }, [isRunning, timeLeft]); // Add timeLeft to dependencies

    // const handleScoreAdjust = (index: number, amount: number) => {
    //     setPlayerScores((prevScores) => {
    //         const newScores = [...prevScores];
    //         newScores[index] += amount;
    //         return newScores;
    //     });
    //     triggerPlayerFlash(index, amount > 0);
    // };

    // const handleNextQuestion = async () => {
    //     setCurrentQuestionIndex((prev)=>(parseInt(prev)+1).toString())
    //     const question = await getNextQuestion(testName,currentQuestionIndex,currentRound,hostRoomId)
    //     console.log(question)
    //     alert('Moving to the next question!');
    // };

    // const getSortedPlayers = (): Player[] => {
    //     return playerScores
    //         .map((score, index) => ({ score, index, username: `Player ${index + 1}`, position: index }))
    //         .sort((a, b) => b.score - a.score)
    //         .map((player, rank) => ({ ...player, position: rank }));
    // };

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
                    {PlayerScore}

                </div>
                <div className="w-1/5 flex flex-col">
                    <div className="bg-gray-300 text-center font-bold text-lg p-3 rounded-lg">
                        ROUND 1
                    </div>
                    {SideBar}
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