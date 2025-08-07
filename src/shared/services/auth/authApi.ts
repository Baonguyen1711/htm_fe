// Authentication API service
import { api } from '../api/client';
import { API_ENDPOINTS } from '../../constants';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse 
} from '../../types';

export const authApi = {
  /**
   * Login user with email and password
   */
  async authenticateUser(token: string) {
    const response = await api.post(
      API_ENDPOINTS.AUTH.AUTHENTICATE,
      {token: token},
    );
    return response.data;
  },

  /**
   * Generate access token (for room-based authentication)
   */
  async generateAccessToken(data: { roomId: string; role: string }) {
    const response = await api.post(
      API_ENDPOINTS.AUTH.ACCESS_TOKEN,
      data
    );
    return response.data;
  },

  /**
   * Verify access token
   */
  async verifyToken(): Promise<{ roomId: string; role: string; userId: string; exp: number }> {
    const response = await api.post<{ roomId: string; role: string; userId: string; exp: number }>(
      API_ENDPOINTS.AUTH.VERIFY
    );
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenData: RefreshTokenRequest) {
    const response = await api.post(
      API_ENDPOINTS.AUTH.REFRESH,
      refreshTokenData
    );
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Check if user is host (legacy compatibility)
   */
  async isHost(): Promise<any> {
    try {

      const response = await api.post(API_ENDPOINTS.AUTH.IS_HOST, {});
      console.log("response", response);
      return response.data;
    } catch (error) {
      return false;
    }
  },
};

export default authApi;
