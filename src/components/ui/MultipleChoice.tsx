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
  phase?: string
  isPrivatePractice?: boolean;
}

const MultipleChoice: React.FC<Props> = ({
  choices,
  selectedChoice,
  correctAnswer,
  onChoiceClick,
  phase,
  isPrivatePractice,
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
  }, [correctAnswer, selectedChoice]);

  const isShowAnswer = phase === "SHOW_ANSWER";
  const canRevealAnswer =
    phase === "SHOW_ANSWER" && !!correctAnswer;



  return (
    <div className="grid grid-cols-2 gap-6 mt-4 w-full">
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
          className = "bg-blue-700 text-white scale-[1.03]";
        }


        return (
          <button
            key={choice.position}
            disabled={!!selectedChoice || isShowAnswer}
            onClick={() => onChoiceClick(choice.position)}
            className={`w-full p-6 rounded-2xl ${className}`}
          >
            <b>{choice.position}.</b> {choice.content}
          </button>
        );
      })}

    </div>
  );
};

export default MultipleChoice;
