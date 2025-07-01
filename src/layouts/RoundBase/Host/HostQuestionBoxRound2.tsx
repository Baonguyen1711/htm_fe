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

const HostQuestionBoxRound2: React.FC<ObstacleQuestionBoxProps> = ({
    obstacleWord,
    hintWordArray,
    initialGrid,
    isSpectator = false,
    isHost = false,
}) => {
    const { startTimer, timeLeft, setTimeLeft, playerAnswerTime } = useTimeStart();
    const sounds = useSounds();
    const [searchParams] = useSearchParams();
    const { setInitialGrid, animationKey, setAnimationKey, playerAnswerRef, position, setAnswerList } = usePlayer();
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || ""
    const GRID_SIZE = 30;
    const [grid, setGrid] = useState<string[][]>([[]]);
    const [hintWords, setHintWords] = useState<WordObj[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question>()
    const [buzzedPlayer, setBuzzedPlayer] = useState<string>("");

    const [cellStyles, setCellStyles] = useState<
        Record<string, { background: string; textColor: string }>
    >({}); // Tracks background and text styles
    const [menu, setMenu] = useState<{
        visible: boolean;
        rowIndex?: number;
        colIndex?: number;
    }>({ visible: false });
    const [markedCharacters, setMarkedCharacters] = useState<Record<string, number[]>>({});
    const [highlightedCharacters, setHighlightedCharacters] = useState<Record<string, number[]>>({});
    const [showModal, setShowModal] = useState(false);
    const isInitialTimerMount = useRef(false)
    const menuRef = useRef<HTMLDivElement>(null);
    const { revealCells } = useGameListenersRound2({
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
            // submitAnswer(roomId, playerAnswerRef.current, position, playerAnswerTime)

            setAnimationKey((prev: number) => prev + 1);
        }
    }, [timeLeft]);


    const handleSuffleGrid = async () => {
        if (isHost && hintWordArray) {
            const result = await generateGrid(hintWordArray, 30)

            setHintWords(result.placementArray)
            setGrid(result.grid)

            const blankGrid = result.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) =>
                    result.grid[rowIndex][colIndex].includes("number") ? cell : // Keep "numberX"
                        (cell !== " " && cell !== "") ? "1" : "" // Non-empty to "1", empty stays ""
                )
            );
            setInitialGrid(blankGrid)

            // Host can see all text by default due to updated render logic
        }

    }

    // Handle number click to show menu
    const handleNumberClick = (rowIndex: number, colIndex: number) => {
        if (!isHost) return;
        setMenu({
            visible: true,
            rowIndex,
            colIndex,
        });
    };

    // Handle menu actions
    const handleMenuAction = (
        action: "open" | "correct" | "incorrect",
        rowIndex: number,
        colIndex: number,
        hintWordNumber: string
    ) => {
        revealCells(rowIndex, colIndex, action, hintWordNumber);
        setMenu({ visible: false });
    };

    // Handle cell click to reveal
    const handleCellClick = (rowIndex: number, colIndex: number) => {
        if (!isHost) return;
        revealCells(rowIndex, colIndex, "open");
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // Optionally clear buzzedPlayer if you want to reset it
        setBuzzedPlayer("");
        resetBuzz(roomId)
    };

    const handleOpenObstacle = async () => {
        if (!isHost || !hintWords || !hintWordArray) return;

        // Reveal all horizontal rows immediately
        for (const hintWord of hintWords) {
            revealCells(hintWord.x, hintWord.y, "all", hintWord.index.toString())
        }

        if (obstacleWord) {
            //await openObstacle(roomId, obstacleWord, pla)
        }
    }

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenu({ visible: false });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

export default HostQuestionBoxRound2