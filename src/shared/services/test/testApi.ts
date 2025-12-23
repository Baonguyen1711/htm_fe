// Room API service
import { api } from '../api/client';
import { API_ENDPOINTS, API_BASE_URL } from '../../constants';
import axios from 'axios';


export const testApi = {
  /**
   * Get test content
   */
  async getTestContent(test_name: string) {
    const response = await api.get(`${API_ENDPOINTS.TEST.BASE}?test_name=${test_name}`);
    return response.data;
  },

  /**
   * Get test name by uid
   */
  async getTestsNameByUserId(): Promise<string[]> {
    const response = await api.get<string[]>(`${API_ENDPOINTS.TEST.USER}`);
    console.log("response.data", response.data);
    console.log("response.data.data", response.data);
    return response.data;
  },

  /**
   * Upload test to server
   */
  async uploadTestToServer(test_name: string, file: File) {
    console.log("📁 Creating FormData with file:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const formData = new FormData();
    formData.append("file", file);

    // Verify FormData contents
    console.log("🧪 FormData verification:");
    console.log("- Has file:", formData.has("file"));
    console.log("- Get file:", formData.get("file"));
    console.log("- All entries:", Array.from(formData.entries()));

    // Test if file is valid
    if (!file || file.size === 0) {
      throw new Error("Invalid file: file is empty or null");
    }

    try {
      // Try direct axios call to bypass interceptors
      const accessToken = localStorage.getItem('accessToken');
      const headers: any = {
        // Explicitly do NOT set Content-Type - let browser set it for multipart
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      console.log("🔑 Using access token:", accessToken ? 'Present' : 'Missing');
      console.log("📤 Sending direct request with headers:", headers);

      // Create a fresh axios instance to avoid any global interceptors
      const freshAxios = axios.create({
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Add a request interceptor to see what's actually being sent
      freshAxios.interceptors.request.use((config) => {
        console.log("🔍 Fresh axios request config:", {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data,
          dataType: typeof config.data,
          isFormData: config.data instanceof FormData
        });
        return config;
      });

      const directResponse = await freshAxios.post(
        `${API_BASE_URL}${API_ENDPOINTS.TEST.UPLOAD}?test_name=${test_name}`,
        formData,
        {
          headers,
          withCredentials: true
        }
      );

      console.log("📥 Direct upload response received:", {
        status: directResponse.status,
        data: directResponse.data,
        headers: directResponse.headers
      });

      return directResponse.data;
    } catch (directError) {
      console.log("❌ Direct upload failed, trying with API client:", directError);

      // Fallback to API client
      const response = await api.post(
        `${API_ENDPOINTS.TEST.UPLOAD}?test_name=${test_name}`,
        formData
      );

      console.log("📥 API client upload response received:", {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      return response.data;
    }
  },

  async uploadMultiplayerTestToServer(test_name: string, file: File, isPublic: boolean) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post(
        `${API_ENDPOINTS.TEST.MULTIPLAYER_UPLOAD}?test_name=${test_name}&is_public=${isPublic}`,
        formData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  /**
   * Update question
   */
  async updateQuestion(question_id: string, updated_data: any) {
    const response = await api.put(
      `${API_ENDPOINTS.TEST.UPDATE}?question_id=${question_id}`,
      updated_data
    );
    return response.data;
  },

  /**
   * Get random questions
  */

  async getRandomQuestions(limit: number, category?: string) {
    const response = await api.get(
      `${API_ENDPOINTS.TEST.RANDOM}?limit=${limit}${category ? `&catergory=${category}` : ''}`
    );
    return response.data;
  }
 
};

export default testApi;
