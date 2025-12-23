import React, { useEffect, useRef, useState } from 'react';
import Host from '../../../layouts/Host/Host';
import MultipleChoiceQuestionBox from '../../../components/MultipleChoice/MultipleChoiceQuestionBox';
import useFirebaseListener from '../../../shared/hooks/firebase/useFirebaseListener';
import useGameApi from '../../../shared/hooks/api/useGameApi';
import { useAppDispatch } from '../../../app/store';
import { useAppSelector } from '../../../app/store';
import { Schedule } from '../../../shared/types';
import { getQuestions, setShowGameStartCountdown } from '../../../app/store/slices/gameSlice';
import { useSearchParams } from 'react-router-dom';
import { Phase } from '../../../shared/types/game.types';
import { setShowCountdown } from '../../../app/store/slices/gameSlice';
import CountdownCard from '../../../components/ui/CountDownCard';
import PlayerScore from '../../../components/PlayerScore';
import HostRanking from '../../../components/HostRanking';
import { useNavigate } from 'react-router-dom';
import { setAnswersCount } from '../../../app/store/slices/gameSlice';
import { setPhase } from '../../../app/store/slices/gameSlice';

const HostMultipleChoice: React.FC = () => {
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || ""
    const testName = searchParams.get("testName") || ""
    const navigate = useNavigate()
    const { listenToMultiplayerGameStart, listenToMultiplayerGamePause, listenToMultiplayerGameEnd } = useFirebaseListener()
    const { currentQuestionNumber, showGameStartCountdown } = useAppSelector(state => state.game)
    //const [showGameStartCountDown, setShowGameStartCountDown] = useState(false)
    const [schedule, setSchedule] = useState<Schedule[]>([])
    const [currentQ, setCurrentQ] = useState<any | null>(null);

    const currentQuestionNumberRef = useRef(currentQuestionNumber);
    const dispatch = useAppDispatch()
    const { startTimer, sendCorrectAnswer } = useGameApi()
    // const [phase, setPhase] = useState<
    //     "idle" | "countdown" | "reveal" | "active" | "ended"
    // >("idle");
    const phaseRef = useRef<Phase>("idle");
    useEffect(() => {
        const unsubscribe = listenToMultiplayerGameStart(
            (data) => {
                if (!data) return
                console.log("schedule", schedule)
                setSchedule(data.schedule)

            }
        )
        return () => {
            unsubscribe();
        };
    }, [])

    useEffect(() => {
        const unsubscribe = listenToMultiplayerGamePause(
            (data) => {
                if (!data) return
                console.log("schedule", schedule)
                setSchedule([])

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
                navigate(`/host?round=final&roomId=${roomId}&testName=${testName}`)

            }
        )
        return () => {
            unsubscribe();
        };
    }, [])

    return (
        <>
            <Host
                QuestionComponent={<HostRanking />}
            />
            {/* {showGameStartCountdown && (
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

export default HostMultipleChoice;
