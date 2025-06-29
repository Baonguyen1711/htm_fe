import React, { useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import PlayerScore from '../components/PlayerScore';
import Header from '../layouts/Header';
import { updateHistory } from './services';


interface PlayerScoreProps {
    isHost?: boolean;
    buttonComponent?: ReactNode;
}
const FinalScore: React.FC<PlayerScoreProps> = ({ isHost = false, buttonComponent }) => {

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                    transform: "scale(0.75)",
                    width: `${100 / 0.75}vw`,
                    height: `${100 / 0.75}vh`,
                }}
            >

                <div className="relative min-h-full">
                    {/* Ocean/Starry Night Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col min-h-full">
                        {
                            isHost ? (
                                <Header isHost={isHost} />
                            )
                                :
                                ""
                        }
                        <div className="flex flex-1 items-center justify-center w-full py-8"
                            style={{
                                marginTop: "120px",
                                transform: "scale(1.3)",
                            }}
                        >
                            <div className="w-full max-w-2xl"

                            >
                                <PlayerScore />
                                {buttonComponent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};



export default FinalScore;