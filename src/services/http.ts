import axios from "axios";

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
            const response = await axios.request({
                method,
                url: `${this.baseUrl}/${endpoint}`,
                data,
                params,
                withCredentials,
                headers: {

                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...headers,
                },
            })

            return response.data
        } catch (error) {
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