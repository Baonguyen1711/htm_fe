// API client configuration with interceptors
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../../constants';
import { ApiResponse, ApiError } from '../../types';

// Extend InternalAxiosRequestConfig to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _isNotAuthRequired?: boolean;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  // Don't set default Content-Type - let interceptor handle it based on data type
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    // Add auth token if available
    config.withCredentials = config._isNotAuthRequired !== true;
    console.log("config", config);
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Handle Content-Type based on data type
    if (config.data instanceof FormData) {
      // For FormData, completely remove Content-Type to let browser set multipart/form-data with boundary
      delete config.headers['Content-Type'];
      console.log('📁 FormData detected, removed Content-Type header');
      console.log('📁 FormData contents:', Array.from(config.data.entries()));
      console.log('📁 Headers after FormData processing:', config.headers);
    } else if (config.headers && !config.headers['Content-Type']) {
      // Set JSON Content-Type for non-FormData requests
      config.headers['Content-Type'] = 'application/json';
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data instanceof FormData ? 'FormData' : config.data,
        params: config.params,
        headers: config.headers,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details,
      timestamp: new Date().toISOString(),
    };

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        error: apiError,
      });
    }

    return Promise.reject(apiError);
  }
);

// Generic API methods
export const api = {
  get: <T = any>(url: string, config?: Partial<ExtendedAxiosRequestConfig>): Promise<AxiosResponse<T>> =>
    apiClient.get(url, config),

  post: <T = any>(url: string, data?: any, config?: Partial<ExtendedAxiosRequestConfig>): Promise<AxiosResponse<T>> =>
    apiClient.post(url, data, config),

  put: <T = any>(url: string, data?: any, config?: Partial<ExtendedAxiosRequestConfig>): Promise<AxiosResponse<T>> =>
    apiClient.put(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: Partial<ExtendedAxiosRequestConfig>): Promise<AxiosResponse<T>> =>
    apiClient.patch(url, data, config),

  delete: <T = any>(url: string, config?: Partial<ExtendedAxiosRequestConfig>): Promise<AxiosResponse<T>> =>
    apiClient.delete(url, config),
};

export default apiClient;
