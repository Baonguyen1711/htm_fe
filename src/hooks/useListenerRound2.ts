// hooks/Round2.ts
import { useEffect, useRef } from 'react';
import { deletePath, listenToBuzzing, listenToStar, listenToSound, listenToAnswers, listenToQuestions, listenToSelectedCell, listenToCellColor, listenToTimeStart, listenToSelectRow, listenToIncorrectRow, listenToCorrectRow, listenToObstacle } from '../services/firebaseServices'; // adjust import path
import { Question } from '../type';
import { setCorrectRow, setIncorectRow, setSelectedRow } from '../components/services';
import { getNextQuestion } from '../pages/Host/Test/service';
import { generateGrid } from '../pages/User/Round2/utils';


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

export function useGameListenersRound2({
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
    sounds,
}: {
    roomId: string;
    grid: string[][];
    setBuzzedPlayer: (name: string) => void;
    setShowModal: (value: boolean) => void;
    setCurrentQuestion: (question: Question) => void;
    sounds: Record<string, HTMLAudioElement>;
    hintWords: WordObj[],
    isHost: boolean,
    testName: string,
    obstacleWord?: string,
    setCellStyles: React.Dispatch<React.SetStateAction<Record<string, { background: string; textColor: string }>>>,
    setAnswerList: React.Dispatch<React.SetStateAction<any>>,
    setGrid: React.Dispatch<React.SetStateAction<string[][]>>
    setInitialGrid: React.Dispatch<React.SetStateAction<string[][]>>,
    setHintWords: React.Dispatch<React.SetStateAction<WordObj[]>>,
    setMarkedCharacters: React.Dispatch<React.SetStateAction<Record<string, number[]>>>,
    setHighlightedCharacters: React.Dispatch<React.SetStateAction<Record<string, number[]>>>,
    hintWordArray?: string[],
    initialGrid?: string[][],
    startTimer?: (time: number) => void;
    setTimeLeft?: (time: number) => void;
}) {

    useEffect(() => {
        const generateInitialGrid = async () => {
          if (hintWordArray) {
            if (isHost) {
              console.log("hintWordArray", hintWordArray);
              console.log("obstacle", obstacleWord);
    
              const result = await generateGrid(hintWordArray, 30)
              console.log("board", result.grid);
              setHintWords(result.placementArray)
              setGrid(result.grid)
    
              const blankGrid = result.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) =>
                  result.grid[rowIndex][colIndex].includes("number") ? cell : // Keep "numberX"
                    (cell !== " " && cell !== "") ? "1" : "" // Non-empty to "1", empty stays ""
                )
              );
              setInitialGrid(blankGrid)
            }
          }
    
          if (initialGrid) {
            setGrid(initialGrid)
          }
        }
    
        generateInitialGrid()
      }, [hintWordArray, obstacleWord, initialGrid])


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

    const revealCells = (
        rowIndex: number,
        colIndex: number,
        action: "open" | "correct" | "incorrect",
        hintWordNumber?: string
    ) => {
        if (!isHost) return;

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

        const wordLength = hintWord.string.length - 3;
        const startIndex = isRow ? colIndex + 1 : rowIndex + 1;

        const handleNextQuestion = async (testName: string, hintWordIndex: string, round: string, roomId: string) => {
            await getNextQuestion(testName, hintWordIndex, round, roomId)
        }

        setCellStyles((prev) => {
            const newStyles = { ...prev };
            if (isRow) {
                for (let col = startIndex; col < startIndex + wordLength; col++) {
                    if (col == GRID_SIZE) break
                    const key = `${rowIndex}-${col}`;

                    if (!grid[rowIndex][col].includes("number")) {
                        if (action === "open") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
                            if (hintWordNumber) {
                                setSelectedRow(roomId, hintWordNumber, true, wordLength)
                                handleNextQuestion(testName, hintWordNumber.toString(), "2", roomId)
                            }
                        } else if (action === "correct") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-black" };
                            let indexInTarget = []
                            if (hintWordArray)
                                for (let i = 2; i <= wordLength + 1; i++) {
                                    const char = hintWord.char[i];

                                    if (obstacleWord) {
                                        if (obstacleWord.includes(char)) {
                                            indexInTarget.push(i - 2)
                                        }
                                    }
                                }
                            if (hintWordArray && hintWordNumber) {
                                setCorrectRow(roomId, hintWordNumber, hintWord.string.slice(2, hintWord.string.length - 1), encodeURIComponent(JSON.stringify(indexInTarget)), true, wordLength)
                            }
                        } else if (action === "incorrect") {
                            newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
                            if (hintWordNumber)
                                setIncorectRow(roomId, hintWordNumber, true, wordLength)
                        }
                    }
                }
            } else {
                for (let row = startIndex; row < startIndex + wordLength; row++) {
                    if (row == GRID_SIZE) break
                    const key = `${row}-${colIndex}`;

                    // Skip number cells to preserve their appearance
                    if (!grid[row][colIndex].includes("number")) {
                        if (action === "open") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
                            if (hintWordNumber) {
                                setSelectedRow(roomId, hintWordNumber, false, wordLength)
                                handleNextQuestion(testName, hintWordNumber.toString(), "2", roomId)
                            }
                        } else if (action === "correct") {
                            newStyles[key] = { background: "bg-yellow-200", textColor: "text-black" };
                            let indexInTarget = []
                            if (hintWordArray)
                                for (let i = 2; i <= wordLength + 1; i++) {
                                    const char = hintWord.char[i];

                                    if (obstacleWord) {
                                        if (obstacleWord.includes(char)) {

                                            indexInTarget.push(i - 2)
                                        }
                                    }
                                }
                            if (hintWordArray && hintWordNumber)
                                setCorrectRow(roomId, hintWordNumber, hintWord.string.slice(2, hintWord.string.length - 1), encodeURIComponent(JSON.stringify(indexInTarget)), false, wordLength)
                        } else if (action === "incorrect") {
                            newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
                            if (hintWordNumber)
                                setIncorectRow(roomId, hintWordNumber, false, wordLength)
                        }
                    }
                }
            }
            return newStyles;
        });

        // if (action === "correct" || action === "incorrect") {
        //   setSelectedRow(roomId, isRow ? rowIndex.toString() : colIndex.toString());
        // }
    };

    const revealCellsForPlayer = (
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

    // Determine word length
    const length = action === "correct" ? correctAnswer?.length || 0 : wordLength || 0;

    if (length === 0) {
      console.warn(`No valid word length for row ${selectedRowNumber}`);
      return;
    }

    setCellStyles((prev) => {
      const newStyles = { ...prev };
      if (isRow) {
        // Horizontal: style cells from colIndex + 1 to colIndex + length
        for (let col = colIndex + 1; col <= colIndex + length; col++) {
          const key = `${rowIndex}-${col}`;

          // Skip empty and number cells
          if (grid[rowIndex][col] !== "" && !grid[rowIndex][col]?.includes("number")) {
            if (action === "open") {
              newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
            } else if (action === "incorrect") {
              newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
            } else if (action === "correct") {
              newStyles[key] = {
                background: "bg-yellow-200",
                textColor: markedCharacterIndex.includes(col - colIndex - 1) ? "text-red-600" : "text-black"
              };
            }
          }
        }
      } else {
        // Vertical: style cells from rowIndex + 1 to rowIndex + length
        for (let row = rowIndex + 1; row <= rowIndex + length; row++) {
          const key = `${row}-${colIndex}`;

          // Skip empty and number cells
          if (grid[row][colIndex] !== "" && !grid[row][colIndex]?.includes("number")) {
            if (action === "open") {
              newStyles[key] = { background: "bg-yellow-200", textColor: "text-transparent" };
            } else if (action === "incorrect") {
              newStyles[key] = { background: "bg-gray-400", textColor: "text-transparent" };
            } else if (action === "correct") {
              newStyles[key] = {
                background: "bg-yellow-200",
                textColor: markedCharacterIndex.includes(row - rowIndex - 1) ? "text-red-600" : "text-black"
              };
            }
          }
        }
      }
      return newStyles;
    });

    // For "correct", update grid to show the actual word
    if (action === "correct" && correctAnswer) {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => [...row]);
        if (isRow) {
          for (let col = colIndex + 1, i = 0; col <= colIndex + length && i < correctAnswer.length; col++, i++) {
            newGrid[rowIndex][col] = correctAnswer[i];
          }
        } else {
          for (let row = rowIndex + 1, i = 0; row <= rowIndex + length && i < correctAnswer.length; row++, i++) {
            newGrid[row][colIndex] = correctAnswer[i];
          }
        }
        return newGrid;
      });
    }
  };
    const isInitialMount = useRef(false)
    useEffect(() => {
        const unsubscribe = listenToTimeStart(roomId, async () => {


            // Skip the timer setting on the first mount, but allow future calls to run
            if (isInitialMount.current) {
                isInitialMount.current = false;
                return;
            }
            startTimer?.(15)
            return () => {
                unsubscribe();

            };
        })

    }, [])
    useEffect(() => {

        let hasMounted = false;
        const unsubscribeBuzzing = listenToBuzzing(roomId, (playerName) => {
            // if (!hasMounted) {
            //     hasMounted = true; // skip initial
            //     return;
            // }
            const audio = sounds['buzz'];
            if (audio) {
                audio.play();
            }
            console.log("playerName on host", playerName);

            console.log("listening on buzzing");

            if (playerName && playerName !== "") {
                setBuzzedPlayer(playerName);
                console.log("playerName", typeof playerName);

                console.log(playerName, "đã bấm chuông")
                setShowModal(true); // Show modal when a player buzzes
            }
        });

        return () => {
            unsubscribeBuzzing();
        };
    }, [roomId]);


    useEffect(() => {
        const unsubscribePlayers = listenToSound(roomId, async (type) => {

            const audio = sounds[`${type}`];
            if (audio) {
                audio.play();
            }
            console.log("sound type", type)
            await deletePath(roomId, "sound")
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {

        const unsubscribePlayers = listenToQuestions(roomId, (data) => {
            console.log("questions", data);

            setCurrentQuestion(data.question)

        });

        return () => {
            unsubscribePlayers();
        };
    }, []);

    useEffect(() => {
        let isInitialCall = true;
        const unsubscribeSelect = listenToSelectRow(roomId, (data) => {

            if (isInitialCall) {
                isInitialCall = false;
                return; // Skip the initial snapshot
            }
            setAnswerList(null)

            let rowIndex = -1;
            let colIndex = -1;
            for (let row = 0; row < grid.length; row++) {
                for (let col = 0; col < grid[row].length; col++) {
                    if (grid[row][col] === `number${data.selected_row_number}`) {
                        rowIndex = row;
                        colIndex = col;
                        break;
                    }
                }
                if (rowIndex !== -1) break;
            }

            if (rowIndex === -1 || colIndex === -1) {
                console.warn(`Number cell number${data.selected_row_number} not found`);
                return;
            }

            revealCellsForPlayer(rowIndex, colIndex, "open", data.selected_row_number, [], data.is_row, data.word_length);
        });

        return () => {
            unsubscribeSelect();
        };
    }, [roomId, grid]);

    // Listen for "incorrect" signal
    useEffect(() => {
        let isInitialCall = true;
        const unsubscribeIncorrect = listenToIncorrectRow(roomId, (data) => {
            if (isInitialCall) {
                isInitialCall = false;
                return; // Skip the initial snapshot
            }

            const audio = sounds['wrong_2'];
            if (audio) {
                audio.play();
            }
            let rowIndex = -1;
            let colIndex = -1;
            for (let row = 0; row < grid.length; row++) {
                for (let col = 0; col < grid[row].length; col++) {
                    if (grid[row][col] === `number${data.selected_row_number}`) {
                        rowIndex = row;
                        colIndex = col;
                        break;
                    }
                }
                if (rowIndex !== -1) break;
            }

            if (rowIndex === -1 || colIndex === -1) {
                console.warn(`Number cell number${data.selected_row_number} not found`);
                return;
            }

            revealCellsForPlayer(rowIndex, colIndex, "incorrect", data.selected_row_number, [], data.is_row, data.word_length);
        });

        return () => {
            unsubscribeIncorrect();
        };
    }, [roomId, grid]);

    // Listen for "correct" signal
    useEffect(() => {
        let isInitialCall = true;
        const unsubscribeCorrect = listenToCorrectRow(
            roomId,
            (data) => {
                console.log("isInitialCall", isInitialCall);

                if (isInitialCall) {
                    isInitialCall = false;
                    return; // Skip the initial snapshot
                }

                const audio = sounds['correct_2'];
                if (audio) {
                    audio.play();
                }

                console.log("isInitialCall after", isInitialCall);
                let rowIndex = -1;
                let colIndex = -1;
                console.log("grid", grid);

                for (let row = 0; row < grid.length; row++) {
                    for (let col = 0; col < grid[row].length; col++) {
                        if (grid[row][col] === `number${data.selected_row_number}`) {
                            rowIndex = row;
                            colIndex = col;
                            break;
                        }
                    }
                    if (rowIndex !== -1) break;
                }

                if (rowIndex === -1 || colIndex === -1) {
                    console.warn(`Number cell number${data.selected_row_number} not found`);
                    return;
                }

                revealCellsForPlayer(rowIndex, colIndex, "correct", data.selected_row_number, data.marked_character_index, data.is_row, undefined, data.correct_answer);
            }
        );

        return () => {
            unsubscribeCorrect();
        };
    }, [roomId, grid]);

    useEffect(() => {
        const unsubscribePlayers = listenToObstacle(roomId, (obstacle) => {
            // setCurrentQuestion(question)
            // console.log("current question", question)
            const obstacleRevealed = {
                "question": obstacle
            }

            setCurrentQuestion(obstacleRevealed)
            for (let row = 0; row < grid.length; row++) {
                for (let col = 0; col < grid[row].length; col++) {
                    if (grid[row][col].includes("number")) {
                        revealCellsForPlayer(row, col, "correct", grid[row][col].replace("number", ""), [])
                    }
                }
            }
        });

        // No need to set state here; it's handled by useState initializer
        return () => {
            unsubscribePlayers();
        };
    }, []);

    return {
        revealCells, revealCellsForPlayer
    }
}
