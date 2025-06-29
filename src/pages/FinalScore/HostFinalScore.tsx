import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import FinalScore from '../../components/FinalScore';
import { useHost } from '../../context/hostContext';
import { useSearchParams } from 'react-router-dom';
import { playSound } from '../../components/services';
import { updateHistory } from '../../components/services';
import { listenToHistory } from '../../services/firebaseServices';
import { Score } from '../../type';

const ButtonComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";
  const roomId = searchParams.get("roomId") || "";
  const testName = searchParams.get("testName") || "";
  const [historyObject, setHistoryObject] = useState<any>()
  const { handleStartRound } = useHost();

  useEffect(() => {
    const unsubscribeHistory = listenToHistory(roomId, (data) => {
      console.log("history data", data);
      const historyObject: {
        room_id: string;
        test_name: string,
        [key: `round_${string}`]: Score[] | string | undefined;
      } = { room_id: roomId, test_name: testName };

      for (const roundKey in data) {
        if (data.hasOwnProperty(roundKey)) {
          const roundData = data[roundKey];

          const roundScores: Score[] = Object.entries(roundData).map(([stt, player]: [string, any]) => ({
            playerName: player.playerName,
            avatar: player.avatar,
            score: player.roundScore,   // Map roundScore → score field
            isCorrect: player.isCorrect ?? null,
            isModified: player.isModified ?? null,
            stt: stt
          }));

          historyObject[`round_${roundKey}`] = roundScores;
        }
      }

      console.log("Final History Object", historyObject);

      setHistoryObject(historyObject)




    })

    return () => unsubscribeHistory()
  }, [])

  return (
    <div className="flex gap-2 mt-4 w-full">
      <button
        onClick={() => {
          handleStartRound(round, roomId, [[]])

        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
      >
        Hiển thị điểm tổng kết
      </button>
      <button
        onClick={() => {
          playSound(roomId, "final");
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
      >
        Phát nhạc tổng kết
      </button>
      <button
        onClick={() => {
          if(historyObject) {
            updateHistory(historyObject)
          }
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
      >
        Kết thúc trận đấu
      </button>
    </div>
  );
}

const HostFinalScore: React.FC = () => {

  return (
    <FinalScore
      isHost={true}
      buttonComponent={<ButtonComponent />}
    />
  );
};



export default HostFinalScore;