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

    async createRoom(expiredTime: number) {
        return await http.post(
            `${this.baseEndpoint}/create`, 
            true,
            {
                
            },
            {expired_time: expiredTime}
        )
    }

    async joinRoom(roomId: string, userInfo: User) {
        return await http.post(
            `${this.baseEndpoint}/join`,
            true,
            userInfo,
            {room_id: roomId}
        )
    }
}

const roomService = new RoomService()
export default roomService