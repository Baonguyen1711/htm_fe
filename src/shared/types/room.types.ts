// Room-related type definitions
import { BaseEntity, LoadingState } from './common.types';
import { PlayerData } from './user.types';
import { GameSettings } from './game.types';

export interface Room extends BaseEntity {
  roomId: string;
  name: string;
  hostId: string;
  hostName: string;
  testName: string;
  maxPlayers: number;
  currentPlayers: number;
  isActive: boolean;
  isPrivate: boolean;
  password?: string;
  settings: GameSettings;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface RoomPlayer extends PlayerData {
  isConnected?: boolean;
  role?: 'player' | 'spectator';
}

export interface RoomState {
  // Current room info
  currentRoom: Room | null;
  players: RoomPlayer[];
  spectatorsCount: number;

  // Current player info
  currentPlayer: RoomPlayer | null;
  
  // Room management
  isHost: boolean;
  isJoined: boolean;
  
  // Room lists
  availableRooms: Room[];
  myRooms: Room[];
  
  // Loading states
  loading: LoadingState;
  joining: LoadingState;
  creating: LoadingState;
}

export interface CreateRoomRequest {
  expired_time: number;
  max_players: number;
  password?: string;
}

export interface JoinRoomRequest {
  uid?: string;
  roomId: string;
  password?: string;
  userName: string;
  avatar: string;
  stt: string
}

export interface RoomValidationRequest {
  roomId: string;
  password?: string;
}

export interface RoomValidationResponse {
  isValid: boolean;
  requiresPassword: boolean;
  isFull: boolean;
  roomName: string;
  currentPlayers: number;
  maxPlayers: number;
}

// Real-time room events
export interface RoomEvent {
  type: 'player_joined' | 'player_left' | 'player_ready' | 'game_started' | 'game_ended' | 'host_changed';
  data: any;
  timestamp: number;
  roomId: string;
}

export interface SpectatorJoinRequest {
  roomId: string;
  spectatorName: string;
}
