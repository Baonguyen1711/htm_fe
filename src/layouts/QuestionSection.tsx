import React, { useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
// import { Button } from './ui/button';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionSectionProps {
  question: Question;
  timeLeft: number;
  onNextQuestion: () => void;
}

export function QuestionSection({ question, timeLeft, onNextQuestion }: QuestionSectionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    setHasSubmitted(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setHasSubmitted(false);
    onNextQuestion();
  };

  const timePercentage = (timeLeft / 30) * 100;
  const isTimeRunningOut = timeLeft <= 10;

  return (
    <div className="bg-gradient-to-br from-cyan-800/40 to-blue-900/40 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl w-full flex flex-col h-full">
      {/* Timer */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-cyan-200">
            <Clock size={16} />
            <span className="text-xs">Time Remaining</span>
          </div>
          <span className={`text-xl ${isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-cyan-100'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden border border-cyan-600/30">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isTimeRunningOut ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
            }`}
            style={{ width: `${timePercentage}%` }}
          />
        </div>
      </div>

      {/* Question Display Area - Blank space for different question types */}
      <div className="flex-1 mb-3 flex flex-col">
        <div className="bg-blue-950/30 border border-cyan-500/20 rounded-xl p-4 flex-1 flex items-center justify-center">
          <h2 className="text-cyan-50 text-xl text-center">{question.question}</h2>
        </div>
      </div>

      {/* Multiple Choice Options - Grid at bottom */}
      <div className="flex-shrink-0">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            const showCorrect = hasSubmitted && isCorrect;
            const showIncorrect = hasSubmitted && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => !hasSubmitted && setSelectedAnswer(option)}
                disabled={hasSubmitted}
                className={`text-left p-3 rounded-lg border-2 transition-all duration-300 ${
                  showCorrect
                    ? 'bg-green-500/30 border-green-400 shadow-lg shadow-green-500/20'
                    : showIncorrect
                    ? 'bg-red-500/30 border-red-400 shadow-lg shadow-red-500/20'
                    : isSelected
                    ? 'bg-cyan-500/30 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-blue-900/30 border-cyan-600/30 hover:bg-cyan-800/30 hover:border-cyan-500/50'
                } ${hasSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                      showCorrect
                        ? 'border-green-400 bg-green-500 text-white'
                        : showIncorrect
                        ? 'border-red-400 bg-red-500 text-white'
                        : isSelected
                        ? 'border-cyan-400 bg-cyan-500 text-white'
                        : 'border-cyan-500/50 bg-blue-950/30 text-cyan-300'
                    }`}
                  >
                    {showCorrect ? '✓' : showIncorrect ? '✗' : String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-cyan-50 text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit/Next Button */}
        {/* <div className="flex justify-end">
          {!hasSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 shadow-lg"
            >
              Next Question
              <ChevronRight className="ml-2" size={16} />
            </Button>
          )}
        </div> */}
      </div>
    </div>
  );
}