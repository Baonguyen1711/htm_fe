import axios from "axios";
import { deletePath } from "../services/firebaseServices";
import { toast } from 'react-toastify';

export const sendGridToPlayers = async (grid: string[][], roomId: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/grid?room_id=${roomId}`,
            {
                "grid": grid
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to send answer, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const goToNextRound = async (roomId: string, round: string, grid?: string[][]) => {
    console.log("roomId in delete", roomId);

    await deletePath(roomId, "questions");
    await deletePath(roomId, "answers");
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/rooms/round?room_id=${roomId}&round=${round}`,
            {
                "grid": grid
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const setSelectedRow = async (roomId: string, row: string, isRow: boolean, wordLength: number) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/row/action?room_id=${roomId}&row_number=${row}&action=SELECT&is_row=${isRow}&word_length=${wordLength}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const setIncorectRow = async (roomId: string, row: string, isRow: boolean, wordLength: number) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/row/action?room_id=${roomId}&row_number=${row}&action=INCORRECT&is_row=${isRow}&word_length=${wordLength}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const setCorrectRow = async (roomId: string, row: string, correctAnswer: string, markedCharcterIndex: string, isRow: boolean, wordLength: number) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/row/action?room_id=${roomId}&row_number=${row}&action=CORRECT&correct_answer=${correctAnswer}&marked_characters_index=${markedCharcterIndex}&is_row=${isRow}&word_length=${wordLength}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const buzzing = async (roomId: string, playerName: string, stt: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/buzz?room_id=${roomId}`,
            {
                "stt": stt,
                "player_name": playerName
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const setStar = async (roomId: string, playerName: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/star?room_id=${roomId}`,
            {

                "player_name": playerName
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const resetBuzz = async (roomId: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/buzz/reset?room_id=${roomId}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const openObstacle = async (roomId: string, obstacleWord: string, placementArray: any) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/obstacle?room_id=${roomId}&obstacle=${obstacleWord}`,
            placementArray,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const getPacketNames = async (testName: string, roomId: string) => {
    try {
        const response = await axios.get(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/question/round/packet?test_name=${testName}&room_id=${roomId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const setCurrentPacketQuestion = async (roomId: string, questionNumber: number) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/question/current?question_number=${questionNumber}&room_id=${roomId}   `, {

        },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const setCurrentChunk = async (roomId: string, packetName: string, chunk: number, testName: string) => {
    try {
        const response = await axios.get(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/question?test_name=${testName}&room_id=${roomId}&packet_name=${packetName}&chunk=${chunk}&round=3   `,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const sendSelectedCell = async (roomId: string, colIndex: string, rowIndex: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/grid/cell?room_id=${roomId}&row_index=${rowIndex}&col_index=${colIndex}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const sendCellColor = async (roomId: string, colIndex: string, rowIndex: string, color: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/grid/color?room_id=${roomId}&row_index=${rowIndex}&col_index=${colIndex}&color=${color}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const sendCorrectAnswer = async (roomId: string, answer: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/test/answer?room_id=${roomId}`,
            {
                "answer": answer
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            toast.error(`Gửi câu trả lời thất bại`);
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const updateHistory = async (data: any) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/history/update`,
            data
            ,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}


export const openBuzz = async (roomId: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/buzz/open?room_id=${roomId}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const closeBuzz = async (roomId: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/buzz/close?room_id=${roomId}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}

export const playSound = async (roomId: string, type: string) => {
    try {
        const response = await axios.post(`https://1d68-2402-9d80-a50-f638-115b-68ac-7642-3852.ngrok-free.app/api/sound/play?room_id=${roomId}&type=${type}`,
            {

            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

        if (response.status !== 200) {
            throw new Error(`Failed to go to next round, Status: ${response.status}`);
        }

        // Phân tích dữ liệu từ response JSON
        return response.data;

    } catch (error) {
        console.error('Error fetching test data:', error);
        throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
    }
}


