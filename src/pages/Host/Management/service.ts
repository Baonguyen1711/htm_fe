import { Question, Score } from "../../../type";
import { getAxiosAuthContext } from "../../../context/authContext";
import axios from "axios";

export const sendAnswerToPlayer = async (roomId: string): Promise<any> => {
  try {

    const response = await axios.post(`http://localhost:8000/api/test/broadcast?room_id=${roomId}`, {},{
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

export const updateScore = async (roomId: string, scoreList: Score[]): Promise<any> => {
  try {
    console.log("scoreList before sending",scoreList);
    
    const response = await axios.post(`http://localhost:8000/api/test/score?room_id=${roomId}`, scoreList,{
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
      const response = await axios.post(`http://localhost:8000/api/test/time?room_id=${roomId}`, {},{
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
  
