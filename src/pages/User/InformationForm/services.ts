import { Question, User } from "../../../type";
import { getAxiosAuthContext } from "../../../context/authContext";
import axios from "axios";

export const joinRoom = async (roomId: string, userInfo: User) => {
    try {
    
        const response = await axios.post(`http://127.0.0.1:8000/api/room/join?room_id=${roomId}`, userInfo, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
    
        if (response.status !== 200) {
          throw new Error(`Failed to join room with ID: ${roomId}, Status: ${response.status}`);
        }
    
        // Phân tích dữ liệu từ response JSON
        return response.data;
    
      } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
      }
}


export const getTest = async (testName: string): Promise<any> => {
  try {
    
    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }
    const response = await axiosInstance(`/api/test/${testName}`, {
      method: 'GET', // Phương thức HTTP
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch test with ID: ${testName}, Status: ${response.status}`);
    }

    // Phân tích dữ liệu từ response JSON
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};

export const uploadTestToServer = async (file: File, testName: string): Promise<{ message: string; data?: any }> => {
  const context = getAxiosAuthContext()
  const { authToken, getAxiosInstance } = context
  const axiosInstance = getAxiosInstance()
  if (!authToken) {
    throw new Error("No token found. Please log in.");
  }
  // Kiểm tra nếu không có file
  if (!file) {
    throw new Error("Không có file nào được chọn!");
  }

  // Tạo đối tượng FormData để đóng gói file
  const formData = new FormData();
  formData.append("file", file);

  console.log(formData.getAll("file"))

  try {
    // Gửi yêu cầu POST tới server
    const response = await axiosInstance.post(`api/test/upload?test_name=${testName}`,formData, {
      method: "POST",
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authToken}`, 
      },
      credentials: "include",
    });

    // Kiểm tra phản hồi HTTP
    if (response.status == 400) {
      throw new Error(`Upload thất bại: Bộ đề đã tồn tại! chọn bộ đề khác`);
    }

    if (!response.ok) {
      console.log("response.status == 400", response.status == 400)
      throw new Error(`Upload thất bại: ${response.statusText}`);
    }

    // Giải mã JSON từ server

    console.log("Upload thành công:", response.data);
    return { message: "Upload thành công!", data: response.data };
  } catch (error: any) {
    console.error("Lỗi khi upload file:", error.message);
    throw new Error(`Lỗi upload: ${error.message}`);
  }
};

export const getTestByUserId = async (): Promise<any> => {
  try {

    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }
    const response = await axiosInstance(`/api/test/user`, {
      method: 'GET', // Phương thức HTTP
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch test with Status: ${response.status}`);
    }
    
    // Access the response data
    console.log(response.data);

    // Phân tích dữ liệu từ response JSO
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};

export const updateQuestion = async (updateQuestion: Partial<Question>, question_id: string): Promise<any> => {
  try {

    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }

    const response = await axiosInstance.put(`api/test/update/${question_id}`,updateQuestion ,{
      method: 'PUT', // Phương thức HTTP
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch test with Status: ${response.status}`);
    }
    
    // Access the response data
    console.log(response.data);

    // Phân tích dữ liệu từ response JSO
    return response.data;


  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};

export const getRoomById = async (): Promise<any> => {
  try {

    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }
    const response = await axiosInstance(`/api/rooms`, {
      method: 'GET', // Phương thức HTTP
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch test with Status: ${response.status}`);
    }
    
    // Access the response data
    console.log(response.data);

    // Phân tích dữ liệu từ response JSO
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};

export const createRoom = async (expiredTime: number): Promise<any> => {
  try {

    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }
    const response = await axiosInstance.post(`/api/room/create?expired_time=${expiredTime}`, {
      method: 'POST', // Phương thức HTTP
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch test with Status: ${response.status}`);
    }
    
    // Access the response data
    console.log(response.data);

    // Phân tích dữ liệu từ response JSO
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};


export const deactivateRoom = async (roomId: string): Promise<any> => {
  try {

    const context = getAxiosAuthContext()
    const { authToken, getAxiosInstance } = context
    const axiosInstance = getAxiosInstance()
    if (!authToken) {
      throw new Error("No token found. Please log in.");
    }
    const response = await axiosInstance.post(`/api/room/${roomId}/deactivate`, {
      method: 'POST', // Phương thức HTTP
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Nếu API yêu cầu token
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch test with Status: ${response.status}`);
    }
    
    // Access the response data
    console.log(response.data);

    // Phân tích dữ liệu từ response JSO
    return response.data;

  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }
};

export const spectatorJoin = async (roomId: string) => {
    try {
    
        const response = await axios.post(`http://127.0.0.1:8000/api/room/spectator/join?room_id=${roomId}`, {}, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (response.status !== 200) {
          throw new Error(`Failed to join room with ID: ${roomId}, Status: ${response.status}`);
        }
    
        // Phân tích dữ liệu từ response JSON
        return response.data;
    
      } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
      }
}