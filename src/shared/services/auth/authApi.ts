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
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse['data']>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  /**
   * Generate access token (for room-based authentication)
   */
  async generateAccessToken(data: { roomId: string; role: string }): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      API_ENDPOINTS.AUTH.ACCESS_TOKEN,
      data
    );
    return response.data.data;
  },

  /**
   * Verify access token
   */
  async verifyToken(): Promise<{ roomId: string; role: string; userId: string; exp: number }> {
    const response = await api.post<{ roomId: string; role: string; userId: string; exp: number }>(
      API_ENDPOINTS.AUTH.VERIFY
    );
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse['data']>(
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
  async isHost(data: any): Promise<boolean> {
    try {
      // This would be replaced with actual API call
      // For now, maintaining compatibility with existing code
      const response = await api.post<{ isHost: boolean }>('/auth/is-host', data);
      return response.data.data.isHost;
    } catch (error) {
      return false;
    }
  },
};

export default authApi;
