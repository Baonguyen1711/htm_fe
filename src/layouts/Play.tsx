import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import Header from './Header';
import { usePlayer } from '../context/playerContext';
import { Answer, User } from '../type';
import { addPlayerToRoom, listenToPlayers, listenToScores, listenToAnswers, listenToTimeStart, listenToBroadcastedAnswer, setupOnDisconnect, listenToRoundStart } from '../services/firebaseServices';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { submitAnswer } from './services';
import { getNextQuestion } from '../pages/Host/Test/service';
import { useHost } from '../context/hostContext';
import HostManagement from '../components/HostManagement';
import PlayerScore from '../components/PlayerScore';
import HostScore from '../components/PlayerAnswer';
import { setCurrentPacketQuestion } from '../components/services';
import { useTimeStart } from '../context/timeListenerContext';



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
    const playerAnswerRef = useRef("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem("userId"))
    const [params] = useSearchParams()
    const round = params.get("round") || "1"


    const [isRunning, setIsRunning] = useState(false)
    //const [playerAnswer, setPlayerAnswer] = useState<string>("")


    // const [playerFlashes, setPlayerFlashes] = useState(Array(playerScores.length).fill(""));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<string>("0")
    const [startedListening, setStartedListening] = useState<boolean>(false)
    const { players, setPlayers, roomId, setRoomId, playersArray, setPlayerArray, position, setCurrentQuestion, selectedTopic, setSelectedTopic, setScoreList } = usePlayer()
    const { playerScores, setPlayerScores } = useHost()
    const isMounted = useRef(false);
    const { timeLeft, startTimer } = useTimeStart();
    const [searchParams] = useSearchParams();



    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const inputElement = event.target as HTMLInputElement; // Type assertion
            console.log("inputElement.value", inputElement.value)
            playerAnswerRef.current = inputElement.value
            inputElement.value = ""; // Clears input field
        }
    };
    // const startTimer = useCallback(() => {
    //     let timer: NodeJS.Timeout;

    //     timer = setInterval(() => {
    //         setTimeLeft(prev => {
    //             if (prev <= 1) {
    //                 clearInterval(timer);
    //                 if (round === "3") {
    //                     setCurrentPacketQuestion(roomId, 1)
    //                     setCurrentQuestion("")
    //                     setSelectedTopic(null)
    //                     localStorage.removeItem("questions")
    //                 }
    //                 if (!isHost && round !== "3") {
    //                     submitAnswer(roomId, playerAnswerRef.current, position)
    //                 }
    //                 return 30;
    //             }
    //             return prev - 1;
    //         });
    //     }, 1000);

    //     return () => clearInterval(timer);
    // }, [isHost, position, roomId, round, setCurrentPacketQuestion, setCurrentQuestion, setSelectedTopic]);
    // const isInitialMount = true;
    // useEffect(() => {
    //     if (isInitialMount) return

    //     // Start timer when selectedTopic changes
    //     startTimer(30);

    //     // Side effects based on timer reaching 0
    // }, []);

    // useEffect(() => {
    //     console.log("timeLeft", timeLeft);

    //     if (timeLeft === 0) {
    //         // When timer runs out, do your clean up / game logic:
    //         submitAnswer(roomId, playerAnswerRef.current, position)
    //         // If you want to reset timer, call startTimer again here or leave stopped
    //     }
    // }, [timeLeft]);
    // useEffect(() => {
    //     console.log("timeLeft on play", timeLeft)
    // }, [timeLeft]);

    useEffect(() => {
        if (!roomId || !userId) return;

        // Setup onDisconnect to remove user from room when connection lost
        const cancelOnDisconnect = setupOnDisconnect(roomId, userId);

        return () => {
            // Optional: cancel onDisconnect if component unmounts normally
            cancelOnDisconnect();
        };
    }, [roomId, userId]);

    useEffect(() => {
        const unsubscribePlayers = listenToPlayers(roomId, (updatedPlayers) => {
            console.log("updatedPlayers", updatedPlayers)
            console.log("Object.keys(updatedPlayers)", Object.keys(updatedPlayers))
            console.log("Object.keys(updatedPlayers).length", Object.keys(updatedPlayers).length)
            if (updatedPlayers && Object.keys(updatedPlayers).length > 0) {
                const playersList = Object.values(updatedPlayers);
                const initialScoreList = [...playersList]
                if (round === "1") {
                    for (var score of initialScoreList) {
                        score["score"] = "0";
                        score["isCorrect"] = false;
                        score["isModified"] = false
                    }
                    console.log("initialScoreList", initialScoreList);
                    setScoreList(initialScoreList)
                    setPlayerScores(initialScoreList)
                }


                setPlayerArray(playersList);
                localStorage.setItem("playerList", JSON.stringify(playersList));
                console.log("Updated localStorage:", localStorage.getItem("playerList"));
            } else {
                console.log("Room is empty or players node deleted");
                setPlayerArray([]); // Clear state
                localStorage.removeItem("playerList"); // Clear localStorage
            }
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, [round]);


    // useEffect(() => {

    //     let timerCleanup: (() => void) | undefined;
    //     const unsubscribeTimeStart = listenToTimeStart(roomId, startTimer);
    //     console.log("listening on time start");


    //     return () => {
    //         unsubscribeTimeStart();
    //         if (timerCleanup) timerCleanup();
    //     };
    // }, [roomId]);


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
                    {/* {!isHost && (
                        <div className="mt-2 w-full">
                            <input
                                type="text"
                                className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg text-center"
                                placeholder="Type your answer..."
                                onKeyDown={handleKeyDown}
                            // value={playerAnswer} 
                            // onChange={(e) => setPlayerAnswer(e.target.value)}
                            />
                            <p className="mt-2 text-lg">{playerAnswerRef.current && `Your answer: ${playerAnswerRef.current}`}</p>
                        </div>
                    )} */}
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