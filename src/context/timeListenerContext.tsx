import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSounds } from "./soundContext";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { setIsInputDisabled } from "../app/store/slices/gameSlice";
import { gameApi } from "../shared/services";
import useGameApi from "../shared/hooks/api/useGameApi";

type TimeStartContextType = {
  timeLeft: number;
  timeElapsed: number,
  playerAnswerTime: number,
  setPlayerAnswerTime: React.Dispatch<React.SetStateAction<number>>,
  handleTimeEnd: () => void
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
  const dispatch = useAppDispatch()
  const { currentPlayer, selectedChoice } = useAppSelector(state => state.game)
  const [timeLeft, setTimeLeft] = useState<number>(-1);
  const [timeElapsed, settimeElapsed] = useState<number>(0)
  const [playerAnswerTime, setPlayerAnswerTime] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sounds = useSounds();
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";
  const roomMode = searchParams.get("roomMode") || "room";
  const testName = searchParams.get("testName") || ""
  const pathname = window.location.pathname
  const roundRef = useRef(round);
  const { submitAnswer } = gameApi;
  const { multiplayerSubmit } = useGameApi()


  const handleTimeEnd = async () => {
    console.log("Time is up!");
    if(pathname.includes("host")) return
    dispatch(setIsInputDisabled(true))

    const submittedAnswer = {
      answer: currentPlayer?.answer || "",
      stt: currentPlayer?.stt || "",
      time: currentPlayer?.time || 0,
      player_name: currentPlayer?.userName || "",
      avatar: currentPlayer?.avatar || ""
    }
    if (roomMode === "multiplayer") {
      if (selectedChoice === null) {
        if(!submittedAnswer.answer) {
          await multiplayerSubmit(roomId, "", submittedAnswer.stt, submittedAnswer.time, submittedAnswer.player_name, submittedAnswer.avatar, testName)
        } else {
          await multiplayerSubmit(roomId, submittedAnswer.answer, submittedAnswer.stt, submittedAnswer.time, submittedAnswer.player_name, submittedAnswer.avatar, testName)
        }
      }

      

      return
    }
    await submitAnswer(submittedAnswer, roomId)
  };

  // Watch for timeLeft reaching 0
  useEffect(() => {
    if (timeLeft === 0) {
      handleTimeEnd();
    }
  }, [timeLeft]);

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
    <TimeStartContext.Provider value={{ timeLeft, timeElapsed, playerAnswerTime, handleTimeEnd, setPlayerAnswerTime, setTimeLeft, startTimer, setExternalTimer }}>
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
