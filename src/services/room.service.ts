import http from "./http";
import { User } from "../type";

class RoomService {
    baseEndpoint: string 

    constructor () {
        this.baseEndpoint = "room"
    }

    async getRoomByUser() {
        return await http.get("rooms", true)
    }

    async createRoom(expiredTime: number, password?: string) {
        const params: any = {expired_time: expiredTime};
        if (password) {
            params.password = password;
        }
        return await http.post(
            `${this.baseEndpoint}/create`,
            true,
            {

            },
            params
        )
    }

    async joinRoom(roomId: string, userInfo: User, password?: string) {
        const params: any = {room_id: roomId};
        if (password) {
            params.password = password;
        }
        return await http.post(
            `${this.baseEndpoint}/join`,
            true,
            userInfo,
            params
        )
    }
}

const roomService = new RoomService()
export default roomService