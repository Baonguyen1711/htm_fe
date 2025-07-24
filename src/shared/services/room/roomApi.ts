// Room API service
import { api } from '../api/client';
import { API_ENDPOINTS } from '../../constants';
import { 
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  GetRoomsResponse,
  RoomValidationRequest,
  RoomValidationResponse,
  SpectatorJoinRequest,
  Room
} from '../../types';

export const roomApi = {
  /**
   * Get all available rooms
   */
  async getRooms(): Promise<Room[]> {
    const response = await api.get<Room[]>(API_ENDPOINTS.ROOM.BASE);
    return response.data.data;
  },

  /**
   * Get rooms by user ID
   */
  async getRoomsByUserId(): Promise<Room[]> {
    const response = await api.get<Room[]>(`${API_ENDPOINTS.ROOM.BASE}/user`);
    return response.data.data;
  },

  /**
   * Create a new room
   */
  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    const response = await api.post<Room>(API_ENDPOINTS.ROOM.BASE, roomData);
    return response.data.data;
  },

  /**
   * Validate room before joining
   */
  async validateRoom(params: RoomValidationRequest): Promise<RoomValidationResponse> {
    const response = await api.post<RoomValidationResponse>(
      API_ENDPOINTS.ROOM.VALIDATE,
      params
    );
    return response.data.data;
  },

  /**
   * Join a room as player
   */
  async joinRoom(joinData: JoinRoomRequest): Promise<{ room: Room; accessToken: string }> {
    const response = await api.post<{ room: Room; accessToken: string }>(
      API_ENDPOINTS.ROOM.JOIN,
      joinData
    );
    return response.data.data;
  },

  /**
   * Join a room as spectator
   */
  async joinAsSpectator(spectatorData: SpectatorJoinRequest): Promise<{ room: Room; accessToken: string }> {
    const response = await api.post<{ room: Room; accessToken: string }>(
      `${API_ENDPOINTS.ROOM.BASE}${API_ENDPOINTS.ROOM.SPECTATOR}`,
      spectatorData
    );
    return response.data.data;
  },

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROOM.BASE}/${roomId}${API_ENDPOINTS.ROOM.LEAVE}`);
  },

  /**
   * Update room settings (host only)
   */
  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room> {
    const response = await api.patch<Room>(`${API_ENDPOINTS.ROOM.BASE}/${roomId}`, updates);
    return response.data.data;
  },

  /**
   * Delete a room (host only)
   */
  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.ROOM.BASE}/${roomId}`);
  },

  /**
   * Get room details
   */
  async getRoomDetails(roomId: string): Promise<Room> {
    const response = await api.get<Room>(`${API_ENDPOINTS.ROOM.BASE}/${roomId}`);
    return response.data.data;
  },

  /**
   * Kick player from room (host only)
   */
  async kickPlayer(roomId: string, playerId: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROOM.BASE}/${roomId}/kick`, { playerId });
  },

  /**
   * Start game in room (host only)
   */
  async startGame(roomId: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROOM.BASE}/${roomId}/start`);
  },

  /**
   * End game in room (host only)
   */
  async endGame(roomId: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.ROOM.BASE}/${roomId}/end`);
  },
};

export default roomApi;
