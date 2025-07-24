// Token management service
import { TOKEN_REFRESH_INTERVAL } from '../../constants';

export class TokenService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private onTokenRefresh?: (token: string) => void;
  private onTokenExpired?: () => void;

  constructor(
    onTokenRefresh?: (token: string) => void,
    onTokenExpired?: () => void
  ) {
    this.onTokenRefresh = onTokenRefresh;
    this.onTokenExpired = onTokenExpired;
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Set tokens in localStorage
   */
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Calculate expiry time
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem('tokenExpiry', expiryTime.toString());

    // Start auto-refresh timer
    this.startAutoRefresh(expiresIn);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    this.stopAutoRefresh();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem('tokenExpiry');
    if (!expiryTime) return true;

    return Date.now() > parseInt(expiryTime);
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiry(): number {
    const expiryTime = localStorage.getItem('tokenExpiry');
    if (!expiryTime) return 0;

    return Math.max(0, parseInt(expiryTime) - Date.now());
  }

  /**
   * Start automatic token refresh
   */
  private startAutoRefresh(expiresIn: number): void {
    this.stopAutoRefresh();

    // Refresh token 5 minutes before it expires, or at TOKEN_REFRESH_INTERVAL
    const refreshTime = Math.min(
      (expiresIn - 300) * 1000, // 5 minutes before expiry
      TOKEN_REFRESH_INTERVAL
    );

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        await this.refreshAccessToken();
      }, refreshTime);
    }
  }

  /**
   * Stop automatic token refresh
   */
  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.onTokenExpired?.();
        return;
      }

      // Import here to avoid circular dependency
      const { authApi } = await import('./authApi');
      
      const response = await authApi.refreshToken({ refreshToken });
      const { accessToken, expiresIn } = response.data;

      // Update tokens
      localStorage.setItem('accessToken', accessToken);
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      // Notify callback
      this.onTokenRefresh?.(accessToken);

      // Schedule next refresh
      this.startAutoRefresh(expiresIn);

    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      this.onTokenExpired?.();
    }
  }

  /**
   * Initialize token service (call on app startup)
   */
  initialize(): void {
    const accessToken = this.getAccessToken();
    const expiryTime = localStorage.getItem('tokenExpiry');

    if (accessToken && expiryTime) {
      const timeUntilExpiry = parseInt(expiryTime) - Date.now();
      
      if (timeUntilExpiry > 0) {
        // Token is still valid, start auto-refresh
        this.startAutoRefresh(timeUntilExpiry / 1000);
      } else {
        // Token is expired, try to refresh
        this.refreshAccessToken();
      }
    }
  }

  /**
   * Cleanup (call on app unmount)
   */
  cleanup(): void {
    this.stopAutoRefresh();
  }
}

// Create singleton instance
export const tokenService = new TokenService();

export default tokenService;
