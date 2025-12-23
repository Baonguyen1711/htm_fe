import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import MultipleChoice from '../../components/ui/MultipleChoice';
import useGameApi from '../../shared/hooks/api/useGameApi';
import useTestApi from '../../shared/hooks/api/useTestApi';
import { Question } from '../../shared/types';
import { set } from 'firebase/database';
import Header from '../../components/ui/Header';
import { Button } from '../../shared/components/ui';
import LinkPreviewPanel from '../../components/ui/LinkPreviewPanel';


const PrivatePractice: React.FC = () => {
    const { getQuestionByRound } = useGameApi();
    const { getRandomQuestions, getTestContent } = useTestApi();
    const [selectedChoice, setSelectedChoice] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [practiceTest, setPracticeTest] = useState<{
        question: string;
        choices: {
            position: string;
            content: string;
        }[];
        answer: string;
    }[]>([]);

    const [correctAnswers, setCorrectAnswers] = useState<Record<number, string>>({});

    const [testData, setTestData] = useState<{
        round_1: any[];
        round_2: any[];
        round_3: Record<string, any>;
        round_4: Record<string, any>;
        turn: any[];
        multiplayer: any[];
    }>({
        round_1: [],
        round_2: [],
        round_3: {},
        round_4: {},
        turn: [],
        multiplayer: [],
    });

    const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);


    const handleSelectChoice = (questionIndex: number, choice: string) => {
        setSelectedChoice((prev) => ({
            ...prev,
            [questionIndex]: choice,
        }));
    }

    const createPracticeTest = async () => {
        const result = await getRandomQuestions(5);
        console.log("random questions", result);

        const randomTestName = result.testName;
        const data = await getTestContent(randomTestName);
        setTestData(data)
        setIsLoading(false);

        const questionData = Array.isArray(data.multiplayer)
            ? data.multiplayer.filter((q: Question) => q.round === "MULTIPLAYER")
            : [];

        console.log("question data for practice", questionData);

        const formattedQuestions = questionData.map((question: Question) => ({
            question: question.question,
            choices: [
                { position: "A", content: question.answerA },
                { position: "B", content: question.answerB },
                { position: "C", content: question.answerC },
                { position: "D", content: question.answerD },
            ],
            answer: question.answer,
        }));



        setPracticeTest(formattedQuestions);

        const testId = result.testId;
        localStorage.setItem(`testId`, testId);
    }

    const handleCreateNewPracticeTest = async () => {
        setIsLoading(true);
        setSelectedChoice({});
        await createPracticeTest();
    }

    useEffect(() => {
        const getQuestions = async () => {
            createPracticeTest();
        };

        getQuestions();
    }, []);


    return (
        <div className="relative  min-h-screen"
            style={{
                zoom: "0.75",
            }}
        >
            {/* Ocean/Starry Night Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
                {/* Stars overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
                {/* Ocean waves effect */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
                {/* Subtle animated waves */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col min-h-full">

                <Header isHost={false} />
                <div className="flex flex-1 p-4 gap-4">
                    <div className="w-full lg:w-4/5 flex flex-col">


                        {/* Question component with ocean-themed styling */}
                        <div
                            className={`bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl flex-1 p-6 mb-4 h-full min-h-[500px] overflow-y-auto`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-white text-2xl">Loading practice questions...</p>
                                </div>
                            ) : (
                                Array.isArray(practiceTest) &&
                                practiceTest.map((question, index) => (
                                    <div
                                        key={index}
                                        className="mb-10 pb-6 border-b border-blue-400/20 last:border-none last:mb-0 last:pb-0"
                                        onClick={() => {
                                            console.log("question", question)
                                            const apiQuestion = testData.multiplayer[index];
                                            console.log("apiQuestion", apiQuestion)
                                            setSelectedLinks(apiQuestion?.referenceLink ?? []);
                                            setSelectedQuestionIndex(index);
                                        }}
                                    >
                                        {/* Question text */}
                                        <div className="mb-4">
                                            <h2 className="text-xl font-semibold text-white mb-2">
                                                Question {index + 1}
                                            </h2>
                                            <p className="text-lg text-blue-100">{question.question}</p>
                                        </div>

                                        {/* Choices */}
                                        <MultipleChoice
                                            choices={question.choices}
                                            selectedChoice={selectedChoice[index]}
                                            correctAnswer={question.answer}
                                            onChoiceClick={(choice) => handleSelectChoice(index, choice)}
                                            isPrivatePractice={true}
                                        />

                                        {selectedQuestionIndex === index && testData.multiplayer[index]?.keyIdea && (
                                            <div className="mt-4 flex justify-end">
                                                                                                    <div className="flex flex-wrap gap-2">
                                                        {testData.multiplayer[index].keyIdea.map((k: string, i: number) => (
                                                            <div
                                                                key={i}
                                                                className="
                            bg-blue-500/10 border border-blue-400/30
                            text-blue-200 px-3 py-1 
                            rounded-md text-xs 
                            shadow-sm
                        "
                                                            >
                                                                {k}
                                                            </div>
                                                        ))}
                                                    </div>
                                            </div>
                                        )}

                                    </div>
                                ))
                            )}
                        </div>


                    </div>

                    <div className="hidden lg:block w-1/5 bg-slate-900/60 backdrop-blur-md rounded-xl border border-blue-400/30 overflow-y-auto p-2">
                        <LinkPreviewPanel links={selectedLinks} />
                    </div>
                </div>

                <Button
                    onClick={handleCreateNewPracticeTest}
                    variant="primary"
                    size="lg"
                    className="font-medium shadow-lg"
                >
                    Tạo câu hỏi luyện tập mới
                </Button>
            </div>

        </div>
    );
};



export default PrivatePractice;
