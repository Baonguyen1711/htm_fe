import { Question, Score } from "../../../type";
import { getAxiosAuthContext } from "../../../context/authContext";
import axios from "axios";

export const sendAnswerToPlayer = async (roomId: string): Promise<any> => {
  try {

    const response = await axios.post(`http://localhost:8000/api/test/broadcast?room_id=${roomId}`, {}, {
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

export const updateScore = async (roomId: string, scoreList: Score[], mode: string, round: string, stt?: string, isCorrect?: string,
  round_4_mode?: "main" | "nshv" | "take_turn",
  difficulty?: string,
  is_take_turn_correct?: string,
  stt_take_turn?: string,
  stt_taken?: string,
  is_obstacle_correct?: string,
  obstacle_point?:number): Promise<any> => {
  try {
    console.log("scoreList before sending", scoreList);
    const params = new URLSearchParams({
      room_id: roomId,
      mode,
      round
    });


    if (stt) params.append("stt", stt);
    if (isCorrect) params.append("is_correct", isCorrect);
    if (round_4_mode) params.append("round_4_mode", round_4_mode);
    if (difficulty) params.append("difficulty", difficulty);
    if (is_take_turn_correct) params.append("is_take_turn_correct", is_take_turn_correct);
    if (stt_take_turn) params.append("stt_take_turn", stt_take_turn);
    if (stt_taken) params.append("stt_taken", stt_taken);
    if (is_obstacle_correct) params.append("is_obstacle_correct", is_obstacle_correct);
    if (obstacle_point) params.append("obstacle_point", obstacle_point.toString());

    const url = `http://localhost:8000/api/test/score?${params.toString()}`;

    console.log("mode", mode);
    

    const response = await axios.post(url,
      mode !== "manual" ? [] : scoreList
      , {
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

export const startTime = async (roomId: string): Promise<any> => {
  try {
    const response = await axios.post(`http://localhost:8000/api/test/time?room_id=${roomId}`, {}, {
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

export const resetBuzz = async (roomId: string) => {
  try {
    const response = await axios.post(`http://localhost:8000/api/buzz/reset?room_id=${roomId}`,
      {

      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

    if (response.status !== 200) {
      throw new Error(`Failed to go to next round, Status: ${response.status}`);
    }

    // Phân tích dữ liệu từ response JSON
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
}

