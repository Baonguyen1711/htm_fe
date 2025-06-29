// Game Services - Abstracted game-related API calls
import axios from 'axios';
import { deletePath } from './firebaseServices';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000/api';

// Game Management Services
export const gameServices = {
  // Grid Management
  async sendGridToPlayers(grid: string[][], roomId: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test/grid?room_id=${roomId}`,
        { grid },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to send grid, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error sending grid to players:', error);
      throw error;
    }
  },

  // Round Management
  async goToNextRound(roomId: string, round: string, grid?: string[][]) {
    try {
      await deletePath(roomId, "questions");
      await deletePath(roomId, "answers");

      const response = await axios.post(
        `${API_BASE_URL}/rooms/round?room_id=${roomId}&round=${round}`,
        { grid },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to go to next round, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error going to next round:', error);
      throw error;
    }
  },

  // Sound Management
  async playSound(roomId: string, type: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sound/play?room_id=${roomId}&type=${type}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to play sound, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  },

  // Buzz Management
  async openBuzz(roomId: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test/buzz?room_id=${roomId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to open buzz, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error opening buzz:', error);
      throw error;
    }
  },

  async closeBuzz(roomId: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test/close_buzz?room_id=${roomId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to close buzz, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error closing buzz:', error);
      throw error;
    }
  },
};

// Player Action Services
export const playerServices = {
  async buzzing(roomId: string, playerName: string, avatar: string, position: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test/buzzing?room_id=${roomId}`,
        {
          player_name: playerName,
          avatar: avatar,
          position: position,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to buzz, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error buzzing:', error);
      throw error;
    }
  },

  async setStar(roomId: string, playerName: string, avatar: string, position: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/test/star?room_id=${roomId}`,
        {
          player_name: playerName,
          avatar: avatar,
          position: position,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to set star, Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error setting star:', error);
      throw error;
    }
  },
};

// Legacy function exports for backward compatibility
export const sendGridToPlayers = gameServices.sendGridToPlayers;
export const goToNextRound = gameServices.goToNextRound;
export const playSound = gameServices.playSound;
export const openBuzz = gameServices.openBuzz;
export const closeBuzz = gameServices.closeBuzz;
export const buzzing = playerServices.buzzing;
export const setStar = playerServices.setStar;
