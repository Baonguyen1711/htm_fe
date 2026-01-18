import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseListener } from '../../shared/hooks';
import { EyeIcon } from "@heroicons/react/24/solid";
import { useAppDispatch } from '../../app/store';
import {
  setCurrentCorrectAnswer,
  setCurrentQuestion,
  setCurrentRound
} from '../../app/store/slices/gameSlice';
import { useSounds } from '../../context/soundContext';
import { Music, Users, VolumeX } from 'lucide-react';
import { useAppSelector } from '../../app/store';

interface HeaderProps {
  isHost?: boolean;
  spectatorCount?: number;
  isMultiplayer?: boolean
}

const Header: React.FC<HeaderProps> = ({ isHost = false, spectatorCount = 0, isMultiplayer = false }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { deletePath } = useFirebaseListener();
  const [isGameEnded, setIsGameEnded] = useState<boolean>(false)
  const [isMusicPaused, setIsMusicPaused] = useState<boolean>(false)
  const sounds = useSounds()
  const { players } = useAppSelector(state => state.game)

  const roomId = searchParams.get("roomId") || "";
  const testName = searchParams.get("testName") || "";
  const currentRound = searchParams.get("round") || "1";
  const roomMode = searchParams.get("roomMode") || "room";

  const roundTabs = [
    { key: "1", label: "NHỔ NEO" },
    { key: "2", label: "VƯỢT SÓNG" },
    { key: "3", label: "BỨT PHÁ" },
    { key: "4", label: "CHINH PHỤC" },
    // { key: "summary", label: "TỔNG KẾT SAU VÒNG" },
    // { key: "final", label: "TỔNG KẾT" },
    { key: "turn", label: "PHÂN LƯỢT" },
  ];

  const handleRoundChange = async (key: string) => {
    dispatch(setCurrentCorrectAnswer(""));
    dispatch(setCurrentQuestion(null));
    dispatch(setCurrentRound(key));

    // Xóa dữ liệu cũ
    if (["1", "2", "3", "4", "turn"].includes(key)) {
      await deletePath("questions");
      await deletePath("answers");
    }

    // Điều hướng
    if (key === "final") {
      navigate(`/host?round=final&roomId=${roomId}&testName=${testName}`);
    } else {
      navigate(`/host?round=${key}&testName=${testName}&roomId=${roomId}`);
    }
  };

  const handleMusicIconClick = async () => {
    if (isMusicPaused) {
      setIsMusicPaused(false)
    }

    if (!isMusicPaused) {
      setIsMusicPaused(true)
    }
  }

  useEffect(() => {
    if(!isMultiplayer) return 
    const lobbyMusic = sounds["lobby_game"];
    if (lobbyMusic) {
      console.log("lobbyMusic", lobbyMusic)
      if (!lobbyMusic.paused) {
        console.log("pause music")
        lobbyMusic.pause();
        lobbyMusic.currentTime = 0;
      } else {
        console.log("music resume")
        lobbyMusic.play();
        lobbyMusic.currentTime = 0;
      }


    }
  }, [isMusicPaused])

  return (
    <header className="relative z-20  from-cyan-900 via-blue-900 to-blue-950 border-b border-cyan-700/50">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">

        {/* LEFT: Logo + Title */}
        <a href="/" className="flex items-center gap-4 hover:opacity-90 transition">
          <div className="w-14 h-14  rounded-2xl flex items-center justify-center shadow-xl ">
            <img
              src="/images/magellan-logo.png"
              alt="Magellan Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="leading-tight">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Hành Trình Magellan
            </h1>
            <p className="text-sm text-cyan-200 opacity-90">
              Khám phá tri thức vượt đại dương
            </p>
          </div>
        </a>

        {/* CENTER: Round Tabs (chỉ hiện cho Host và không phải multiplayer) */}
        {isHost && roomMode !== "multiplayer" && (
          <div className="hidden lg:flex items-center gap-2 bg-black/30 backdrop-blur border border-cyan-600/40 rounded-xl px-3 py-2 shadow-inner">
            {roundTabs.map((tab) => {
              const isActive = currentRound === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleRoundChange(tab.key)}
                  disabled={isActive}
                  className={`
                    px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200
                    ${isActive
                      ? "bg-white text-blue-950 shadow-md scale-105"
                      : "text-cyan-100 hover:bg-cyan-600/40 hover:text-white hover:shadow"
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* RIGHT: Spectator Count */}
        {
          isMultiplayer ? (
            <div className="flex items-center gap-3">
              {/* Music Button */}
              <button
                className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-slate-500 transition-all flex items-center justify-center"
                onClick={handleMusicIconClick}
              >
                {isMusicPaused ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Music className="w-5 h-5" />
                )}
              </button>

              {/* Player Count */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/80">
                <Users className="w-5 h-5" />
                <span className="font-medium">{players.length}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur border border-cyan-500/50 shadow-md">
                <EyeIcon className="w-5 h-5 text-cyan-300" />
                <span className="text-lg font-bold text-white">
                  {spectatorCount}
                </span>
                <span className="text-sm text-cyan-200">khán giả</span>
              </div>
            </div>
          )
        }


      </div>

      {/* Mobile Round Tabs (nếu cần sau này có thể thêm dropdown) */}
      {isHost && roomMode !== "multiplayer" && (
        <div className="lg:hidden container mx-auto px-6 pb-3">
          <select
            value={currentRound}
            onChange={(e) => handleRoundChange(e.target.value)}
            className="w-full px-4 py-2 bg-black/50 backdrop-blur border border-cyan-600/50 rounded-lg text-white font-medium"
          >
            {roundTabs.map(tab => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
};

export default Header;