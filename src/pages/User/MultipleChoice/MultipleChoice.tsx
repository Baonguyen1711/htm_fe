import React, { useEffect, useRef, useState } from 'react';
import User from '../../../layouts/User/User';
import MultipleChoiceQuestionBox from '../../../components/MultipleChoice/MultipleChoiceQuestionBox';
import { useSearchParams } from 'react-router-dom';
import useFirebaseListener from '../../../shared/hooks/firebase/useFirebaseListener';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import { Phase, Schedule } from '../../../shared/types/game.types';
import { setShowCountdown, setShowGameStartCountdown } from '../../../app/store/slices/gameSlice';
import { useSounds } from '../../../context/soundContext';
import { useNavigate } from 'react-router-dom';
import CountdownCard from '../../../components/ui/CountDownCard';

const UserMultipleChoice: React.FC = () => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const roomMode = searchParams.get("roomMode") || "multiplayer"
    const testName = searchParams.get("testName") || ""
    const navigate = useNavigate()
    const { listenToMultiplayerGameStart, listenToMultiplayerGamePause, listenToMultiplayerGameEnd } = useFirebaseListener()
    const { showGameStartCountdown } = useAppSelector(state => state.game)
    const [schedule, setSchedule] = useState<Schedule[]>([])
    const [currentQ, setCurrentQ] = useState<any | null>(null);

    // const currentQuestionNumberRef = useRef(currentQuestionNumber);
    const { currentCorrectAnswer } = useAppSelector(state => state.game)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0)
    const sounds = useSounds();
    const [phase, setPhase] = useState<
        "idle" | "countdown" | "reveal" | "active" | "ended"
    >("idle");
    const phaseRef = useRef<Phase>("idle");
    const dispatch = useAppDispatch()
    useEffect(() => {
        const unsubscribe = listenToMultiplayerGameStart(
            (data) => {
                if (!data) return
                // console.log("schedule", schedule)
                // setSchedule(data.schedule)
                dispatch(setShowGameStartCountdown(true))
            }
        )
        return () => {
            unsubscribe();
        };
    }, [])

    useEffect(() => {
        const unsubscribe = listenToMultiplayerGamePause(
            (data) => {
                console.log("pause", data)
                if (!data) return
                console.log("schedule", schedule)
                setSchedule([])
                const lobbyMusic = sounds["lobby_game"];
                if (lobbyMusic) {
                    console.log("lobbyMusic", lobbyMusic)
                    if (!lobbyMusic.paused) {
                        console.log("pause music")
                        lobbyMusic.pause();
                        lobbyMusic.currentTime = 0;
                    }
                }
            }
        )
        return () => {
            unsubscribe();
        };
    }, [])

    useEffect(() => {
        const unsubscribe = listenToMultiplayerGameEnd(
            (data) => {
                if (!data) return
                const lobbyMusic = sounds["lobby_game"];
                if (lobbyMusic) {
                    console.log("lobbyMusic", lobbyMusic)
                    if (!lobbyMusic.paused) {
                        console.log("pause music")
                        lobbyMusic.pause();
                        lobbyMusic.currentTime = 0;
                    }
                }
                navigate(`/play?round=final&roomId=${roomId}`)

            }
        )
        return () => {
            unsubscribe();
        };
    }, [])

    // useEffect(() => {
    //     if (!schedule || schedule.length === 0) return;

    //     const interval = setInterval(async () => {
    //         const now = Date.now();

    //         // Find the "active" question based on time
    //         const q = schedule.find(
    //             (item) => now >= item.countDownTime && now <= item.endTime
    //         );



    //         let recentQ = q;

    //         // If no active question, find the last one that has started already
    //         if (!recentQ) {
    //             recentQ = [...schedule].reverse().find(item => now >= item.startTime);
    //         }

    //         if (!recentQ) {
    //             // game hasn't started yet
    //             setPhase("idle");
    //             setCurrentQ(null);
    //             return;
    //         }

    //         setCurrentQ(recentQ);

    //         let newPhase: Phase;
    //         if (now < recentQ.revealTime) {
    //             newPhase = "countdown";
    //         } else if (now < recentQ.startTime) {
    //             newPhase = "reveal";
    //         } else if (now < recentQ.endTime) {
    //             newPhase = "active";
    //         } else {
    //             // we're past endTime of this question
    //             // ✅ keep "ended" until the next question’s countDownTime
    //             const nextQ = schedule.find(item => recentQ && item.countDownTime > recentQ.endTime);
    //             if (!nextQ || now < nextQ.countDownTime) {
    //                 newPhase = "ended";
    //             } else {
    //                 newPhase = "idle"; // waiting for the next question to enter countdown
    //             }
    //         }

    //         // Only run side effects when phase changes
    //         if (phaseRef.current !== newPhase) {
    //             phaseRef.current = newPhase;
    //             setPhase(newPhase);
    //             console.log("phaseRef.curren", phaseRef.current)

    //             switch (newPhase) {

    //                 case "countdown":
    //                     const lobbyMusic = sounds["lobby_game"];
    //                     if (lobbyMusic) {

    //                         if (lobbyMusic.paused) {
    //                             lobbyMusic.currentTime = 0;
    //                             lobbyMusic.loop = true;
    //                             lobbyMusic.play().catch((err) => console.log("Audio play failed:", err));
    //                         }
    //                     }
    //                     setTimeout(() => {
    //                         dispatch(setShowCountdown(true))
    //                     }, 2000)
    //                     break;

    //                 case "ended": {

    //                     const isLast = currentQuestionNumber === schedule[schedule.length-1].questionNumber;
    //                     console.log("currentQuestionNumber", currentQuestionNumber)
    //                     console.log("schedule", schedule)
    //                     console.log("schedule[schedule.length-1].questionNumber", schedule[schedule.length-1].questionNumber)
    //                     console.log("isLast", isLast)
    //                     if (isLast) {
    //                         console.log("last question")
    //                         const lobbyMusic = sounds["lobby_game"];
    //                         if (lobbyMusic && !lobbyMusic.paused) {
    //                             console.log("pause music")
    //                             console.log("lobby music", lobbyMusic)
    //                             lobbyMusic.pause();
    //                             lobbyMusic.currentTime = 0; // reset for next game
    //                         }
    //                     }
    //                     break;
    //                 }
    //                 default:
    //                     break;
    //             }
    //         }
    //     }, 200);

    //     return () => clearInterval(interval);
    // }, [schedule]);
    return (
        <>
            {/* <User
                QuestionComponent={<MultipleChoiceQuestionBox isHost={false} />}
            />
            {showGameStartCountdown && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <CountdownCard
                        startFrom={5}
                        message="Trận đấu bắt đầu sau"
                        onComplete={() => {
                            dispatch(setShowGameStartCountdown(false))

                        }}
                    />
                </div>
            )} */}
        </>
    )
};

export default UserMultipleChoice;
