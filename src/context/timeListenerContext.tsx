import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { deletePath, listenToTimeStart } from "../services/firebaseServices";
import { useSounds } from "./soundContext";
import { round } from "react-placeholder/lib/placeholders";
import { useSearchParams } from "react-router-dom";
import { useHost } from "./hostContext";

type TimeStartContextType = {
  timeLeft: number;
  timeElapsed: number,
  playerAnswerTime: number,
  setPlayerAnswerTime: React.Dispatch<React.SetStateAction<number>>,
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>,
  startTimer: (duration: number) => void;
  setExternalTimer: (seconds: number) => void;

};

const TimeStartContext = createContext<TimeStartContextType | undefined>(undefined);

export const TimeStartProvider: React.FC<{ roomId: string; children: React.ReactNode }> = ({
  roomId,
  children,
}) => {
  // const {setAnimationKey} = useHost();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeElapsed, settimeElapsed] = useState<number>(0)
  const [playerAnswerTime, setPlayerAnswerTime] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sounds = useSounds();
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";
  const roundRef = useRef(round);



  const startTimer = async (duration: number) => {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);
    console.log("duration", duration);

    const durationInMs = duration * 1000
    // Set the new time
    setTimeLeft(durationInMs / 1000);
    const startTime = Date.now();

    // Start the countdown
    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(durationInMs - elapsedMs, 0);
      const remainingSec = remainingMs / 1000;

      const timeElapsed = duration - remainingSec; 
      console.log("timeElapsed", parseFloat(timeElapsed.toFixed(2)), "s");
      settimeElapsed(parseFloat(timeElapsed.toFixed(2)))
      setTimeLeft((prev) => {
        console.log(prev);
        if (prev <= 1) {
          // setAnimationKey((prev: number) => prev + 1);
          clearInterval(timerRef.current!);
          return 0;
        }
        return (prev - 50 / 1000);
      });
    }, 50);
  };
  const setExternalTimer = (seconds: number) => {
    startTimer(seconds);
  };

  const isInitialMount = useRef(true);



  return (
    <TimeStartContext.Provider value={{ timeLeft, timeElapsed, playerAnswerTime, setPlayerAnswerTime, setTimeLeft, startTimer, setExternalTimer }}>
      {children}
    </TimeStartContext.Provider>
  );
};

export const useTimeStart = (): TimeStartContextType => {
  const context = useContext(TimeStartContext);
  if (!context) {
    throw new Error("useTimeStart must be used within a TimeStartProvider");
  }
  return context;
};
