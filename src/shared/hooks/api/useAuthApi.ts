// Authentication API hook
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { 
  loginUser, 
  refreshAccessToken, 
  logoutUser, 
  setTokens, 
  clearAuth 
} from '../../../app/store/slices/authSlice';
import { authApi } from '../../services/auth/authApi';
import { tokenService } from '../../services/auth/tokenService';
import { LoginRequest } from '../../types';

export const useAuthApi = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector(state => state.auth);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      
      // Set tokens in token service
      tokenService.setTokens(
        result.accessToken,
        result.refreshToken,
        result.expiresIn
      );
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Generate access token for room-based auth
   */
  const generateAccessToken = useCallback(async (data: { roomId: string; role: string }) => {
    try {
      const result = await authApi.generateAccessToken(data);
      
      // Set tokens in Redux and token service
      dispatch(setTokens({
        accessToken: result.accessToken,
        expiresIn: 30 * 60, // 30 minutes default
      }));
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  /**
   * Verify current token
   */
  const verifyToken = useCallback(async () => {
    try {
      const result = await authApi.verifyToken();
      return result;
    } catch (error) {
      // Token is invalid, clear auth state
      dispatch(clearAuth());
      throw error;
    }
  }, [dispatch]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshAccessToken()).unwrap();
      return result;
    } catch (error) {
      // Refresh failed, clear auth state
      dispatch(clearAuth());
      throw error;
    }
  }, [dispatch]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      tokenService.clearTokens();
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch(clearAuth());
      tokenService.clearTokens();
      throw error;
    }
  }, [dispatch]);

  /**
   * Check if user is host (legacy compatibility)
   */
  // const isHost = useCallback(async (data: any) => {
  //   try {
  //     const result = await authApi.isHost(data);
  //     return result;
  //   } catch (error) {
  //     console.error('Failed to check host status:', error);
  //     return false;
  //   }
  // }, []);

  /**
   * Initialize authentication (call on app startup)
   */
  const initializeAuth = useCallback(() => {
    // Initialize token service
    tokenService.initialize();
    
    // Check if we have valid tokens
    const accessToken = tokenService.getAccessToken();
    if (accessToken && !tokenService.isTokenExpired()) {
      // Verify token with backend
      verifyToken().catch(() => {
        // Token verification failed, clear auth
        dispatch(clearAuth());
      });
    } else {
      // No valid token, clear auth state
      dispatch(clearAuth());
    }
  }, [dispatch, verifyToken]);

  return {
    // State
    isLoading,
    error,
    isAuthenticated,
    user,
    
    // Actions
    login,
    generateAccessToken,
    verifyToken,
    refreshToken,
    logout,
    // isHost,
    initializeAuth,
  };
};

export default useAuthApi;
