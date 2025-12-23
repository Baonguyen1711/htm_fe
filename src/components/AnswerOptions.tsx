// import React from 'react'

// const AnswerOptions: React.FC<> = () => {
//     {
//         answerOptions.map((option) => {
//             const isSelected = selectedAnswer === option.label;
//             const showCorrect = showAnswer && option.isCorrect;
//             const showWrong = showAnswer && isSelected && !option.isCorrect;

//             return (
//                 <button
//                     key={option.label}
//                     onClick={() => !isHost && !showAnswer && setSelectedAnswer(option.label)}
//                     disabled={isHost || showAnswer}
//                     className={`p-4 rounded-xl border text-left transition-all ${showCorrect
//                         ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
//                         : showWrong
//                             ? "bg-rose-500/20 border-rose-500 text-rose-400"
//                             : isSelected
//                                 ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
//                                 : "bg-slate-700/30 border-white/10 text-white hover:bg-slate-700/50 hover:border-white/20"
//                         } ${isHost ? "cursor-default" : "cursor-pointer"}`}
//                 >
//                     <span className="font-bold mr-2">{option.label}.</span>
//                     {option.text}
//                 </button>
//             );
//         })
//     }
// }

// export default AnswerOptions