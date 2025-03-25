import Play from "../Play";
import React, { useState, useEffect } from "react";
import { renderGrid } from "./utils";
import { RoundBase } from "../../type";

interface HintWord {
    word: string;
    x: number;
    y: number;
    direction: "horizontal" | "vertical";
}

interface ObstacleQuestionBoxProps {
    obstacleWord: string;
    isHost?: boolean; // Indicates if the user is the host
}

const mainKeyword = "VIETTEL"; // Main obstacle keyword

const QuestionBoxRound2: React.FC<ObstacleQuestionBoxProps> = ({ obstacleWord, isHost = false }) => {
    const GRID_SIZE = 20; // Grid size
    const generateEmptyGrid = () => {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""));
    };

    const [grid, setGrid] = useState<string[][]>(generateEmptyGrid());
    const [revealedRows, setRevealedRows] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
    const [revealedCols, setRevealedCols] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
    const [hintWords, setHintWords] = useState<HintWord[]>([]);

    // Randomize the grid when component is first mounted if the user is the host
    useEffect(() => {
        if (isHost) {
            const wordList = ["BƯUCHÍNH", "5G", "BQP", "TẬPĐOÀN", "HÀNỘI", "RED"];
            const { randomHintWords, newGrid } = renderGrid(wordList, mainKeyword, GRID_SIZE);

            setHintWords(randomHintWords);
            setGrid(newGrid);
        }
    }, [isHost]);

    // Host-only: Toggle reveal for a specific row
    const toggleRow = (rowIndex: number) => {
        if (!isHost) return; // Non-host users can't toggle rows
        setRevealedRows((prev) => {
            const newRevealed = [...prev];
            newRevealed[rowIndex] = !newRevealed[rowIndex];
            return newRevealed;
        });
    };

    // Host-only: Toggle reveal for a specific column
    const toggleCol = (colIndex: number) => {
        if (!isHost) return; // Non-host users can't toggle columns
        setRevealedCols((prev) => {
            const newRevealed = [...prev];
            newRevealed[colIndex] = !newRevealed[colIndex];
            return newRevealed;
        });
    };

    return (
        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-700 text-xl font-semibold text-center mb-4 max-w-[90%]">
                Trong các giải đấu thể thao, những đội hay vận động viên mạnh sẽ được xếp vào cùng một hoặc nhiều nhóm trong khi bốc thăm để tránh việc gặp nhau sớm. Tên gọi chung của các nhóm vận động viên này là gì?
            </div>
            <div className="grid grid-cols-[repeat(20,40px)] grid-rows-[repeat(20,40px)] gap-1 max-h-[400px] overflow-y-scroll">
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {row.map((cell, colIndex) => {
                            // Determine if a cell should be revealed
                            const isRevealed =
                                (revealedRows[rowIndex] &&
                                    hintWords.some(
                                        (word) => word.y === rowIndex && word.direction === "horizontal"
                                    )) ||
                                (revealedCols[colIndex] &&
                                    hintWords.some((word) => word.x === colIndex && word.direction === "vertical"));

                            return (
                                <div
                                    key={colIndex}
                                    className={`w-10 h-10 flex items-center justify-center text-lg font-semibold select-none 
                                        ${cell.includes("number") ? "text-blue-500 bg-white border-none" : ""}
                                        ${cell === "" ? "bg-white border-none" : "border-gray-400 bg-gray-50"} 
                                        ${
                                        // Reveal text if applicable
                                        !cell.includes("number") && isRevealed && !obstacleWord.includes(cell)
                                            ? "text-black"
                                            : !cell.includes("number")
                                                ? "text-transparent"
                                                : ""
                                        }
                                        ${obstacleWord.includes(cell) && isRevealed && isNaN(Number(cell)) ? "font-bold text-red-500" : ""}
                                    `}
                                    onClick={() => {
                                        // Allow toggling rows/cols only for the host
                                        if (isHost) {
                                            if (
                                                hintWords.some(
                                                    (word) => word.y === rowIndex && word.direction === "horizontal"
                                                )
                                            ) {
                                                toggleRow(rowIndex);
                                            } else if (
                                                hintWords.some(
                                                    (word) => word.x === colIndex && word.direction === "vertical"
                                                )
                                            ) {
                                                toggleCol(colIndex);
                                            }
                                        }
                                    }}
                                    style={{
                                        cursor:
                                            isHost &&
                                                hintWords.some((word) => word.y === rowIndex || word.x === colIndex)
                                                ? "pointer"
                                                : "default",
                                    }}
                                >
                                    {cell.includes("number") ? cell.replace("number", "").trim() : cell}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};



// const Round2: React.FC<RoundBase> = ({ isHost }) => {
//     return (
//         <Play
//             questionComponent={<ObstacleQuestionBox obstacleWord={mainKeyword} isHost={isHost}/>}
//             isHost={isHost}
//         />
//     );
// }

export default QuestionBoxRound2;
