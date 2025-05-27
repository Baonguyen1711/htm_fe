import { getAxiosAuthContext } from "../context/authContext";
import axios from "axios";

export const submitAnswer = async (roomId: string, answer: string, stt: string): Promise<any> => {
    try {
      
      const response = await axios.post(`http://localhost:8000/api/test/submit?room_id=${roomId}`,{
        "answer": answer,
        "stt": stt
      } ,{
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


export const setSelectedPacketToPlayer = async (roomId: string, packetName:string, testName: string): Promise<any> => {
    try {
      
      const response = await axios.get(`http://localhost:8000/api/test/question?room_id=${roomId}&packet_name=${packetName}&test_name=${testName}&round=3`,{
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


  

  