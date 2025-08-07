// Redux store configuration
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices (will be created in next steps)
import authSlice from './slices/authSlice';
import gameSlice from './slices/gameSlice';
import roomSlice from './slices/roomSlice';
import uiSlice from './slices/uiSlice';
import localStorageMiddleware from './middleware/localStorageMiddleware';

// Create store without middleware first to avoid circular reference
const store = configureStore({
  reducer: {
    auth: authSlice,
    game: gameSlice,
    room: roomSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(localStorageMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
