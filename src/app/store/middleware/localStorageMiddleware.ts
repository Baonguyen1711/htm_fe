// Redux middleware to sync specific state to localStorage
import { Middleware } from '@reduxjs/toolkit';

// Simple localStorage utilities
const setCurrentPlayerToStorage = (player: any): boolean => {
  try {
    if (!player || !player.uid) {
      console.warn('⚠️ Invalid player data, not saving to localStorage');
      return false;
    }
    localStorage.setItem('currentPlayer', JSON.stringify(player));
    console.log('✅ Synced currentPlayer to localStorage:', player);
    return true;
  } catch (error) {
    console.error('❌ Failed to sync currentPlayer to localStorage:', error);
    return false;
  }
};

const clearCurrentPlayerFromStorage = (): void => {
  try {
    localStorage.removeItem('currentPlayer');
    console.log('🗑️ Cleared currentPlayer from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear currentPlayer from localStorage:', error);
  }
};

// Define the middleware without circular reference
const localStorageMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Get the updated state after the action
  const state = store.getState() as any; // Use any to avoid circular reference

  // Sync currentPlayer to localStorage when it changes
  if (action.type && (action.type.includes('setCurrentPlayer') || action.type.includes('joinRoom'))) {
    console.log(`🔄 Action triggered localStorage sync: ${action.type}`);

    const currentPlayer = state.room?.currentPlayer || state.game?.currentPlayer;

    if (currentPlayer) {
      setCurrentPlayerToStorage(currentPlayer);
    } else {
      console.warn('⚠️ No currentPlayer found in state after action');
      console.log('Room currentPlayer:', state.room?.currentPlayer);
      console.log('Game currentPlayer:', state.game?.currentPlayer);
    }
  }

  // Clear localStorage when player leaves
  if (action.type && (action.type.includes('clearCurrentRoom') || action.type.includes('resetGame') || action.type.includes('leaveRoom'))) {
    console.log(`🗑️ Action triggered localStorage clear: ${action.type}`);
    clearCurrentPlayerFromStorage();
  }

  return result;
};

export default localStorageMiddleware;
