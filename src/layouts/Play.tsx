import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import Header from './Header';
import { usePlayer } from '../context/playerContext';
import { Answer, User } from '../type';
import { deletePath, addPlayerToRoom, listenToPlayers, listenToScores, listenToAnswers, listenToTimeStart, listenToBroadcastedAnswer, setupOnDisconnect, listenToRoundStart } from '../services/firebaseServices';
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

    const roundName = {
        "1": "NHỔ NEO",
        "2": "VƯỢT SÓNG",
        "3": "BỨT PHÁ",
        "4": "CHINH PHỤC",
    }
    const navigate = useNavigate()
    const playerAnswerRef = useRef("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem("userId"))
    const [params] = useSearchParams()
    const round = (params.get("round") as "1" | "2" | "3" | "4") || "1"
    const { players, setPlayers,  setRoomId, playersArray, setPlayerArray, position, setCurrentQuestion, selectedTopic, setSelectedTopic, setScoreList } = usePlayer()
    const { playerScores, setPlayerScores } = useHost()
    const isMounted = useRef(false);
    const { timeLeft, startTimer } = useTimeStart();


    const [searchParams] = useSearchParams();


    const currentRound = searchParams.get("round") || "1";
    const testName = searchParams.get("testName") || "1"
    const roomId = searchParams.get("roomId") || "";


    const handleRoundChange = async (delta: number) => {
        console.log("currentRound", currentRound)
        const newRound = parseInt(currentRound) + delta;
        console.log("new round", newRound)
        if (newRound >= 1 && newRound <= 4) { // limit to 1-4 rounds
            navigate(`?round=${newRound}&testName=${testName}&roomId=${roomId}`);
        }
        await deletePath(roomId, "questions");
        await deletePath(roomId, "answers");
    };


    useEffect(() => {
        if (!roomId || !userId) return;

        // Setup onDisconnect to remove user from room when connection lost
        const currentPlayer = JSON.parse(localStorage.getItem("currentPlayer") || "{}");  
        const cancelOnDisconnect = setupOnDisconnect(roomId, userId, currentPlayer);

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
                console.log("playersList", playersList);
                
                const initialScoreList = [...playersList]
                const scoreInitKey = `scoreInit_${roomId}_round1`;
                if (!localStorage.getItem(scoreInitKey)) {
                    for (var score of initialScoreList) {
                        score["score"] = "0";
                        score["isCorrect"] = false;
                        score["isModified"] = false
                    }
                    console.log("initialScoreList", initialScoreList);
                    setScoreList(initialScoreList)
                    setPlayerScores(initialScoreList)
                    localStorage.setItem(scoreInitKey, "true"); 
                }

                // const currentPlayer = playersList.find((player: any) => player.uid === userId);
                // const now = new Date().getTime();
                // if(currentPlayer.lastActive && (now - currentPlayer.lastActive) > 10) {
                //     return;
                // }
                
                setPlayerArray(playersList);
                localStorage.setItem("playerList", JSON.stringify(playersList));
                console.log("Updated localStorage:", localStorage.getItem("playerList"));
            } else {
                console.log("Room is empty or players node deleted");
                console.log("roomId", roomId);
                
                setPlayerArray([]); // Clear state
                localStorage.removeItem("playerList"); // Clear localStorage
            }
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);


    return (
        <div className="relative "
            style={{zoom: "0.75"}}
        >
            {/* Ocean/Starry Night Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
                {/* Stars overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
                {/* Ocean waves effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
                {/* Subtle animated waves */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col min-h-full">
                <Header />
                <div className="flex flex-1 p-4 gap-4">
                    <div className="w-full lg:w-4/5 flex flex-col">
                        {/* Progress bar with ocean theme */}
                        <div className="w-full h-3 bg-slate-700/50 rounded-full mb-4 border border-blue-400/30 shadow-lg">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full transition-all duration-1000 shadow-inner"
                                style={{ width: `${(timeLeft / 30) * 100}%` }}
                            ></div>
                        </div>

                        {/* Question component with ocean-themed styling */}
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4">
                            {questionComponent}
                        </div>

                        {/* Player score with ocean theme */}
                        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-xl">
                            {PlayerScore}
                        </div>
                    </div>

                    <div className="hidden lg:flex lg:w-1/5 flex-col gap-4">
                        {/* Round indicator with nautical theme */}
                        {isHost ? (
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-bold text-lg p-4 rounded-xl shadow-xl border border-blue-400/50">
                                <div className="text-sm opacity-90 mb-1">Vòng</div>
                                <div className="text-xl">{round ? roundName[round as keyof typeof roundName] : ""}</div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center gap-4 mb-6">
                                <button
                                    onClick={() => handleRoundChange(-1)}
                                    disabled={parseInt(currentRound) <= 1}
                                    className="text-2xl lg:text-3xl px-3 py-2 text-blue-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-blue-600/20"
                                >
                                    ←
                                </button>
                                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-bold text-lg lg:text-xl px-6 py-3 rounded-xl shadow-xl border border-blue-400/50">
                                    <span>{round ? roundName[round as keyof typeof roundName] : ""}</span>
                                </div>
                                <button
                                    onClick={() => handleRoundChange(1)}
                                    disabled={parseInt(currentRound) >= 4}
                                    className="text-2xl lg:text-3xl px-3 py-2 text-blue-200 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-blue-600/20"
                                >
                                    →
                                </button>
                            </div>
                        )}

                        {/* Sidebar with ocean theme */}
                        <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-xl p-4 flex-1">
                            {SideBar}
                        </div>
                    </div>
                </div>

                {/* Mobile round indicator */}
                <div className="lg:hidden mx-4 mb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-bold text-base p-3 rounded-xl shadow-xl border border-blue-400/50">
                        <span className="text-sm opacity-90">Vòng </span>
                        <span>{round ? roundName[round as keyof typeof roundName] : ""}</span>
                    </div>
                </div>

                {/* Chat button with ocean theme */}
                <button
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-2xl border-2 border-blue-400/50 hover:scale-110 transition-transform duration-200"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                >
                    <span className="text-xl">{isChatOpen ? "✖" : "💬"}</span>
                </button>

                {/* Modal with ocean theme */}
                {isModalOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <img
                            src="https://a.travel-assets.com/findyours-php/viewfinder/images/res70/474000/474240-Left-Bank-Paris.jpg"
                            alt="Full Size"
                            className="max-w-full max-h-full rounded-xl shadow-2xl"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};



export default Play;