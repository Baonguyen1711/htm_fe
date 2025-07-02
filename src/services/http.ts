import axios from "axios";
import tokenRefreshService from "./tokenRefresh.service";

class Http {
    baseUrl: string | undefined

    constructor() {
        this.baseUrl = process.env.REACT_APP_BASE_URL
    }

    private async request(
        method: string,
        endpoint: string,
        withCredentials: boolean,
        params?: Record<string, any>,
        data?: any,
        headers: Record<string, string> = {}
    ) {
        try {
            const isFormData = data instanceof FormData;

            // Get valid access token (refresh if needed) for authenticated requests
            let authHeaders = {};
            if (withCredentials) {
                const validToken = await tokenRefreshService.getValidAccessToken();
                if (validToken) {
                    authHeaders = { 'Authorization': `Bearer ${validToken}` };
                }
            }

            const response = await axios.request({
                method,
                url: `${this.baseUrl}/${endpoint}`,
                data,
                params,
                withCredentials,
                headers: {
                    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                    ...authHeaders,
                    ...headers,
                },
            })

            return response.data
        } catch (error: any) {
            // If we get 401 and it's an authenticated request, try to refresh token
            if (error.response?.status === 401 && withCredentials) {
                console.log('Received 401, attempting token refresh...');

                const newToken = await tokenRefreshService.refreshAccessToken();
                if (newToken) {
                    console.log('Token refreshed, retrying request...');

                    // Retry the request with new token
                    const authHeaders = { 'Authorization': `Bearer ${newToken}` };
                    const retryResponse = await axios.request({
                        method,
                        url: `${this.baseUrl}/${endpoint}`,
                        data,
                        params,
                        withCredentials,
                        headers: {
                            ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                            ...authHeaders,
                            ...headers,
                        },
                    });

                    return retryResponse.data;
                }
            }

            throw error
        }
    }

    async get(endpoint: string, isCreadential: boolean, params?:Record<string, any> ) {
        return this.request("GET", endpoint, isCreadential, params)
    }

    async post(endpoint: string, isCreadential: boolean, data: any, params?:Record<string, any>) {
        return this.request("POST", endpoint, isCreadential, params,data )
    }

    async put(endpoint: string, isCreadential: boolean, data: any,params?:Record<string, any>) {
        return this.request("PUT", endpoint, isCreadential, params, data )
    }

    async delete(endpoint: string, isCreadential: boolean, data: any, params?:Record<string, any>) {
        return this.request("DELETE", endpoint, isCreadential, params, data)
    }
}

const http = new Http()
export default http