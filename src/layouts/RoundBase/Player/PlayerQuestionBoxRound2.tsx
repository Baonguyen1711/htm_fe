import React, { useEffect, useRef, useState } from 'react'
import GameGridRound2 from '../../../components/ui/GameGridRound2'
import { useTimeStart } from '../../../context/timeListenerContext';
import { useSounds } from '../../../context/soundContext';
import { useSearchParams } from 'react-router-dom';
import { Question } from '../../../type';
import { submitAnswer } from '../../services';
import { generateGrid } from '../../../pages/User/Round2/utils';
import { openObstacle, resetBuzz} from '../../../components/services';
import { usePlayer } from '../../../context/playerContext';
import { useGameListenersRound2 } from '../../../hooks/useListenerRound2';


interface MatchPosition {
    x: number;
    y: number;
    dir: number;
}

interface WordObj {
    string: string;
    char: string[];
    totalMatches: number;
    effectiveMatches: number;
    successfulMatches: MatchPosition[];
    x: number;
    y: number;
    dir: number;
    index: number;
};


interface ObstacleQuestionBoxProps {
    obstacleWord?: string;
    hintWordArray?: string[];
    isHost?: boolean;
    initialGrid?: string[][];
    isSpectator?: boolean;
}

const PlayerQuestionBoxRound2: React.FC<ObstacleQuestionBoxProps> = ({
    obstacleWord,
    hintWordArray,
    initialGrid,
    isSpectator = false,
    isHost = false,
}) => {
    const { startTimer, timeLeft, setTimeLeft, playerAnswerTime } = useTimeStart();
    const sounds = useSounds();
    const [searchParams] = useSearchParams();
    const { setInitialGrid, animationKey, setAnimationKey, playerAnswerRef, position, setAnswerList, currentPlayerName, currentPlayerAvatar } = usePlayer();
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || ""
    const [grid, setGrid] = useState<string[][]>([[]]);
    const [hintWords, setHintWords] = useState<WordObj[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question>()
    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");
    const [markedCharacters, setMarkedCharacters] = useState<Record<string, number[]>>({});
    const [highlightedCharacters, setHighlightedCharacters] = useState<Record<string, number[]>>({});
    const [showModal, setShowModal] = useState(false);

    const [cellStyles, setCellStyles] = useState<
        Record<string, { background: string; textColor: string }>
    >({}); 
    const [menu, setMenu] = useState<{
        visible: boolean;
        rowIndex?: number;
        colIndex?: number;
    }>({ visible: false });
    
    const isInitialTimerMount = useRef(false)
    const menuRef = useRef<HTMLDivElement>(null);
    useGameListenersRound2({
        roomId,
        setBuzzedPlayer,
        setShowModal,
        setCurrentQuestion,
        startTimer,
        grid,
        setGrid,
        setAnswerList,
        setCellStyles,
        hintWords,
        setHintWords,
        setMarkedCharacters,
        setHighlightedCharacters,
        isHost,
        testName,
        hintWordArray,
        initialGrid,
        setInitialGrid,
        obstacleWord,
        setTimeLeft,
        sounds
    })
    useEffect(() => {
        console.log("timeLeft", timeLeft);
        if (isInitialTimerMount.current) {
            isInitialTimerMount.current = false;
            return;
        }
        if (timeLeft === 0) {
            submitAnswer(roomId, playerAnswerRef.current, position, playerAnswerTime, currentPlayerName, currentPlayerAvatar)

            setAnimationKey((prev: number) => prev + 1);
        }
    }, [timeLeft]);


    const handleSuffleGrid = async () => {

    }
    const handleNumberClick = () => {

    };

    const handleMenuAction = (
    ) => {
       
    };
    const handleCellClick = () => {

    };

    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        setBuzzedPlayer("");
        resetBuzz(roomId)
    };

    const handleOpenObstacle = async () => {

    }

    // Close menu on outside click

    return (
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4 relative">
            <div className="text-white text-xl font-semibold text-center mb-4 max-w-[90%]">
                {typeof currentQuestion?.question === "string"
                    ? currentQuestion.question
                    : ""}
            </div>
            <GameGridRound2
                grid={grid}
                cellStyles={cellStyles}
                hintWords={hintWords}
                obstacleWord={obstacleWord}
                menu={menu}
                menuRef={menuRef}
                isHost={true}
                isSpectator={isSpectator}
                showModal={showModal}
                buzzedPlayer={buzzedPlayer}
                currentQuestion={currentQuestion}
                onCellClick={handleCellClick}
                onNumberClick={handleNumberClick}
                onMenuAction={handleMenuAction}
                onOpenObstacle={handleOpenObstacle}
                onShuffleGrid={handleSuffleGrid}
                onCloseModal={handleCloseModal}

            />
        </div>
    )
}

export default PlayerQuestionBoxRound2