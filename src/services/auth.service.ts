import http from "./http";

class AuthService {
    baseEndpoint: string 

    constructor () {
        this.baseEndpoint = "auth"
    }

    async isHost(data: any) {
        return await http.post(`${this.baseEndpoint}/isHost`, true, data )
    }

    async authenticateUser(data: any) {
        return await http.post(`${this.baseEndpoint}/token`, true, data )
    }

    async getAccessToken(data: any) {
        return await http.post(`${this.baseEndpoint}/access_token`, true, data )
    }

    async logout() {
        try {
            // Call backend logout endpoint to invalidate httpOnly cookies
            await http.post(`${this.baseEndpoint}/logout`, true, {})
        } catch (error) {
            console.error("Backend logout failed:", error)
            // Continue with client-side cleanup even if backend fails
        }

        // Clear localStorage tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('testId')
        localStorage.removeItem('playerList')
        localStorage.removeItem('questions')
        localStorage.removeItem('lastStartTime')

        // Clear any other game-related data
        localStorage.clear()

        return true
    }
}

const authService = new AuthService()
export default authService