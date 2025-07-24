// Room Redux slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RoomState, Room, RoomPlayer, CreateRoomRequest, JoinRoomRequest } from '../../../shared/types';

// Initial state
const initialState: RoomState = {
  // Current room info
  currentRoom: null,
  players: [],
  spectators: [],
  
  // Room management
  isHost: false,
  isJoined: false,
  
  // Room lists
  availableRooms: [],
  myRooms: [],
  
  // Loading states
  loading: {
    isLoading: false,
    error: null,
  },
  joining: {
    isLoading: false,
    error: null,
  },
  creating: {
    isLoading: false,
    error: null,
  },
};

// Async thunks
export const fetchAvailableRooms = createAsyncThunk(
  'room/fetchAvailableRooms',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/room');
      
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      
      const data = await response.json();
      return data.rooms;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (roomData: CreateRoomRequest, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      
      const data = await response.json();
      return data.room;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinRoom = createAsyncThunk(
  'room/joinRoom',
  async (joinData: JoinRoomRequest, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to join room');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveRoom = createAsyncThunk(
  'room/leaveRoom',
  async (roomId: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/room/${roomId}/leave`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to leave room');
      }
      
      return roomId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateRoom = createAsyncThunk(
  'room/validateRoom',
  async (params: { roomId: string; password?: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/room/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Room validation failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Room slice
const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    // Current room management
    setCurrentRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
    },
    
    updateCurrentRoom: (state, action: PayloadAction<Partial<Room>>) => {
      if (state.currentRoom) {
        state.currentRoom = { ...state.currentRoom, ...action.payload };
      }
    },
    
    // Player management
    setPlayers: (state, action: PayloadAction<RoomPlayer[]>) => {
      state.players = action.payload;
    },
    
    addPlayer: (state, action: PayloadAction<RoomPlayer>) => {
      const existingIndex = state.players.findIndex(p => p.uid === action.payload.uid);
      if (existingIndex === -1) {
        state.players.push(action.payload);
      } else {
        state.players[existingIndex] = action.payload;
      }
    },
    
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.uid !== action.payload);
    },
    
    updatePlayer: (state, action: PayloadAction<{ uid: string; updates: Partial<RoomPlayer> }>) => {
      const playerIndex = state.players.findIndex(p => p.uid === action.payload.uid);
      if (playerIndex !== -1) {
        state.players[playerIndex] = { ...state.players[playerIndex], ...action.payload.updates };
      }
    },
    
    // Spectator management
    setSpectators: (state, action: PayloadAction<RoomPlayer[]>) => {
      state.spectators = action.payload;
    },
    
    addSpectator: (state, action: PayloadAction<RoomPlayer>) => {
      const existingIndex = state.spectators.findIndex(s => s.uid === action.payload.uid);
      if (existingIndex === -1) {
        state.spectators.push(action.payload);
      }
    },
    
    removeSpectator: (state, action: PayloadAction<string>) => {
      state.spectators = state.spectators.filter(s => s.uid !== action.payload);
    },
    
    // Room status
    setIsHost: (state, action: PayloadAction<boolean>) => {
      state.isHost = action.payload;
    },
    
    setIsJoined: (state, action: PayloadAction<boolean>) => {
      state.isJoined = action.payload;
    },
    
    // Room lists
    setAvailableRooms: (state, action: PayloadAction<Room[]>) => {
      state.availableRooms = action.payload;
    },
    
    setMyRooms: (state, action: PayloadAction<Room[]>) => {
      state.myRooms = action.payload;
    },
    
    // Clear room data
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.players = [];
      state.spectators = [];
      state.isHost = false;
      state.isJoined = false;
    },
    
    // Error handling
    clearError: (state) => {
      state.loading.error = null;
      state.joining.error = null;
      state.creating.error = null;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch available rooms
    builder
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.loading.isLoading = true;
        state.loading.error = null;
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.loading.isLoading = false;
        state.availableRooms = action.payload;
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.loading.isLoading = false;
        state.loading.error = action.payload as string;
      });
    
    // Create room
    builder
      .addCase(createRoom.pending, (state) => {
        state.creating.isLoading = true;
        state.creating.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.creating.isLoading = false;
        state.currentRoom = action.payload;
        state.isHost = true;
        state.isJoined = true;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.creating.isLoading = false;
        state.creating.error = action.payload as string;
      });
    
    // Join room
    builder
      .addCase(joinRoom.pending, (state) => {
        state.joining.isLoading = true;
        state.joining.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.joining.isLoading = false;
        state.currentRoom = action.payload.room;
        state.isJoined = true;
        state.isHost = false;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.joining.isLoading = false;
        state.joining.error = action.payload as string;
      });
    
    // Leave room
    builder
      .addCase(leaveRoom.fulfilled, (state) => {
        state.currentRoom = null;
        state.players = [];
        state.spectators = [];
        state.isHost = false;
        state.isJoined = false;
      });
  },
});

export const {
  setCurrentRoom,
  updateCurrentRoom,
  setPlayers,
  addPlayer,
  removePlayer,
  updatePlayer,
  setSpectators,
  addSpectator,
  removeSpectator,
  setIsHost,
  setIsJoined,
  setAvailableRooms,
  setMyRooms,
  clearCurrentRoom,
  clearError,
} = roomSlice.actions;

export default roomSlice.reducer;
