// hooks/Round2.ts
import { useEffect, useRef, Dispatch, SetStateAction, useState, useCallback } from 'react';
import { generateGrid } from '../../../shared/utils/round2.utils';
import { setCurrentQuestionNumber, setRound2Grid } from '../../../app/store/slices/gameSlice';
import { store, useAppDispatch, useAppSelector } from '../../../app/store';
import useGameApi from '../../../shared/hooks/api/useGameApi';

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

const GRID_SIZE = 30;

export function useRound2({
    roomId,
    grid,
    setCellStyles,
    setMarkedCharacters,
    setHighlightedCharacters,
    isHost,
    hintWordArray,
    obstacleWord,
}: {
    roomId: string;
    grid: string[][];
    isHost: boolean,
    obstacleWord?: string,
    hintWordArray?: string[],

    setShowModal: (value: boolean) => void;
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, { background: string; textColor: string }>>>,
    setMarkedCharacters: React.Dispatch<React.SetStateAction<Record<string, number[]>>>,
    setHighlightedCharacters: React.Dispatch<React.SetStateAction<Record<string, number[]>>>,
}) {
    const dispatch = useAppDispatch();
    const { round2Grid } = useAppSelector(state => state.game)
    const { sendRowAction } = useGameApi()
    const [hintWords, setHintWords] = useState<WordObj[]>([]);

    useEffect(()=> {
        console.log("grid for player", grid)
    },[grid])

    const generateInitialGrid = async (hintWordArray: any) => {
        const result = await generateGrid(hintWordArray, 30)
        console.log("board", result.grid);
        setHintWords(result.placementArray)
        const rowsIndex: {
            number: number,
            rowIndex: number,
            colIndex: number
        }[] = [];

        const blankGrid: string[][] = Array.from({ length: result.grid.length }, () => Array(result.grid.length).fill(""));

        result.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (result.grid[rowIndex][colIndex].includes("number")) {
                    blankGrid[rowIndex][colIndex] = cell
                    rowsIndex.push({
                        number: parseInt(cell.replace("number", "")),
                        rowIndex: rowIndex,
                        colIndex: colIndex
                    })
                } else {
                    console.log("cell", cell)
                    console.log("rowIndex", rowIndex)
                    console.log("colIndex", colIndex)
                    console.log("blankGrid[rowIndex][colIndex]", blankGrid[rowIndex][colIndex])
                    blankGrid[rowIndex][colIndex] = (cell !== " " && cell !== "") ? "1" : ""
                }
            })
        })

        const initialGrid = {
            grid: result.grid,
            blankGrid: blankGrid,
            rowsIndex: rowsIndex
        }

        dispatch(setRound2Grid(initialGrid))
    }

    useEffect(() => {
        const markedCharactersMap: Record<string, number[]> = {};
        const highlightedMap: Record<string, number[]> = {};

        if (hintWordArray) {
            for (const word of hintWordArray) {
                const presentArray: number[] = [];

                for (let i = 0; i < word.length; i++) {
                    if (obstacleWord?.includes(word[i])) {
                        presentArray.push(i);
                    }
                }

                markedCharactersMap[word] = presentArray;

                // Randomly pick up to 2 indices
                const shuffled = [...presentArray].sort(() => Math.random() - 0.5);
                highlightedMap[word] = shuffled.slice(0, 2);
            }

            setMarkedCharacters(markedCharactersMap);
            setHighlightedCharacters(highlightedMap);
        }
    }, [hintWordArray, obstacleWord]);

    const revealCells = async (
        rowIndex: number,
        colIndex: number,
        action: "open" | "correct" | "incorrect" | "all",
        hintWordNumber?: string
    ) => {
        console.log("isHost", isHost);
        console.log("revealCells called with action:", action, "hintWordNumber:", hintWordNumber);
        if (!isHost) return;

        console.log("abczy")
        const hintWordIndex = hintWordNumber ? parseInt(hintWordNumber) : -1;
        const hintWord = hintWords.find(
            (word) =>
                (word.index === hintWordIndex)
        );
        

        console.log("hintWord", hintWord);
        console.log("hintWords", hintWords);

        if (!hintWord) return;

        const isRow = hintWord.dir === 1;
        console.log(hintWord, "is", hintWord.dir);

        // remove the number and 2 space at 2 ends
        const wordLength = hintWord.string.length - 3;
        const startIndex = isRow ? colIndex + 1 : rowIndex + 1;

        let indexInTarget: number[] = []
        if (hintWordArray)
            for (let i = 2; i <= wordLength + 1; i++) {
                const char = hintWord.char[i];
                console.log("char", char)
                console.log("obstacleWord", obstacleWord)
                console.log("hintWordArray", hintWordArray)
                if (obstacleWord && obstacleWord.includes(char)) {
                    console.log("match at", i - 2)
                    console.log("indexInTarget before pushing", indexInTarget);
                    indexInTarget.push(i - 2)
                    console.log("indexInTarget after pushing", indexInTarget);
                }
            }

        console.log("Debug revealCells (hook):");
        console.log("- hintWord.string:", hintWord.string);
        console.log("- wordLength:", wordLength);
        console.log("- startIndex:", startIndex);
        console.log("- isRow:", isRow);
        console.log("- action:", action);

        dispatch(setRound2Grid({
            ...round2Grid,
            actionRowIndex: {
                rowIndex: rowIndex,
                colIndex: colIndex
            }
        }))

        setCellStyles((prev) => {
            const newStyles = { ...prev };
            if (isRow) {
                console.log(`Processing row from col ${startIndex} to ${startIndex + wordLength - 1} (hook)`);
                for (let col = startIndex; col < startIndex + wordLength; col++) {
                    if (col == GRID_SIZE) break
                    const key = `${rowIndex}-${col}`;
                    console.log(`Processing cell [${rowIndex}][${col}] = "${grid ? [rowIndex][col] : ""}", key: ${key} (hook)`);

                    if (round2Grid?.grid && !round2Grid?.grid[rowIndex][col].includes("number")) {
                        if (action === "open") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
                            // if (hintWordNumber) {
                            //     setSelectedRow(roomId, hintWordNumber, true, wordLength)
                            //     handleNextQuestion(testName, hintWordNumber.toString(), "2", roomId)
                            // }

                        } else if (action === "correct" || action === "all") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-black" };


                            // if (hintWordArray && hintWordNumber && action === "correct") {
                            //     setCorrectRow(roomId, hintWordNumber, hintWord.string.slice(2, hintWord.string.length - 1), encodeURIComponent(JSON.stringify(indexInTarget)), true, wordLength)
                            // }
                        } else if (action === "incorrect") {
                            newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
                            // if (hintWordNumber)
                            //     setIncorectRow(roomId, hintWordNumber, true, wordLength)
                        }
                    }
                }

            } else {
                for (let row = startIndex; row < startIndex + wordLength; row++) {
                    if (row == GRID_SIZE) break
                    const key = `${row}-${colIndex}`;

                    // Skip number cells to preserve their appearance
                    if (round2Grid?.grid && !round2Grid?.grid[row][colIndex].includes("number")) {
                        if (action === "open") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
                            // if (hintWordNumber) {
                            //     setSelectedRow(roomId, hintWordNumber, false, wordLength)
                            //     handleNextQuestion(testName, hintWordNumber.toString(), "2", roomId)
                            // }
                        } else if (action === "correct" || action === "all") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-black" };
                            if (hintWordArray)
                                for (let i = 2; i <= wordLength + 1; i++) {
                                    const char = hintWord.char[i];

                                    if (obstacleWord) {
                                        if (obstacleWord.includes(char)) {

                                            indexInTarget.push(i - 2)
                                        }
                                    }
                                }
                            // if (hintWordArray && hintWordNumber && action === "correct")
                            //     setCorrectRow(roomId, hintWordNumber, hintWord.string.slice(2, hintWord.string.length - 1), encodeURIComponent(JSON.stringify(indexInTarget)), false, wordLength)
                        } else if (action === "incorrect") {
                            newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
                            // if (hintWordNumber)
                            //     setIncorectRow(roomId, hintWordNumber, false, wordLength)
                        }
                    }
                }
            }
            return newStyles;
        });

        if (action === "correct" && hintWordNumber) {
            await sendRowAction(roomId, hintWordNumber, "CORRECT", wordLength, rowIndex, colIndex, hintWord.string.slice(2, hintWord.string.length - 1), JSON.stringify(indexInTarget), isRow)
        }

        if (action === "incorrect" && hintWordNumber) {
            await sendRowAction(roomId, hintWordNumber, "INCORRECT", wordLength, rowIndex, colIndex, undefined, undefined, isRow)
        }

        if (action === "open" && hintWordNumber) {
            dispatch(setCurrentQuestionNumber(Number(hintWordNumber)))
            await sendRowAction(roomId, hintWordNumber, "SELECT", wordLength, rowIndex, colIndex, undefined, undefined, isRow)
        }

        // if (action === "correct" || action === "incorrect") {
        //   setSelectedRow(roomId, isRow ? rowIndex.toString() : colIndex.toString());
        // }
    };

    const revealCellsForPlayer = useCallback((
            rowIndex: number,
            colIndex: number,
            action: "open" | "incorrect" | "correct",
            selectedRowNumber: string,
            markedCharacterIndex: number[],
            isRow?: boolean,
            wordLength?: number, // For open and incorrect
            correctAnswer?: string, // For correct
        ) => {
    
            if (isHost) return; // Ensure this runs only for players
            const currentRound2Grid = store.getState().game.round2Grid;
            console.log("currentRound2Grid?.grid", currentRound2Grid?.grid);
            console.log("round2Grid?.grid", round2Grid?.grid);
            console.log("revealCellsForPlayer called with action:", action, "selectedRowNumber:", selectedRowNumber);
            console.log("markedCharacterIndex", markedCharacterIndex);
            console.log("rowIndex", rowIndex);
            console.log("colIndex", colIndex);
            // Determine word length
            const length = action === "correct" ? correctAnswer?.length || 0 : wordLength || 0;
            console.log("length", length);
            if (length === 0) {
                console.warn(`No valid word length for row ${selectedRowNumber}`);
                return;
            }
            setCellStyles((prev) => {
                const newStyles = { ...prev };
                if (isRow) {
                    console.log("isRow", isRow);
                    console.log("colIndex", colIndex);
                    console.log("rowIndex", rowIndex);
                    console.log("round2Grid", round2Grid);
                    console.log("round2Grid?.grid", round2Grid?.grid);
                    // Horizontal: style cells from colIndex + 1 to colIndex + length
                    for (let col = colIndex + 1; col <= colIndex + length; col++) {
                        const key = `${rowIndex}-${col}`;
                        console.log("key", key);
                        console.log("col", col);
                        console.log("round2Grid?.grid[rowIndex][col]", currentRound2Grid?.grid ? [rowIndex][col] : null);
    
                        // Skip empty and number cells
                        if (currentRound2Grid?.grid && currentRound2Grid?.grid[rowIndex][col] !== "" && !currentRound2Grid?.grid[rowIndex][col]?.includes("number")) {
                            if (action === "open") {
                                newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
                            } else if (action === "incorrect") {
                                newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
                            } else if (action === "correct") {
                                console.log("markedCharacterIndex", markedCharacterIndex);
                                console.log("processing on cell", rowIndex, col - colIndex - 1);
                                newStyles[key] = {
                                    background: "bg-yellow-200",
                                    textColor: markedCharacterIndex && markedCharacterIndex.includes(col - colIndex - 1) ? "text-red-600" : "text-black"
                                };
                            }
                        }
                    }
                } else {
                    // Vertical: style cells from rowIndex + 1 to rowIndex + length
                    for (let row = rowIndex + 1; row <= rowIndex + length; row++) {
                        const key = `${row}-${colIndex}`;
    
                        // Skip empty and number cells
                        if (currentRound2Grid?.grid && currentRound2Grid?.grid[row][colIndex] !== "" && !currentRound2Grid?.grid[row][colIndex]?.includes("number")) {
                            if (action === "open") {
                                newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
                            } else if (action === "incorrect") {
                                newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
                            } else if (action === "correct") {
                                newStyles[key] = {
                                    background: "bg-yellow-200",
                                    textColor: markedCharacterIndex && markedCharacterIndex.includes(row - rowIndex - 1) ? "text-red-600" : "text-black"
                                };
                            }
                        }
                    }
                }
                return newStyles;
            });
    
            // For "correct", update grid to show the actual word
            if (action === "correct" && correctAnswer && grid) {
                const newGrid = currentRound2Grid?.grid?.map((row) => [...row]);
                if (isRow && newGrid) {
                    for (let col = colIndex + 1, i = 0; col <= colIndex + length && i < correctAnswer.length; col++, i++) {
                        newGrid[rowIndex][col] = correctAnswer[i];
                    }
                } else {
                    if (newGrid)
                        for (let row = rowIndex + 1, i = 0; row <= rowIndex + length && i < correctAnswer.length; row++, i++) {
                            newGrid[row][colIndex] = correctAnswer[i];
                        }
                }
    
                dispatch(setRound2Grid({
                    grid: newGrid
                }))
    
            }
        }, [round2Grid, isHost]) 
    

    return {
        revealCells, revealCellsForPlayer, generateInitialGrid
    }
}
