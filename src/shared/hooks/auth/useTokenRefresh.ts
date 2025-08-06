import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tokenRefreshService from '../../../shared/services/auth/tokenRefresh';
import { toast } from 'react-toastify';

interface UseTokenRefreshOptions {
    autoStart?: boolean;
    onRefreshFailed?: () => void;
}

const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
    const { autoStart = true, onRefreshFailed } = options;
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for token refresh failures
        const handleRefreshFailed = (event: CustomEvent) => {
            console.log('Token refresh failed event received');
            
            // Show notification
            toast.error(event.detail.message || 'Phiên đăng nhập đã hết hạn');
            
            // Call custom handler if provided
            if (onRefreshFailed) {
                onRefreshFailed();
            } else {
                // Default behavior: redirect to appropriate login page
                const currentPath = window.location.pathname;
                if (currentPath.includes('/host')) {
                    navigate('/host/login');
                } else {
                    navigate('/join');
                }
            }
        };

        // Add event listener
        window.addEventListener('tokenRefreshFailed', handleRefreshFailed as EventListener);

        // Auto-start refresh timer if enabled and access token exists
        if (autoStart) {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                console.log('Starting auto-refresh for existing access token');
                tokenRefreshService.startAutoRefresh(accessToken);
            }
        }

        // Cleanup
        return () => {
            window.removeEventListener('tokenRefreshFailed', handleRefreshFailed as EventListener);
            if (autoStart) {
                tokenRefreshService.stopAutoRefresh();
            }
        };
    }, [autoStart, onRefreshFailed, navigate]);

    /**
     * Manually refresh the access token
     */
    const refreshToken = async (): Promise<string | null> => {
        try {
            const newToken = await tokenRefreshService.refreshAccessToken();
            if (newToken) {
                // Restart auto-refresh with new token
                tokenRefreshService.startAutoRefresh(newToken);
                // Don't show success toast for automatic refresh
                console.log('Access token refreshed silently');
            }
            return newToken;
        } catch (error) {
            console.error('Manual token refresh failed:', error);
            toast.error('Không thể gia hạn phiên đăng nhập');
            return null;
        }
    };

    /**
     * Start auto-refresh with a new access token
     */
    const startAutoRefresh = (accessToken: string): void => {
        tokenRefreshService.startAutoRefresh(accessToken);
    };

    /**
     * Stop auto-refresh
     */
    const stopAutoRefresh = (): void => {
        tokenRefreshService.stopAutoRefresh();
    };

    /**
     * Get a valid access token (refreshing if necessary)
     */
    const getValidToken = async (): Promise<string | null> => {
        return await tokenRefreshService.getValidAccessToken();
    };

    return {
        refreshToken,
        startAutoRefresh,
        stopAutoRefresh,
        getValidToken
    };
};

export default useTokenRefresh;
