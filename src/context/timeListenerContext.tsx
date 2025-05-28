import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { listenToTimeStart } from "../services/firebaseServices";
import { useSounds } from "./soundContext";
import { round } from "react-placeholder/lib/placeholders";
import { useSearchParams } from "react-router-dom";

type TimeStartContextType = {
  timeLeft: number;
  startTimer: (duration: number) => void;
  setExternalTimer: (seconds: number) => void;
};

const TimeStartContext = createContext<TimeStartContextType | undefined>(undefined);

export const TimeStartProvider: React.FC<{ roomId: string; children: React.ReactNode }> = ({
  roomId,
  children,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sounds = useSounds();
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";

  const startTimer = (duration: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(duration);


    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        console.log(prev);

        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const setExternalTimer = (seconds: number) => {
    startTimer(seconds);
  };

  useEffect(() => {
    const unsubscribe = listenToTimeStart(roomId, () => {


      if (round === "2") {
        console.log("roùnd", round);

        startTimer(15)
        return;
      }

      startTimer(30); // or 60 depending on your needs
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId]);

  return (
    <TimeStartContext.Provider value={{ timeLeft, startTimer, setExternalTimer }}>
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
