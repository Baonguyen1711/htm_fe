import { useCallback } from "react";
import testApi from "../../services/test/testApi";

export const useTestApi = () => {
    const getTestContent = useCallback(async (testName: string) => {
        try {
            const testContent = await testApi.getTestContent(testName);
            return testContent;
        } catch (error) {
            throw error;
        }
    }, []);
    const getTestsNameByUserId = useCallback( async () => {
        try {
            const tests = await testApi.getTestsNameByUserId();
            console.log("tests return by api", tests);
            return tests;
        } catch (error) {
            throw error;
        }
    }, []);
   
    const uploadTestToServer = useCallback(async (testName: string, file: File) => {
        try {
            console.log("testName", testName);
            console.log("file", file);
            const uploadedTest = await testApi.uploadTestToServer(testName, file);
            return uploadedTest;
        } catch (error) {
            throw error;
        }
    }, []);

    const updateQuestion = useCallback(async (question_id: string, updated_data: any) => {
        try {
            const updatedQuestion = await testApi.updateQuestion(question_id, updated_data);
            return updatedQuestion;
        } catch (error) {
            throw error;
        }
    }, []);
    return {
        uploadTestToServer,
        updateQuestion,
        getTestContent,
        getTestsNameByUserId,   
    };

    

}

export default useTestApi;
