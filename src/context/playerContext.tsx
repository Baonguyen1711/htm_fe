
import { useEffect, useState, createContext, useContext } from "react";
import { User } from "../type";

// Create a context for Axios with Authentication
const PlayerContext = createContext<any>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [players, setPlayers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState<string>("")
  const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]);
  const [playerFlashes, setPlayerFlashes] = useState(Array(playerScores.length).fill(""));
  const [playersArray, setPlayerArray] = useState<User[]>(() => {
    const storedPlayers = localStorage.getItem("playerList");
    return storedPlayers ? JSON.parse(storedPlayers) : players;
  })

  return (
    <PlayerContext.Provider value={{ players, setPlayers, roomId, setRoomId, playersArray, setPlayerArray, playerFlashes, setPlayerFlashes }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook to use Axios with Bearer authentication
export const usePlayer = () => {
  return useContext(PlayerContext);
};
