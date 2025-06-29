import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { deletePath } from '../services/firebaseServices';
import {
    EyeIcon,
} from "@heroicons/react/24/solid";

interface RoundTab {
    isHost?: boolean;
    spectatorCount?: number
}
const Header: React.FC<RoundTab> = ({ isHost, spectatorCount }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const roomId = searchParams.get("roomId") || "";
    const testName = searchParams.get("testName") || "";
    const currentRound = searchParams.get("round") || "1";
    const roundTabs = [
        { key: "1", label: "NHỔ NEO" },
        { key: "2", label: "VƯỢT SÓNG" },
        { key: "3", label: "BỨT PHÁ" },
        { key: "4", label: "CHINH PHỤC" },
        { key: "final", label: "Tổng kết điểm" },
        { key: "turn", label: "Phân lượt" },
    ];


    return (
        <div className="relative z-20 bg-slate-900/20 backdrop-blur-md border-b border-blue-400/20 shadow-lg">
            <div className="flex flex-row items-center p-4 lg:p-6 gap-4 w-full">
                {/* Logo and App Name - left */}
                <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                    <img
                        src="/images/magellan-logo.png"
                        alt="Magellan Logo"
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full shadow-lg border-blue-400/50"
                    />
                    <div className="flex flex-col">
                        <h1 className="font-serif text-xl lg:text-2xl xl:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
                            Hành Trình Magellan
                        </h1>
                        <p className="text-xs lg:text-sm text-blue-200/80 font-light tracking-wide hidden sm:block">
                            Khám phá tri thức vượt đại dương
                        </p>
                    </div>
                </div>

                {/* Round Tabs - center, but tabs fit content and don't wrap */}
                {isHost && (
                    <div className="flex flex-1 justify-center">
                        <div className="inline-flex bg-slate-800/80 rounded-xl shadow-lg px-2 py-1 gap-1 whitespace-nowrap">
                            {roundTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={async () => {
                                        if (["1", "2", "3", "4", "turn"].includes(tab.key)) {
                                            await deletePath(roomId, "questions");
                                            await deletePath(roomId, "answers");
                                            navigate(`/host?round=${tab.key}&testName=${testName}&roomId=${roomId}`);
                                        }

                                        if (tab.key === "final") {
                                            navigate(`/host?round=final&roomId=${roomId}&testName=${testName}`);
                                        }
                                    }}
                                    className={`px-4 py-2 font-bold text-base rounded-lg transition-colors
                                    ${currentRound === tab.key
                                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow"
                                            : "text-blue-200 hover:bg-blue-600/20"}
                                `}
                                    disabled={currentRound === tab.key}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right side: empty but takes same space as left for perfect centering */}
                <div className="flex justify-end flex-1">
                    <div className="flex items-center bg-slate-800/70 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400/30 shadow-md">
                        <EyeIcon className="w-5 h-5 mr-2 text-blue-300" />
                        <span className="text-blue-100 font-medium">{spectatorCount}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header;