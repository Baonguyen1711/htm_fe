import { useCallback } from "react";
import { roomApi } from "../../services";
import { CreateRoomRequest, RoomValidationRequest } from "../../types";

export const useRoomApi = () => {

    const joinAsSpectator = useCallback(async (roomId: string) => {
        try {
            const spectatorPath = await roomApi.joinAsSpectator(roomId);
            console.log("Successfully joined as spectator, path:", spectatorPath.spectator_path);
            return spectatorPath.spectator_path;
        } catch (error) {
            throw error;
        }
    }, []);

    const getRoomsByUid = useCallback(async () => {
        try {
            const rooms = await roomApi.getRoomsByUserId();
            return rooms;
        } catch (error) {
            throw error;
        }
    }, []);

    const createRoom = useCallback(async (roomData: CreateRoomRequest) => {
        try {
            const room = await roomApi.createRoom(roomData);
            return room;
        } catch (error) {
            throw error;
        }
    }, []);

    const validateRoom = useCallback(async (roomId: string, password?: string) => {
        try {
            const params: any = { roomId: roomId };
            if (password) {
                params.password = password;
            }

            console.log("params", params);
            const response = await roomApi.validateRoom(params);
            return response;
        } catch (error) {
            throw error;
        }
    }, []);

    const retrieveHistory = useCallback(async () => {
        try {
            const history = await roomApi.retrieveHistory();
            return history;
        } catch (error) {
            throw error;
        }
    }, []);

    const playSound = useCallback(async (roomId: string, type: string) => {
        try {
            await roomApi.playSound(roomId, type);
        } catch (error) {
            throw error;
        }
    }, []);
    return {
        getRoomsByUid,
        validateRoom,
        createRoom,
        joinAsSpectator,

        // extra
        retrieveHistory,
        playSound,
    };

    

}

export default useRoomApi;
