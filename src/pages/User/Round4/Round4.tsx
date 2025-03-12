import React, { useState } from 'react';
import Play from '../../../layouts/Play';

interface QuestionComponentProps {
    initialGrid: string[][]; // 5x5 grid (can be passed from parent or generated)
    questions: string[]; // Array of questions for testing
}

const exampleGrid = [
    ['!', '', '?', '', '!'],
    ['', '?', '!', '', '?'],
    ['?', '', '', '!', '?'],
    ['!', '?', '', '', '!'],
    ['?', '!', '', '?', ''],
];

// Example questions for testing
const exampleQuestions = [
    'Question 1', 'Khi Quân đội Nhân dân Việt Nam mở chiến dịch lớn ở Cánh đồng Chum tại Lào, Đại tướng Lê Trọng Tấn đã có một câu nói nổi tiếng: “Đánh trận này, ba đời sau … còn sợ!”. Trong dấu … là gì?', 'Question 3', 'Question 4', 'Question 5',
    'Question 6', 'Question 7', 'Question 8', 'Question 9', 'Question 10',
    'Question 11', 'Question 12', 'Question 13', 'Question 14', 'Question 15',
    'Question 16', 'Question 17', 'Question 18', 'Question 19', 'Question 20',
    'Question 21', 'Question 22', 'Question 23', 'Question 24', 'Question 25',
];

const QuestionComponent: React.FC<QuestionComponentProps> = ({ initialGrid, questions }) => {
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [gridColors, setGridColors] = useState<string[][]>(
        Array(5).fill(Array(5).fill('#FFFFFF')) // Default grid colors are white
    );

    // Function to handle cell click
    const handleCellClick = (row: number, col: number) => {
        const questionIndex = row * 5 + col; // Calculate question index from grid position
        if (questions[questionIndex]) {
            setSelectedQuestion(questions[questionIndex]);
        }
    };

    // Simulated host function to set color for a specific cell (yellow background)
    const highlightCellFromHost = (row: number, col: number) => {
        setGridColors((prev) => {
            const newGrid = [...prev];
            newGrid[row][col] = '#FFFF99'; // Set the cell's color to light yellow
            return newGrid;
        });
    };

    return (
        <div className="flex flex-col items-center">
            {/* Display selected question */}
            <h2 className="text-xl font-bold text-black mb-4">
                {selectedQuestion ? `Question: ${selectedQuestion}` : 'Select a cell to view a question'}
            </h2>

            {/* Column labels (1, 2, 3, 4, 5) */}
            <div className="grid grid-cols-6 gap-2 mb-2">
                <div></div> {/* Empty corner cell */}
                {['1', '2', '3', '4', '5'].map((label) => (
                    <div key={label} className="flex items-center justify-center font-bold text-black w-16 h-16">
                        {label}
                    </div>
                ))}
            </div>

            {/* Render 5x5 grid with row labels (A, B, C, D, E) */}
            <div className="grid grid-rows-5 gap-2">
                {['A', 'B', 'C', 'D', 'E'].map((rowLabel, rowIndex) => (
                    <div key={rowIndex} className="flex">
                        <div className="flex items-center justify-center font-bold text-black w-16 h-16">
                            {rowLabel} {/* Row label */}
                        </div>
                        {initialGrid[rowIndex].map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className="flex items-center justify-center w-16 h-16 rounded-md cursor-pointer"
                                style={{
                                    backgroundColor: gridColors[rowIndex][colIndex],
                                    border: '1px solid #000',
                                }}
                            >
                                <span className="text-black text-lg">{cell}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Example component integrating QuestionComponent
function Round4() {
    return (
        <Play questionComponent={<QuestionComponent initialGrid={exampleGrid} questions={exampleQuestions} />} />
    );
}

export default Round4;
