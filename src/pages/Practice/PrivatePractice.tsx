import React, { useState, useEffect } from 'react';
import MultipleChoice from '../../components/ui/MultipleChoice';
import useGameApi from '../../shared/hooks/api/useGameApi';
import useTestApi from '../../shared/hooks/api/useTestApi';
import { Question } from '../../shared/types';
import Header from '../../components/ui/Header';
import { Button } from '../../shared/components/ui';
import LinkPreviewPanel from '../../components/ui/LinkPreviewPanel';
import { RefreshCw, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';

const PrivatePractice: React.FC = () => {
    const { getRandomQuestions, getTestContent } = useTestApi();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false); // để hiện xanh đỏ ngay
    const [showLinkPanel, setShowLinkPanel] = useState<boolean>(false);

    const [practiceTest, setPracticeTest] = useState<{
        question: string;
        choices: { position: string; content: string }[];
        answer: string;
    }[]>([]);

    const [testData, setTestData] = useState<any>({ multiplayer: [] });
    const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

    const currentQuestion = practiceTest[currentQuestionIndex];
    const totalQuestions = practiceTest.length;

    const handleSelectChoice = (choice: string) => {
        setSelectedChoice(choice);
        setShowFeedback(true); // hiện xanh đỏ ngay lập tức
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedChoice(null);
            setShowFeedback(false);
            setShowLinkPanel(false);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setSelectedChoice(null);
            setShowFeedback(false);
            setShowLinkPanel(false);
        }
    };

    const handleToggleLinks = () => {
        if (!showLinkPanel && testData.multiplayer[currentQuestionIndex]?.referenceLink) {
            setSelectedLinks(testData.multiplayer[currentQuestionIndex].referenceLink);
        }
        setShowLinkPanel(prev => !prev);
    };

    const createPracticeTest = async () => {
        setIsLoading(true);
        const result = await getRandomQuestions(5);
        const data = await getTestContent(result.testName);
        setTestData(data);

        const questionData = Array.isArray(data.multiplayer)
            ? data.multiplayer.filter((q: Question) => q.round === "MULTIPLAYER")
            : [];

        console.log("question data", questionData)

        const formattedQuestions = questionData.map((question: Question) => ({
            question: question.question,
            choices: [
                { position: "A", content: question.answerA || "" },
                { position: "B", content: question.answerB || "" },
                { position: "C", content: question.answerC || "" },
                { position: "D", content: question.answerD || "" },
            ],
            answer: question.answer || "",
        }));

        setPracticeTest(formattedQuestions);
        setIsLoading(false);
        setCurrentQuestionIndex(0);
        setSelectedChoice(null);
        setShowFeedback(false);
        setShowLinkPanel(false);
    };

    const handleCreateNewPracticeTest = async () => {
        await createPracticeTest();
    };

    useEffect(() => {
        createPracticeTest();
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen bg-gradient-to-b from-cyan-900 via-blue-900 to-blue-950 flex items-center justify-center">
                <p className="text-4xl text-cyan-200 font-bold">Đang tải bộ câu hỏi luyện tập...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-b from-cyan-900 via-blue-900 to-blue-950 relative overflow-hidden">
            {/* Ocean background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1708864163871-311332fb9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHVuZGVyd2F0ZXIlMjBibHVlfGVufDF8fHx8MTc2NjQ4OTMzMnww&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center" />
            </div>

            {/* Floating bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white opacity-20 animate-float"
                        style={{
                            width: `${Math.random() * 30 + 10}px`,
                            height: `${Math.random() * 30 + 10}px`,
                            left: `${Math.random() * 100}%`,
                            bottom: `-50px`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 10 + 10}s`,
                        }}
                    />
                ))}
            </div>

            {/* Scale wrapper */}
            <div className="h-full w-full flex items-center justify-center overflow-auto py-8">
                <div
                    className="w-full h-auto min-h-full origin-center"
                    style={{ transform: "scale(0.92)", transformOrigin: "top center" }}
                >
                    <div className="relative z-10 flex flex-col min-h-screen">
                        {/* Header */}

                        <header className="relative z-20  from-cyan-900 via-blue-900 to-blue-950 border-b border-cyan-700/50">
                                  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                                        <img src="/images/magellan-logo.png" className="w-8 h-8 text-slate-900" ></img>
                                      </div>
                                      <div>
                                        <h1 className="text-2xl font-bold text-white">Hành Trình Magellan</h1>
                                        <p className="text-sm text-cyan-200">
                                          Chế độ luyện tập cá nhân
                                        </p>
                                      </div>
                                    </div>
                        
                                    <div className="flex items-center gap-6">
                                      <button
                                        onClick={handleCreateNewPracticeTest}
                                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                                      >
                                        <RefreshCw className="w-6 h-6" />
                                        Tạo bộ mới
                                      </button>
                    
                                    </div>
                                  </div>
                                </header>
                        

                        {/* Progress indicator */}
                        <div className="shrink-0 px-8 py-4">
                            <div className="container mx-auto text-center">
                                <p className="text-2xl text-cyan-200 font-bold">
                                    Câu {currentQuestionIndex + 1} / {totalQuestions}
                                </p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 container mx-auto px-8 pb-8 overflow-y-auto">
                            <div className="grid grid-cols-12 gap-8 h-full">
                                {/* Question Area */}
                                <div className={showLinkPanel ? "col-span-12 lg:col-span-8" : "col-span-12"}>
                                    <div className="h-full bg-slate-800/60 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col">
                                        <div className="p-10 flex-1 flex flex-col">
                                            {/* Question */}
                                            <div className="mb-8">
                                                <h2 className="text-2xl font-bold text-white mb-6">
                                                    {currentQuestion?.question}
                                                </h2>
                                            </div>

                                            {/* Choices */}
                                            <div className="flex-1">
                                                <div className="grid grid-cols-1 gap-8">
                                                    <MultipleChoice
                                                        choices={currentQuestion?.choices || []}
                                                        selectedChoice={selectedChoice}
                                                        correctAnswer={showFeedback ? currentQuestion?.answer : ""}
                                                        onChoiceClick={handleSelectChoice}
                                                        isPrivatePractice={true}
                                                        phase={showFeedback ? "SHOW_ANSWER" : "QUESTION"}
                                                    />
                                                </div>
                                            </div>

                                            {/* Buttons below choices */}
                                            <div className="shrink-0 mt-12 flex flex-wrap items-center justify-between gap-6">
                                                <div className="flex gap-4">
                                                    <Button
                                                        onClick={handlePrevQuestion}
                                                        disabled={currentQuestionIndex === 0}
                                                        variant="secondary"
                                                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                                                    >
                                                        <ChevronLeft className="w-6 h-6" />
                                                        Câu trước
                                                    </Button>

                                                    <Button
                                                        onClick={handleNextQuestion}
                                                        disabled={currentQuestionIndex === totalQuestions - 1}
                                                        variant="primary"
                                                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                                                    >
                                                        Câu tiếp theo
                                                        <ChevronRight className="w-6 h-6" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    onClick={handleToggleLinks}
                                                    variant="outline"
                                                    className="flex items-center gap-3 px-6 py-4 text-lg border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/20"
                                                >
                                                    <BookOpen className="w-6 h-6" />
                                                    {showLinkPanel ? "Ẩn" : "Xem"} tài liệu tham khảo
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Link Panel - chỉ hiện khi bấm nút */}
                                {showLinkPanel && (
                                    <div className="col-span-12 lg:col-span-4">
                                        <div className="h-full bg-slate-800/60 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl">
                                            <div className="p-6 h-full flex flex-col">
                                                <h3 className="text-2xl font-bold text-cyan-200 mb-6">Tài liệu tham khảo</h3>
                                                <div className="flex-1 overflow-y-auto">
                                                    <LinkPreviewPanel links={selectedLinks} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animation */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(100vh) translateX(0); opacity: 0; }
                    10% { opacity: 0.2; }
                    90% { opacity: 0.2; }
                    100% { transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
                }
                .animate-float { animation: float linear infinite; }
            `}</style>
        </div>
    );
};

export default PrivatePractice;