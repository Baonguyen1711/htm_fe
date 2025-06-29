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
}

const authService = new AuthService()
export default authService