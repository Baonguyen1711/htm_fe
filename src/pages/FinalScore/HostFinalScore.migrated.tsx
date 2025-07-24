// MIGRATED VERSION: HostFinalScore using Redux and new hooks
import React, { useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setCurrentRound } from '../../app/store/slices/gameSlice';
import { addToast } from '../../app/store/slices/uiSlice';
import { GameState } from '../../shared/types';
import FinalScore from '../../components/FinalScore.migrated';
import { playSound, updateHistory } from '../../components/services';
import { listenToHistory } from '../../services/firebaseServices';
import { Score } from '../../type';

const ButtonComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  const round = searchParams.get("round") || "1";
  const roomId = searchParams.get("roomId") || "";
  const testName = searchParams.get("testName") || "";
  const [historyObject, setHistoryObject] = useState<any>();
  
  // Redux state
  const { scores, players } = useAppSelector(state => state.game as GameState);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribeHistory = listenToHistory(roomId, (data: any) => {
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
      setHistoryObject(historyObject);
    });

    return unsubscribeHistory;
  }, [roomId, testName]);

  const handleStartRound = async (targetRound: string) => {
    try {
      // Play sound effect
      await playSound(roomId, "next");
      
      // Update current round in Redux
      dispatch(setCurrentRound(parseInt(targetRound)));
      
      // Show success toast
      dispatch(addToast({
        type: 'success',
        title: 'Round Started',
        message: `Starting Round ${targetRound}`
      }));
      
      console.log(`Starting round ${targetRound}`);
    } catch (error) {
      console.error("Error starting round:", error);
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to start round. Please try again.'
      }));
    }
  };

  const handleUpdateHistory = async () => {
    if (!historyObject) {
      dispatch(addToast({
        type: 'warning',
        title: 'No Data',
        message: 'No history data to update'
      }));
      return;
    }

    try {
      await updateHistory(historyObject);
      
      dispatch(addToast({
        type: 'success',
        title: 'History Updated',
        message: 'Game history has been saved successfully!'
      }));
    } catch (error) {
      console.error("Error updating history:", error);
      dispatch(addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update history. Please try again.'
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Host Controls</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => handleStartRound("1")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Start Round 1
          </button>
          <button
            onClick={() => handleStartRound("2")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Start Round 2
          </button>
          <button
            onClick={() => handleStartRound("3")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Start Round 3
          </button>
          <button
            onClick={() => handleStartRound("4")}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Start Round 4
          </button>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleUpdateHistory}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            disabled={!historyObject}
          >
            {historyObject ? 'Update Game History' : 'Waiting for History Data...'}
          </button>
        </div>

        {historyObject && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Room:</strong> {historyObject.room_id}<br/>
              <strong>Test:</strong> {historyObject.test_name}<br/>
              <strong>Rounds:</strong> {Object.keys(historyObject).filter(key => key.startsWith('round_')).length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const HostFinalScore: React.FC = () => {
  return (
    <FinalScore
      isHost={true}
      buttonComponent={<ButtonComponent />}
    />
  );
};

export default HostFinalScore;
