import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';

interface RoundTab {
    isHost?: boolean;
}
const Header: React.FC<RoundTab> = ({ isHost }) => {
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
        { key: "turns", label: "Phân lượt" },
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
                                    onClick={() => {
                                        if (["1", "2", "3", "4"].includes(tab.key)) {
                                            navigate(`/host?round=${tab.key}&testName=${testName}&roomId=${roomId}`);
                                        }

                                        if(tab.key === "final") {
                                            navigate(`/host?round=final&roomId=${roomId}`);
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
                <div className="flex-1" />
            </div>
        </div>
    )
}

export default Header;