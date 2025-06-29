import http from "./http";
import { processFile } from "../utils/processFile.utils";

class TestManageMentService {
    baseEndpoint: string

    constructor() {
        this.baseEndpoint = "test"
    }

    async getTestNameByUser() {
        return await http.get(`${this.baseEndpoint}/user`, true)
    }

    async getTestContent(testName: string) {
        return await http.get(`${this.baseEndpoint}/${testName}`, true)
    }

    async uploadTestToServer(testName: string, file: File) {
        console.log("testName", testName);
        const formData = new FormData();
        formData.append("file", file);

        
        const uploadedFile = processFile(file)

        await http.post(
            `${this.baseEndpoint}/upload`,
            true, 
            formData,
            {"test_name": testName}
        )
    }
}

const testManageMentService = new TestManageMentService()
export default testManageMentService