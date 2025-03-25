import { Question } from "../../../type";
import { getAxiosAuthContext } from "../../../context/authContext";


export const sendAnswer = async (roomId: string, answer:string): Promise<any> => {
  try {
    
    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }
    const response = await axiosInstance.post(`/api/test/answer?room_id=${roomId}`, {"answer":answer}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
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
      
      const context = getAxiosAuthContext()
      const { authToken, getAxiosInstance } = context
      const axiosInstance = getAxiosInstance()
      if (!authToken) {
        throw new Error("No token found. Please log in.");
      }
      const response = await axiosInstance.post(`/api/test/time?room_id=${roomId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
        },
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
  
