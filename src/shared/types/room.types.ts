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
  joinedAt: string;
  isReady: boolean;
  isConnected: boolean;
  role: 'player' | 'spectator';
}

export interface RoomState {
  // Current room info
  currentRoom: Room | null;
  players: RoomPlayer[];
  spectators: RoomPlayer[];
  
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
  name: string;
  testName: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  settings: GameSettings;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
  playerName: string;
  avatar: string;
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
