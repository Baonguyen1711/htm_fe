import Play from "../Play";
import React, { useState, useEffect, useRef } from "react";
import { renderGrid } from "./utils";
import { usePlayer } from "../../context/playerContext";
import { setSelectedRow, setCorrectRow, setIncorectRow } from "../../components/services";
import { deletePath, listenToSound, listenToCorrectRow, listenToIncorrectRow, listenToSelectRow, listenToQuestions, listenToObstacle } from "../../services/firebaseServices";
import { useSearchParams } from "react-router-dom";
import { getNextQuestion } from "../../pages/Host/Test/service";
import { openObstacle } from "../../components/services";
import { generateGrid } from "../../pages/User/Round2/utils";
import PlayerAnswerInput from "../../components/ui/PlayerAnswerInput";
import { Question } from "../../type";
import { useSounds } from "../../context/soundContext";

interface HintWord {
  word: string;
  x: number;
  y: number;
  direction: "horizontal" | "vertical";
}



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

interface QuestionBoxProps {
  question: string;
  imageUrl?: string;
  isHost?: boolean
}

const mainKeyword = "BÒCÔNGANH";

const QuestionBoxRound2: React.FC<ObstacleQuestionBoxProps> = ({
  obstacleWord,
  hintWordArray,
  initialGrid,
  isSpectator = false,
  isHost = false,
}) => {
  console.log("initialGrid inside player", initialGrid);
  const sounds = useSounds();
  const [searchParams] = useSearchParams();
  const { setInitialGrid } = usePlayer();
  const roomId = searchParams.get("roomId") || "";
  const testName = searchParams.get("testName") || ""
  const GRID_SIZE = 30;

  const [grid, setGrid] = useState<string[][]>([[]]);
  const [hintWords, setHintWords] = useState<WordObj[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>()

  const [cellStyles, setCellStyles] = useState<
    Record<string, { background: string; textColor: string }>
  >({}); // Tracks background and text styles
  const [menu, setMenu] = useState<{
    visible: boolean;
    rowIndex?: number;
    colIndex?: number;
  }>({ visible: false });
  const [hintWordsLength, setHintWordsLength] = useState<number[]>([]);
  const [markedCharacters, setMarkedCharacters] = useState<Record<string, number[]>>({});
  const [highlightedCharacters, setHighlightedCharacters] = useState<Record<string, number[]>>({});

  const handleSuffleGrid = async () => {
    if (isHost && hintWordArray) {
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

  const menuRef = useRef<HTMLDivElement>(null);

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
          // Skip number cells to preserve their appearance
          console.log("grid[rowIndex][col]", grid[rowIndex][col])
          console.log("rowIndex", rowIndex);
          console.log("col", col);

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
                      console.log("obstacleWord", obstacleWord);
                      console.log("char", char);
                      console.log("obstacleWord.includes(char)", obstacleWord.includes(char));
                      console.log("i", i);
                      console.log("i-2", i - 2);



                      indexInTarget.push(i - 2)
                    }
                  }
                }
              if (hintWordArray && hintWordNumber) {
                console.log("hintWordNumber", hintWordNumber);
                console.log("hintWord", hintWord);
                console.log("hintWord.string.slice(2, hintWord.string.length-1)", hintWord.string.slice(2, hintWord.string.length - 1));
                console.log("indexInTarget", indexInTarget);
                console.log("encodeURIComponent(JSON.stringify(indexInTarget))", encodeURIComponent(JSON.stringify(indexInTarget)),);




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
          console.log("grid[row][colIndex]", grid[row][colIndex])
          console.log("colIndex", colIndex);
          console.log("row", row);
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
                      console.log("obstacleWord", obstacleWord);
                      console.log("char", char);
                      console.log("obstacleWord.includes(char)", obstacleWord.includes(char));
                      console.log("i", i);
                      console.log("i-2", i - 2);

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
          console.log("markedCharacterIndex", markedCharacterIndex);
          console.log("col", col);
          console.log("col-colIndex", col - colIndex - 1);

          console.log("markedCharacterIndex.includes(col)", markedCharacterIndex.includes(col - colIndex));



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
          console.log("markedCharacterIndex", markedCharacterIndex);
          console.log("col", row);
          console.log("row-rowIndex", row - rowIndex - 1);
          console.log("markedCharacterIndex.includes(col)", markedCharacterIndex.includes(row - rowIndex));
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
  // useEffect(() => {
  //   if (hintWordArray) {
  //     hintWordArray.forEach((word, index) => {
  //       console.log(`Word ${index}: '${word}' has length: ${word.length}`);
  //       console.log([...word]);
  //     });
  //     const lengthArray = hintWordArray.map((word) => word.length);
  //     setHintWordsLength(lengthArray);
  //   }
  // }, [hintWordArray]);



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

  useEffect(() => {
    const unsubscribePlayers = listenToQuestions(roomId, (question) => {
      setCurrentQuestion(question)
      console.log("current question", question)

    });

    // No need to set state here; it's handled by useState initializer
    return () => {
      unsubscribePlayers();
    };
  }, []);
  // Listen for "open" (select) signal
  useEffect(() => {
    let isInitialCall = true;
    const unsubscribeSelect = listenToSelectRow(roomId, (data) => {

      if (isInitialCall) {
        isInitialCall = false;
        return; // Skip the initial snapshot
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


  // Reveal cells in a row or column


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

  const handleOpenObstacle = async () => {
    if (!isHost || !hintWords || !hintWordArray) return;

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (Number.isFinite(Number(grid[row][col]))) {
          revealCells(row, col, "correct", grid[row][col])
        }
      }
    }
    if (obstacleWord) {

      await openObstacle(roomId, obstacleWord)
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
      <div className="grid grid-cols-[repeat(30,40px)] grid-rows-[repeat(30,40px)] gap-1 max-h-[750px] overflow-y-auto">

        {(!grid || !Array.isArray(grid) || !grid.every(row => Array.isArray(row))) ?
          <div className="text-white">Invalid grid data</div>
          :
          grid.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, colIndex) => {

                const cellKey = `${rowIndex}-${colIndex}`;
                const cellStyle = cellStyles[cellKey] || {
                  background: cell === "" || cell === " " ? "transparent" : "bg-white",
                  textColor: cell.includes("number") ? "text-blue-400" : "text-transparent",
                };

                const showMenu =
                  menu.visible &&
                  menu.rowIndex === rowIndex &&
                  menu.colIndex === colIndex &&
                  cell.includes("number");

                return (
                  <div className="relative w-10 h-10 flex items-center justify-center" key={colIndex}>
                    <div
                      className={`w-10 h-10 flex items-center justify-center text-lg font-semibold select-none rounded-lg
                  ${cell.includes("number") ? "text-blue-400 border-none" : ""}
                  ${cell.includes("number") ? "" : cellStyle.background}
                  ${cell.includes("number") ? "text-blue-400" : cellStyle.textColor}
                  ${obstacleWord?.includes(cell) &&
                          cellStyle.textColor === "text-black" &&
                          !cell.includes("number") &&
                          isNaN(Number(cell))
                          ? "font-bold text-red-400"
                          : ""}
                `}
                      onClick={() => {
                        if (isHost) {
                          if (cell.includes("number")) {
                            handleNumberClick(rowIndex, colIndex);
                          } else {
                            handleCellClick(rowIndex, colIndex);
                          }
                        }
                      }}
                      style={{
                        cursor:
                          isHost &&
                            (cell.includes("number") ||
                              hintWords.some((word) => word.y === rowIndex || word.x === colIndex))
                            ? "pointer"
                            : "default",
                      }}
                    >

                      {typeof cell === "string" || typeof cell === "number"
                        ? (cell.includes("number") ? cell.replace("number", "") : cell)
                        : ""}
                    </div>

                    {showMenu && (
                      <div
                        ref={menuRef}
                        className="absolute left-12 top-1/2 transform -translate-y-1/2 flex space-x-2 bg-slate-900 border border-blue-400/50 rounded shadow-lg p-1 z-10"
                      >
                        <button
                          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() =>
                            handleMenuAction("open", rowIndex, colIndex, cell.replace("number", ""))
                          }
                        >
                          SELECT
                        </button>
                        <button
                          className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                          onClick={() =>
                            handleMenuAction("correct", rowIndex, colIndex, cell.replace("number", ""))
                          }
                        >
                          Correct
                        </button>
                        <button
                          className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() =>
                            handleMenuAction("incorrect", rowIndex, colIndex, cell.replace("number", ""))
                          }
                        >
                          Incorrect
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
      </div>
      {
        !isSpectator && (
          <PlayerAnswerInput
            isHost={isHost}
            question={currentQuestion}
          />
        )
      }

      {
        isHost && (
          <div className="flex gap-2 mt-4 w-full">
            <button
              onClick={() => {
                alert('Mở cnv!')
                handleOpenObstacle()
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
            >
              Mở CNV
            </button>
            <button
              onClick={() => {
                handleSuffleGrid()
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
            >
              Xáo trộn hàng ngang
            </button>
          </div>
        )
      }
    </div>
  )
};

export default QuestionBoxRound2;