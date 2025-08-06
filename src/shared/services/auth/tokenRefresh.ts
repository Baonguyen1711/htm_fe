import authService from '../../../services/auth.service';

class TokenRefreshService {
    private refreshTimer: NodeJS.Timeout | null = null;
    private isRefreshing = false;
    private refreshPromise: Promise<string | null> | null = null;


    startAutoRefresh(accessToken: string): void {
        // Clear any existing timer
        this.stopAutoRefresh();

        // Refresh 5 minutes before expiration (25 minutes for 30-minute tokens)
        // This provides a 5-minute buffer for network issues
        const refreshInterval = 25 * 60 * 1000; // 25 minutes

        console.log('🔄 Starting auto-refresh timer for 25 minutes (5 min before 30 min expiration)');

        this.refreshTimer = setTimeout(async () => {
            try {
                console.log('⏰ Auto-refresh triggered - attempting to refresh access token');
                const newToken = await this.refreshAccessToken();
                if (newToken) {
                    console.log('✅ Access token refreshed automatically and silently');
                    // Start new timer with the new token
                    this.startAutoRefresh(newToken);
                } else {
                    console.error('❌ Failed to refresh access token');
                    this.handleRefreshFailure();
                }
            } catch (error) {
                console.error('❌ Error during token refresh:', error);
                this.handleRefreshFailure();
            }
        }, refreshInterval);
    }


    stopAutoRefresh(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
            console.log('Auto-refresh timer stopped');
        }
    }


    async refreshAccessToken(): Promise<string | null> {
        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing && this.refreshPromise) {
            console.log('Token refresh already in progress, waiting...');
            return await this.refreshPromise;
        }

        this.isRefreshing = true;
        
        this.refreshPromise = this.performRefresh();
        
        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }


    private async performRefresh(): Promise<string | null> {
        try {
            console.log('Refreshing access token...');
            

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Include cookies (refreshToken)
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Refresh failed with status: ${response.status}`);
            }

            const data = await response.json();
            const newAccessToken = data.accessToken;

            if (newAccessToken) {

                localStorage.setItem('accessToken', newAccessToken);
                console.log('Access token updated in localStorage');
                return newAccessToken;
            } else {
                throw new Error('No access token in refresh response');
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    }

    /**
     * Handle refresh failure - could redirect to login or show error
     */
    private handleRefreshFailure(): void {
        console.warn('Token refresh failed, user may need to re-authenticate');
        
        // Clear stored tokens
        localStorage.removeItem('accessToken');
        
        // Stop auto-refresh
        this.stopAutoRefresh();
        
        // You could emit an event or call a callback here to handle the failure
        // For example: redirect to login page, show notification, etc.
        
        // Dispatch custom event that components can listen to
        window.dispatchEvent(new CustomEvent('tokenRefreshFailed', {
            detail: { message: 'Session expired, please log in again' }
        }));
    }

    /**
     * Check if access token is close to expiry and refresh if needed
     * @param accessToken - Current access token
     */
    async checkAndRefreshIfNeeded(accessToken: string): Promise<string> {
        try {
            // Decode JWT to check expiry (simple base64 decode)
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - currentTime;

            console.log(`🕐 Token expires in ${timeUntilExpiry} seconds (${Math.floor(timeUntilExpiry/60)} minutes)`);
            console.log(`🔍 Token details - Role: ${payload.role}, Room: ${payload.roomId}, User: ${payload.userId}`);

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 5 * 60) {
                console.log('⚠️ Token expires soon, refreshing...');
                const newToken = await this.refreshAccessToken();
                if (newToken) {
                    console.log('✅ Token refreshed successfully');
                    return newToken;
                } else {
                    console.error('❌ Failed to refresh token, using existing token');
                    return accessToken;
                }
            }

            console.log('✅ Token is still valid, no refresh needed');
            return accessToken;
        } catch (error) {
            console.error('❌ Error checking token expiry:', error);
            console.log('🔄 Attempting to refresh token due to decode error');
            const newToken = await this.refreshAccessToken();
            return newToken || accessToken;
        }
    }

    /**
     * Get current access token, refreshing if necessary
     */
    async getValidAccessToken(): Promise<string | null> {
        const currentToken = localStorage.getItem('accessToken');
        
        if (!currentToken) {
            return null;
        }

        return await this.checkAndRefreshIfNeeded(currentToken);
    }
}

// Create singleton instance
const tokenRefreshService = new TokenRefreshService();

export default tokenRefreshService;
