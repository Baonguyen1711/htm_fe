import React, { useEffect, useState } from 'react';

interface CountdownCardProps {
  startFrom?: number; 
  onComplete?: () => void; 
  message?: string; 
}

const CountdownCard: React.FC<CountdownCardProps> = ({
  startFrom = 3,
  onComplete,
  message = "Bắt đầu sau"
}) => {
  const [count, setCount] = useState(startFrom);

  useEffect(() => {
    if (count <= 0) {
      if (onComplete) {
        console.log("countdown complete");
        console.log("onComplete", onComplete);

        onComplete();
      };
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-blue-400/30 shadow-2xl p-8 w-72 flex flex-col items-center justify-center text-center">
      <p className="text-white text-lg mb-2">{`${message} ${count > 0 ? count : ""} s`}</p>
      {/* <p className="text-white text-6xl font-bold"></p> */}
    </div>
  );
};

export default CountdownCard;
