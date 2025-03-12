import Play from "../../../layouts/Play";
import React, { useState, useEffect } from "react";
import { renderGrid } from "./utils";

interface HintWord {
    word: string;
    x: number;
    y: number;
    direction: "horizontal" | "vertical";
}

interface ObstacleQuestionBoxProps {
    obstacleWord: string;
}

type PlacedWord = {
    word: string;
    x: number;
    y: number;
    direction: "horizontal" | "vertical";
};

// Từ khóa chướng ngại vật
const mainKeyword = "VIETTEL";


const ObstacleQuestionBox: React.FC<ObstacleQuestionBoxProps> = ({ obstacleWord }) => {

    // Increased grid size
    const GRID_SIZE = 20;

    const generateEmptyGrid = () => {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""));
    };
    const [isExpanded, setIsExpanded] = useState(false);
    const [grid, setGrid] = useState<string[][]>(generateEmptyGrid());
    const [revealedRows, setRevealedRows] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
    const [revealedCols, setRevealedCols] = useState<boolean[]>(Array(GRID_SIZE).fill(false));
    const [hintWords, setHintWords] = useState<HintWord[]>([]);

    useEffect(() => {
        const wordList = ["BƯUCHÍNH", "5G", "BQP", "TẬPĐOÀN", "HÀNỘI", "RED"];
        const {randomHintWords, newGrid} = renderGrid(wordList,mainKeyword, GRID_SIZE) 


        console.log("newGrid", newGrid)
        setHintWords(randomHintWords);
        setGrid(newGrid);
    }, []);

    // Hàm toggle hiển thị hàng/cột
    const toggleRow = (rowIndex: number) => {
        setRevealedRows((prev) => {
            const newRevealed = [...prev];
            newRevealed[rowIndex] = !newRevealed[rowIndex];
            return newRevealed;
        });
    };

    const toggleCol = (colIndex: number) => {
        setRevealedCols((prev) => {
            const newRevealed = [...prev];
            newRevealed[colIndex] = !newRevealed[colIndex];
            return newRevealed;
        });
    };

    return (
        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6">
            <div
                className={`text-gray-700 text-xl font-semibold text-center mb-4 max-w-[90%] ${isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden"
                    }`}
            >
                Trong các giải đấu thể thao, những đội hay vận động viên mạnh sẽ được xếp vào cùng một hoặc nhiều nhóm trong khi bốc thăm để tránh việc gặp nhau sớm. Tên gọi chung của các nhóm vận động viên này là gì?
            </div>
            <div className="grid grid-cols-[repeat(20,40px)] grid-rows-[repeat(20,40px)] gap-1 max-h-[400px] overflow-y-scroll">
                {/* Empty header for alignment */}
                {/* <div className="w-10 h-10 bg-white" /> */}
                {Array.from({ length: GRID_SIZE }).map((_, colIndex) => (
                    <div key={colIndex} className="w-10 h-10 bg-white" />
                ))}

                {/* Grid with numbers and cells */}
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {/* <div className="w-10 h-10 bg-white" />  */}
                        {row.map((cell, colIndex) => {

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
                                            // Chỉ áp dụng text-black/text-transparent nếu không phải các trường hợp đặc biệt
                                            !cell.includes("number") && isRevealed && !obstacleWord.includes(cell) 
                                                ? "text-black" 
                                                : !cell.includes("number") 
                                                    ? "text-transparent" 
                                                    : ""
                                        }
                                        ${obstacleWord.includes(cell) && isRevealed && isNaN(Number(cell)) ? "font-bold text-red-500" : ""}
                                `}
                                    onClick={() => {
                                        if (hintWords.some((word) => word.y === rowIndex && word.direction === "horizontal")) {
                                            toggleRow(rowIndex);
                                        } else if (hintWords.some((word) => word.x === colIndex && word.direction === "vertical")) {
                                            toggleCol(colIndex);
                                        }
                                    }}
                                    style={{
                                        cursor: hintWords.some((word) => word.y === rowIndex || word.x === colIndex)
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
function Round2() {
    return <Play questionComponent={<ObstacleQuestionBox obstacleWord={mainKeyword} />} />;
}

export default Round2;