import React, { useEffect, useState } from 'react';
import { createRoom, getRoomById, deactivateRoom } from './service';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../../context/playerContext';
interface Room {
  roomId: string;
  isActive: boolean;
}

const SetupMatch: React.FC = () => {
  const navigate = useNavigate()
  const [currentRound, setCurrentRound] = useState<string>('');
  const [selectedTestName, setSelectedTestName] = useState<string>("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [createdRoomId, setCreatedRoomId] = useState<string>('');
  const [testList, setTestLits] = useState<[]>(JSON.parse(localStorage.getItem("testList") || ""))
  const {setRoomId} = usePlayer()


  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTestName(event.target.value);
  };

  const handleStartClick = (roomId: string, testName: string) => {
    setRoomId(roomId)
    navigate(`/host?round=1&roomId=${roomId}&testName=${testName}`)
  }
  useEffect(() => {
    const getRooms = async () => {
      const data = await getRoomById()
      console.log("rooms", rooms)
      setRooms(data.rooms)
    }

    getRooms()
  }, [])

  const handleCreateRoom = async () => {

    const data = await createRoom(2)
    const newRoom = { roomId: data.result.roomId, isActive: data.result.isActive };
    setRooms([...rooms, newRoom]);
    setCreatedRoomId(data.result.roomId);
    setShowModal(true); // Show modal
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Current Round:', currentRound);
    // Backend logic for updating the current round
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="card p-6 shadow-lg bg-white">
      {/* Create Room Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleCreateRoom}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Room
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Setup Match</h2>

      {/* Update Round Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="currentRound" className="block text-lg mb-2">Current Round</label>
          <input
            type="text"
            id="currentRound"
            value={currentRound}
            onChange={(e) => setCurrentRound(e.target.value)}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Round
        </button>
      </form>

      {/* Rooms Table */}
      <h3 className="text-xl font-semibold mt-6 mb-2">Rooms</h3>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Room ID</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Test</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.roomId}>
              <td className="border border-gray-300 px-4 py-2">{room.roomId}</td>
              <td className="border border-gray-300 px-4 py-2">
                {room.isActive ? 'Active' : 'Inactive'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <select
                  id="testSelect"
                  name="testSelect"
                  className="border rounded p-2 w-full mb-4"
                  value={selectedTestName}
                  onChange={handleTestChange}
                >
                  <option value="" disabled>
                    -- Select a Test --
                  </option>
                  {testList.map((test) => (
                    <option key={test} value={test}>
                      {test}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border border-gray-300 px-4 py-2">
              <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleStartClick(room.roomId, selectedTestName)}
                  >
                    START
                  </button>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center p-4">No rooms created yet</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Room Created Successfully</h3>
            <p className="text-gray-700 mb-4">Room ID: <span className="font-bold">{createdRoomId}</span></p>
            <button
              onClick={handleCloseModal}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupMatch;
