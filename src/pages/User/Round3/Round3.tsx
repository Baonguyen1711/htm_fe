import React, { useState, useEffect } from 'react';
import Play from '../../../layouts/Play';

const topics = [
    { name: "Xuân", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    { name: "Hạ", questions: ["Question 2.1", "Question 2.2", "Question 2.3", "Question 2.4", "Question 2.5", "Question 2.6", "Question 2.7", "Question 2.8", "Question 2.9", "Question 2.10", "Question 2.11", "Question 2.12", "Question 2.13", "Question 2.14", "Question 2.15"] },
    { name: "Thu", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    { name: "Đông", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    { name: "Cộng", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    { name: "Trừ", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    { name: "Nhân", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    { name: "Chia", questions: ["Question 1.1", "Question 1.2", "Question 1.3", "Question 1.4", "Question 1.5", "Question 1.6", "Question 1.7", "Question 1.8", "Question 1.9", "Question 1.10", "Question 1.11", "Question 1.12", "Question 1.13", "Question 1.14", "Question 1.15"] },
    // Add more topics as needed
];

const QuestionComponent: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [hiddenTopics, setHiddenTopics] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    const handleTopicSelect = (topic: string) => {
        setSelectedTopic(topic);
        setHiddenTopics((prev) => [...prev, topic]); // Add the selected topic to hidden list
        setCurrentQuestionIndex(0);
        setTimeLeft(10);
    };

    useEffect(() => {
        if (selectedTopic && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            const resetTimer = setTimeout(() => {
                setSelectedTopic(null);
            }, 3000); // Navigate back after 3 seconds
            return () => clearTimeout(resetTimer);
        }
    }, [timeLeft, selectedTopic]);

    const handleHostCommand = () => {
        setCurrentQuestionIndex((prevIndex) =>
            prevIndex < 14 ? prevIndex + 1 : prevIndex
        );
    };

    const currentQuestions = topics.find((topic) => topic.name === selectedTopic)?.questions;

    return (
        <div className="flex flex-col items-center">
            {!selectedTopic ? (
                <div className="grid grid-cols-4 gap-4">
                    {topics
                        .filter((topic) => !hiddenTopics.includes(topic.name)) // Hide already chosen topics
                        .map((topic) => (
                            <button
                                key={topic.name}
                                className="bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-700"
                                onClick={() => handleTopicSelect(topic.name)}
                            >
                                {topic.name}
                            </button>
                        ))}
                </div>
            ) : (
                <div className="w-full text-center">
                    <h2 className="text-xl font-bold">{selectedTopic}</h2>
                    <div className="my-4">
                        <p className="text-lg">
                            Time Left: <b>{timeLeft}s</b>
                        </p>
                        <p className="text-lg mt-2">
                            Question: {currentQuestions ? currentQuestions[currentQuestionIndex] : "No question available"}
                        </p>
                    </div>
                    {/* Simulated host control button for testing */}
                    <button
                        className="mt-4 bg-green-500 text-white p-2 rounded-lg"
                        onClick={handleHostCommand}
                    >
                        Show Next Question
                    </button>
                </div>
            )}
        </div>
    );
};

function Round3() {
    return (
        <Play questionComponent={<QuestionComponent />} />
    );
}

export default Round3;
