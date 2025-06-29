import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';
import { deletePath, listenToTimeStart, listenToSound, listenToQuestions, listenToSelectedCell, listenToCellColor, listenToAnswers, listenToBuzzing, listenToStar } from '../../../services/firebaseServices';
import { useTimeStart } from '../../../context/timeListenerContext';
import { useSounds } from '../../../context/soundContext';
import { useGameListeners } from '../../../hooks/useListener';
import GameGrid from '../../../components/ui/GameGrid';
interface QuestionComponentProps {
    initialGrid: string[][]; // 5x5 grid (can be passed from parent or generated)
    questions: string[]; // Array of questions for testing
    isSpectator?: boolean; // Indicates whether the user is a spectator
    isHost?: boolean; // Indicates whether the user is the host
}

const PlayerQuestionBoxRound4: React.FC<QuestionComponentProps> = ({
    initialGrid,
    isSpectator,
}) => {
    const colorMap: Record<string, string> = {
        red: '#FF0000',
        green: '#00FF00',
        blue: '#0000FF',
        yellow: '#FFFF00',
    };
    const sounds = useSounds();
    const [grid, setGrid] = useState<string[][]>([[]])
    const { startTimer, timeLeft, setTimeLeft } = useTimeStart();
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<string>("")
    const [correctAnswer, setCorrectAnswer] = useState<string>("")
    const [gridColors, setGridColors] = useState<string[][]>(
        Array(5).fill(null).map(() => Array(5).fill('#FFFFFF')) // Default grid colors are white
    );
    const [menu, setMenu] = useState<{
        visible: boolean;
        rowIndex?: number;
        colIndex?: number;
    }>({ visible: false });
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams()
    const roomId = searchParams.get("roomId") || "4"
    const { setEasyQuestionNumber, setMediumQuestionNumber, setHardQuestionNumber, setLevel, animationKey, setAnimationKey } = usePlayer()
    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [staredPlayer, setStaredPlayer] = useState<string>("");
    const [showModal, setShowModal] = useState(false);
    const isInitialTimerMount = useRef(false)

    useEffect(() => {
        if (initialGrid) {
            console.log("received grid", initialGrid);
            
            setGrid(initialGrid)

        }
    }, [initialGrid])

    useGameListeners({
        roomId,
        setBuzzedPlayer,
        setStaredPlayer,
        setShowModal,
        setCorrectAnswer,
        setCurrentQuestion,
        setGridColors,
        setGrid,
        setSelectedCell,
        sounds,
        round: "4",
        startTimer
    }
    )
    useEffect(() => {
        console.log("timeLeft", timeLeft);
        if (isInitialTimerMount.current) {
            isInitialTimerMount.current = false;
            return;
        }
        if (timeLeft === 0) {
            setAnimationKey((prev: number) => prev + 1);
        }
    }, [timeLeft]);

    const isInitialMount = useRef(false)
    useEffect(() => {
        const unsubscribe = listenToTimeStart(roomId, async () => {


            // Skip the timer setting on the first mount, but allow future calls to run
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
            }
            startTimer(15)
            return () => {
                unsubscribe();

            };
        })

    }, [])

    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        setBuzzedPlayer("");
    };

    const handleCellClick = () => {

    };


    const handleMenuAction = () => {

    };

    return (
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-400/30 shadow-2xl p-6 mb-4 w-full max-w-3xl mx-auto min-h-[470px]">
            {/* Display selected question */}
            <h2 className="text-2xl font-bold text-cyan-200 mb-2 text-center drop-shadow">
                {currentQuestion || ""}
            </h2>
            {correctAnswer && (
                <h2 className="text-xl font-semibold text-green-300 mb-4 text-center drop-shadow">
                    {correctAnswer}
                </h2>
            )}

            <GameGrid
                initialGrid={grid}
                gridColors={gridColors}
                menu={menu}
                isHost={true}
                isSpectator={isSpectator}
                showModal={showModal}
                buzzedPlayer={buzzedPlayer}
                staredPlayer={staredPlayer}
                menuRef={menuRef}
                onCellClick={handleCellClick}
                onMenuAction={handleMenuAction}
                onCloseModal={handleCloseModal}
            />
        </div>
    );
};

export default PlayerQuestionBoxRound4;