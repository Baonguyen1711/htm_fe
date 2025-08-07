import React, { useCallback, useEffect, useRef, useState } from 'react'
import GameGridRound2 from './GameGridRound2';
import { useTimeStart } from '../../context/timeListenerContext';
import { useSounds } from '../../context/soundContext';
import { useSearchParams } from 'react-router-dom';
import { useRound2 } from '../../shared/hooks/round/useRound2';
import { useFirebaseListener } from '../../shared/hooks';
import FallBack from '../ui/Error/FallBack';
import { store, useAppDispatch, useAppSelector } from '../../app/store';
import { setCurrentCorrectAnswer, setRound2Grid } from '../../app/store/slices/gameSlice';
import QuestionAndAnswer from '../../components/ui/QuestionAndAnswer/QuestionAndAnswer';

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
    const { startTimer } = useTimeStart();
    const sounds = useSounds();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId") || "";

    //local state
    const [grid, setGrid] = useState<string[][]>([[]]);
    const [hintWords, setHintWords] = useState<WordObj[]>([]);
    const [markedCharacters, setMarkedCharacters] = useState<Record<string, number[]>>({});
    const [highlightedCharacters, setHighlightedCharacters] = useState<Record<string, number[]>>({});
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [isOpenAll, setIsOpenAll] = useState(false)

    const [cellStyles, setCellStyles] = useState<
        Record<string, { background: string; textColor: string }>
    >({});
    const [menu, setMenu] = useState<{
        visible: boolean;
        rowIndex?: number;
        colIndex?: number;
    }>({ visible: false });

    const menuRef = useRef<HTMLDivElement>(null);

    //global state
    const dispatch = useAppDispatch()
    const { currentQuestion, currentCorrectAnswer } = useAppSelector(state => state.game)


    //custom hook
    const { revealCellsForPlayer } = useRound2({
        roomId,
        grid,
        isHost: false,
        hintWordArray,
        obstacleWord,

        setShowModal,
        setCellStyles,
        setMarkedCharacters,
        setHighlightedCharacters,
    })

    //firebase listener
    const { listenToCorrectRow, listenToIncorectRow, listenToSelectRow, listenToObstacle, listenToRound2Grid, listenToBuzzedPlayer, listenToTimeStart, listenToSound, deletePath } = useFirebaseListener()

    useEffect(() => {
        const unsubscribe = listenToRound2Grid((grid) => {
            console.log("grid in question box", grid);
            if (grid) {
                dispatch(setRound2Grid({
                    grid: grid
                }))

                setIsLoading(false)
            }
        })
        return () => {
            unsubscribe();
        };
    }, [])

    useEffect(() => {
        const unsubscribe = listenToTimeStart(
            () => {
                const audio = sounds['timer_2'];
                if (audio) {
                    audio.play();
                }
                startTimer(15)
            }
        )
        return () => {
            unsubscribe();
        };

    }, [])

    useEffect(() => {
        const unsubscribeObstacle = listenToObstacle((data) => {
            const audio = sounds['correct_2'];
            if (audio) {
                audio.play();
            }
            console.log("obstacle", data)
            dispatch(setRound2Grid({
                grid: data.grid
            }))
            setCellStyles({})
            dispatch(setCurrentCorrectAnswer(data.obstacle))
            setIsOpenAll(true)
        })

        return () => {
            unsubscribeObstacle();
        };
    }, [])

    useEffect(() => {
        const unsubscribeCorrectRow = listenToCorrectRow((data) => {
            const audio = sounds['correct_2'];
            if (audio) {
                audio.play();
            }
            console.log("correct row", data)
            revealCellsForPlayer(data.selected_row_index, data.selected_col_index, "correct", data.selected_row_number, data.marked_character_index, data.is_row, data.word_length, data.correct_answer)
        })

        return () => {
            unsubscribeCorrectRow();
        };
    }, [])

    useEffect(() => {
        const unsubscribeSelectRow = listenToSelectRow((data) => {
            console.log("selected row", data)
            revealCellsForPlayer(data.selected_row_index, data.selected_col_index, "open", data.selected_row_number, data.index_in_target, data.is_row, data.word_length, data.correct_answer)
        })

        return () => {
            unsubscribeSelectRow();
        };
    }, [])

    useEffect(() => {
        const unsubscribeIncorrectRow = listenToIncorectRow((data) => {
            const audio = sounds['wrong_2'];
            if (audio) {
                audio.play();
            }
            revealCellsForPlayer(data.selected_row_index, data.selected_col_index, "incorrect", data.selected_row_number, data.index_in_target, data.is_row, data.word_length, data.correct_answer)
        })

        return () => {
            unsubscribeIncorrectRow();
        };
    }, [])



    const handleSuffleGrid = async () => {

    }
    const handleNumberClick = () => {

    };

    const handleMenuAction = (
    ) => {

    };

    const handleConfirmGrid = async () => {

    }




    const handleOpenObstacle = async () => {

    }

    // Close menu on outside click

    return (
        <div className="flex flex-col items-center bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-6 mb-4 relative">
            <QuestionAndAnswer
                currentQuestion={currentQuestion}
                currentCorrectAnswer={currentCorrectAnswer}
            />
            {isLoading ?
                <FallBack />
                : <GameGridRound2
                    cellStyles={cellStyles}
                    hintWords={hintWords}
                    obstacleWord={obstacleWord}
                    menu={menu}
                    menuRef={menuRef as React.RefObject<HTMLDivElement>}
                    isHost={false}
                    isOpenAll={isOpenAll}
                    isSpectator={isSpectator}
                    showModal={showModal}


                    onNumberClick={handleNumberClick}
                    onMenuAction={handleMenuAction}
                    onOpenObstacle={handleOpenObstacle}
                    onShuffleGrid={handleSuffleGrid}
                    onConfirmGrid={handleConfirmGrid}

                />}

        </div>


    )
}

export default PlayerQuestionBoxRound2