import React, { useEffect, useState, useRef } from 'react';
import { getTest, getTestByUserId, updateQuestion, addNewQuestion } from './service';
import { uploadFile } from '../../../services/uploadAssestServices';
import { Question } from '../../../type';
import { useQuery } from 'react-query';
import testManageMentService from '../../../services/testManagement.service';
import { getHistoryById } from './service';

interface PlayerRound {
    avatar: string;
    isCorrect: boolean | null;
    isModified: boolean | null;
    playerName: string;
    score: number;
    stt: string;
}

interface RoomData {
    room_id: string;
    round_1: PlayerRound[];
    round_2: PlayerRound[];
    round_3: PlayerRound[] | null;
    round_4: PlayerRound[];
}

// Props interface for the component
interface RoomScoreTableProps {
    roomDataList: RoomData[];
}


const ViewHistory: React.FC = () => {

    const [roomDataList, setRoomDataList] = useState<RoomData[]>([])

    useEffect(() => {
        const getHistory = async () => {
            const response = await getHistoryById()

            console.log("hisory", response);
            const data = Array.isArray(response) ? response : [response];
            setRoomDataList(data)
        }

        getHistory()
    }, [])

    const calculateTotalScore = (playerName: string, room: RoomData): number => {
        let total = 0;
        const rounds = [room.round_1, room.round_2, room.round_3, room.round_4];
        rounds.forEach((round) => {
            if (round) {
                const player = round.find((p) => p.playerName === playerName);
                if (player) {
                    total += player.score;
                }
            }
        });
        return total;
    };

    // Get unique players across all rounds for a room
    const getUniquePlayers = (room: RoomData): PlayerRound[] => {
        const playersMap = new Map<string, PlayerRound>();
        [room.round_1, room.round_2, room.round_3, room.round_4].forEach((round) => {
            if (round) {
                round.forEach((player) => {
                    if (!playersMap.has(player.playerName)) {
                        playersMap.set(player.playerName, player);
                    }
                });
            }
        });
        return Array.from(playersMap.values());
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Xem Đề Thi</h2>
                <p className="text-blue-200/80">Quản lý và chỉnh sửa các câu hỏi trong đề thi</p>
            </div>

            <div className="p-8 space-y-12">
                {roomDataList && roomDataList.map((room) => (
                    <div key={room.room_id} className="bg-slate-700/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6">
                        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                            <span className="text-cyan-300 mr-2">🏠</span>
                            Room {room.room_id}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-slate-600/50 border border-blue-400/30 rounded-lg">
                                <thead>
                                    <tr className="bg-slate-700/50 text-blue-200 font-semibold">
                                        <th className="p-4 text-left">Player</th>
                                        <th className="p-4 text-center">Round 1</th>
                                        <th className="p-4 text-center">Round 2</th>
                                        <th className="p-4 text-center">Round 3</th>
                                        <th className="p-4 text-center">Round 4</th>
                                        <th className="p-4 text-center">Total Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getUniquePlayers(room).map((player) => (
                                        <tr
                                            key={player.playerName}
                                            className="border-t border-blue-400/20 hover:bg-slate-600/30 transition-colors"
                                        >
                                            <td className="p-4 flex items-center space-x-3">
                                                <img
                                                    src={player.avatar}
                                                    alt={`${player.playerName}'s avatar`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/40';
                                                    }}
                                                />
                                                <span className="text-white font-medium">{player.playerName}</span>
                                            </td>
                                            <td className="p-4 text-center text-white">
                                                {room.round_1.find((p) => p.playerName === player.playerName)?.score ?? '-'}
                                            </td>
                                            <td className="p-4 text-center text-white">
                                                {room.round_2.find((p) => p.playerName === player.playerName)?.score ?? '-'}
                                            </td>
                                            <td className="p-4 text-center text-white">
                                                {room.round_3
                                                    ? room.round_3.find((p) => p.playerName === player.playerName)?.score ?? '-'
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-center text-white">
                                                {room.round_4.find((p) => p.playerName === player.playerName)?.score ?? '-'}
                                            </td>
                                            <td className="p-4 text-center text-cyan-300 font-semibold">
                                                {calculateTotalScore(player.playerName, room)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewHistory;