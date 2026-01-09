import React, { useEffect, useState } from "react";

interface Choice {
  position: string;
  content: string;
}

interface Props {
  choices: Choice[];
  selectedChoice: string | null;
  correctAnswer: string;
  onChoiceClick: (position: string) => void;
  phase?: string;
  isPrivatePractice?: boolean;
  isHorizontal?: boolean; // 👈 NEW
}

const MultipleChoice: React.FC<Props> = ({
  choices,
  selectedChoice,
  correctAnswer,
  onChoiceClick,
  phase,
  isPrivatePractice,
  isHorizontal = false, // 👈 default
}) => {
  const [highlighted, setHighlighted] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!correctAnswer || !selectedChoice) return;

    const newHighlights: Record<string, string> = {};

    if (selectedChoice === correctAnswer) {
      newHighlights[correctAnswer] = "bg-green-600/80 text-white";
    } else {
      newHighlights[selectedChoice] = "bg-red-600/80 text-white";
      newHighlights[correctAnswer] = "bg-green-600/80 text-white";
    }

    setHighlighted(newHighlights);

    if (isPrivatePractice) return;

    const timer = setTimeout(() => {
      setHighlighted({});
    }, 2000);

    return () => clearTimeout(timer);
  }, [correctAnswer, selectedChoice, isPrivatePractice]);

  const isShowAnswer = phase === "SHOW_ANSWER";
  const canRevealAnswer = isShowAnswer && !!correctAnswer;

  return (
    <div
      className={`grid mt-2 w-full
        ${isHorizontal ? "grid-cols-4 gap-6" : "grid-cols-2 gap-8"}
      `}
    >
      {choices.map((choice) => {
        const isSelected = selectedChoice === choice.position;

        let className =
          "bg-slate-800/60 text-blue-100 hover:bg-slate-700/60";

        if (canRevealAnswer) {
          if (choice.position === correctAnswer) {
            className = "bg-green-600/80 text-white";
          } else if (isSelected) {
            className = "bg-red-600/80 text-white";
          } else {
            className = "opacity-40";
          }
        } else if (isSelected) {
          className = "bg-blue-700 text-white scale-[1.04]";
        }

        return (
          <button
            key={choice.position}
            disabled={!!selectedChoice || isShowAnswer}
            onClick={() => onChoiceClick(choice.position)}
            className={`
              w-full rounded-3xl transition-all
              flex items-center justify-center text-center
              ${isHorizontal ? "p-6 min-h-[120px] text-base" : "p-8 min-h-[140px] text-lg"}
              ${className}
            `}
          >
            {isHorizontal ? (
              <div className="flex flex-col items-center gap-2">
                <b className="text-lg">{choice.position}</b>
                <span className="leading-snug">
                  {choice.content}
                </span>
              </div>
            ) : (
              <div className="leading-relaxed">
                <b className="mr-2">{choice.position}.</b>
                {choice.content}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoice;
