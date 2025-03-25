import React from 'react'
import { useHost } from '../context/hostContext';
import { User } from '../type';

const HostManagement = () => {
    const { handleNextQuestion, handleShowAnswer, handleStartTime  } = useHost()
    return (
        <>
            <div className="bg-white mt-4 p-4 rounded-lg shadow-md flex-1">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => alert('Correct Answer!')}
                        className="bg-green-500 text-white p-2 flex-1 rounded-md"
                    >
                        Correct
                    </button>
                    <button
                        onClick={() => alert('Incorrect Answer!')}
                        className="bg-red-500 text-white p-2 flex-1 rounded-md"
                    >
                        Incorrect
                    </button>
                    <button
                        onClick={handleNextQuestion}
                        className="bg-yellow-500 text-black p-2 flex-1 rounded-md"
                    >
                        Next Question
                    </button>
                </div>
                <button
                    onClick={handleShowAnswer}
                    className="bg-blue-500 text-white w-full p-2 rounded-md mb-4"
                >
                    Show Answer
                </button>
                <button
                    onClick={handleStartTime}
                    className="bg-purple-500 text-white w-full p-2 rounded-md"
                >
                    Start Timer
                </button>
            </div>

        </>
    )
}

export default HostManagement