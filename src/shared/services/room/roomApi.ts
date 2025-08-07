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

interface PlayerRound {
    avatar: string;
    isCorrect: boolean | null;
    isModified: boolean | null;
    playerName: string;
    roundScore: number;
    stt: string;
}

interface RoomData {
    created_at: string;
    room_id: string;
    round_1: PlayerRound[];
    round_2: PlayerRound[];
    round_3: PlayerRound[] | null;
    round_4: PlayerRound[];
}

export const roomApi = {
  /**
   * Get all available rooms
   */
  async getRooms(): Promise<Room[]> {
    const response = await api.get<Room[]>(API_ENDPOINTS.ROOM.BASE);
    return response.data;
  },

  /**
   * Get rooms by user ID
   */
  async getRoomsByUserId() {
    const response = await api.get(`${API_ENDPOINTS.ROOM.BASE}/user`);
    return response.data;
  },

  /**
   * Create a new room
   */
  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    const response = await api.post<Room>(`${API_ENDPOINTS.ROOM.CREATE}?expired_time=${roomData.expired_time}&max_players=${roomData.max_players}`,
      
    );
    return response.data;
  },

  /**
   * Validate room before joining
   */
  async validateRoom(params: RoomValidationRequest): Promise<RoomValidationResponse> {
    console.log("params in endpoint", params);
    const response = await api.post<RoomValidationResponse>(
      `${API_ENDPOINTS.ROOM.VALIDATE}?room_id=${params.roomId}&password=${params.password}`,
      {},
      { _isNotAuthRequired: true } as any
    );
    return response.data;
  },

  /**
   * Get room information including available positions
   */
  async getRoomInfo(roomId: string, password?: string): Promise<{
    room_id: string;
    max_players: number;
    current_players_count: number;
    occupied_positions: number[];
    available_positions: number[];
    current_players: Array<{
      uid: string;
      userName: string;
      stt: string;
      avatar: string;
    }>;
  }> {
    const params = new URLSearchParams({ room_id: roomId });
    if (password) {
      params.append('password', password);
    }
    const response = await api.get(`${API_ENDPOINTS.ROOM.BASE}/info?${params.toString()}`);
    return response.data;
  },

  /**
   * Join a room as player
   */
  async joinRoom(joinData: JoinRoomRequest): Promise<{ room: Room; accessToken: string }> {
    const response = await api.post<{ room: Room; accessToken: string }>(
      API_ENDPOINTS.ROOM.JOIN,
      joinData
    );
    return response.data;
  },

  /**
   * Join a room as spectator
   */
  async joinAsSpectator(room_id: string): Promise<{
    spectator_path: string;
    message: string;
  }> {
    const response = await api.post(
      `${API_ENDPOINTS.ROOM.SPECTATOR}?room_id=${room_id}`,
    );
    return response.data;
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
    return response.data;
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
    return response.data;
  },

  /**
   * Kick player from room (host only)
   */
  async kickPlayer(roomId: string, playerUid: string): Promise<{
    message: string;
    kicked_player: string;
    updated_players: any[];
  }> {
    const response = await api.post(`${API_ENDPOINTS.ROOM.BASE}/kick?room_id=${roomId}&player_uid=${playerUid}`);
    return response.data;
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

  /**
   * retrive history
   */
  async retrieveHistory(): Promise<RoomData[]> {
    const response = await api.get(`${API_ENDPOINTS.HISTORY.RETRIEVE}`);
    return response.data;
  },

  /**
   * send play sound signal
   */

  async playSound(roomId: string, type: string): Promise<void> {
    await api.post(`${API_ENDPOINTS.SOUND.PLAY}?room_id=${roomId}&type=${type}`);
  },
};

export default roomApi;
