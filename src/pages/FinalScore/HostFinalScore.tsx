import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import FinalScore from '../../components/FinalScore';
import { useHost } from '../../context/hostContext';
import { useSearchParams } from 'react-router-dom';
import { playSound } from '../../components/services';

const ButtonComponent:React.FC = () => {
    const [searchParams] = useSearchParams();
    const round = searchParams.get("round") || "1";
    const roomId = searchParams.get("roomId") || "";
    const {handleStartRound} = useHost();

    return (
        <div className="flex gap-2 mt-4 w-full">
            <button
              onClick={() => {
                handleStartRound(round, roomId,[[]])

              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
            >
              Hiển thị điểm tổng kết
            </button>
            <button
              onClick={() => {
                playSound(roomId,"final");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 flex-1 rounded-md whitespace-nowrap"
            >
              Phát nhạc tổng kết
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