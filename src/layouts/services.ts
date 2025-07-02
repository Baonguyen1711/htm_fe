import { getAxiosAuthContext } from "../context/authContext";
import axios from "axios";

export const submitAnswer = async (roomId: string, answer: string, stt: string, answerTime: number, playerName: string, avatar: string): Promise<any> => {
  try {

    const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/submit?room_id=${roomId}`, {
      "answer": answer,
      "stt": stt,
      "time": Number(answerTime),
      "player_name": playerName,
      "avatar": avatar
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    if (response.status !== 200) {
      throw new Error(`Failed to send answer, Status: ${response.status}`);
    }

    // Phân tích dữ liệu từ response JSON
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};


export const setSelectedPacketToPlayer = async (roomId: string, packetName: string): Promise<any> => {
  try {

    const url = `https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/packet/set?room_id=${roomId}&packet_name=${packetName}`

    const response = await axios.post(url, {

    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    if (response.status !== 200) {
      throw new Error(`Failed to send answer, Status: ${response.status}`);
    }

    // Phân tích dữ liệu từ response JSON
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};

export const setCurrrentTurnToPlayer = async (roomId: string, turn: number): Promise<any> => {
  try {

    const url = `https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/room/turn?room_id=${roomId}&turn=${turn}`

    const response = await axios.post(url, {

    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    if (response.status !== 200) {
      throw new Error(`Failed to send answer, Status: ${response.status}`);
    }

    // Phân tích dữ liệu từ response JSON
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};




