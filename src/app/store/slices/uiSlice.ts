// UI Redux slice for managing global UI state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalState, ToastNotification } from '../../../shared/types';

export interface UIState {
  // Modal management
  modals: {
    [key: string]: ModalState;
  };
  
  // Toast notifications
  toasts: ToastNotification[];
  
  // Loading states for global operations
  globalLoading: boolean;
  
  // Theme and preferences
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  
  // Navigation and routing
  currentPage: string;
  previousPage: string;
  
  // Game UI specific
  showPlayerList: boolean;
  showScoreboard: boolean;
  showGameControls: boolean;
  
  // Round-specific UI
  selectedTopic: string;
  animationKey: number;
  
  // Form states
  forms: {
    [formId: string]: {
      isSubmitting: boolean;
      errors: { [field: string]: string };
    };
  };
  
  // Sidebar and navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
}

const initialState: UIState = {
  modals: {},
  toasts: [],
  globalLoading: false,
  theme: 'auto',
  soundEnabled: true,
  currentPage: '',
  previousPage: '',
  showPlayerList: true,
  showScoreboard: true,
  showGameControls: true,
  selectedTopic: '',
  animationKey: 0,
  forms: {},
  sidebarOpen: false,
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal management
    openModal: (state, action: PayloadAction<{ id: string; type: string; data?: any }>) => {
      state.modals[action.payload.id] = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    
    updateModalData: (state, action: PayloadAction<{ id: string; data: any }>) => {
      if (state.modals[action.payload.id]) {
        state.modals[action.payload.id].data = action.payload.data;
      }
    },
    
    clearModal: (state, action: PayloadAction<string>) => {
      delete state.modals[action.payload];
    },
    
    // Toast notifications
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const toast: ToastNotification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        autoClose: action.payload.autoClose ?? true,
        duration: action.payload.duration ?? 5000,
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearAllToasts: (state) => {
      state.toasts = [];
    },
    
    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    // Theme and preferences
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
      localStorage.setItem('soundEnabled', action.payload.toString());
    },
    
    // Navigation
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.previousPage = state.currentPage;
      state.currentPage = action.payload;
    },
    
    // Game UI
    setShowPlayerList: (state, action: PayloadAction<boolean>) => {
      state.showPlayerList = action.payload;
    },
    
    setShowScoreboard: (state, action: PayloadAction<boolean>) => {
      state.showScoreboard = action.payload;
    },
    
    setShowGameControls: (state, action: PayloadAction<boolean>) => {
      state.showGameControls = action.payload;
    },
    
    // Round-specific UI
    setSelectedTopic: (state, action: PayloadAction<string>) => {
      state.selectedTopic = action.payload;
    },
    
    incrementAnimationKey: (state) => {
      state.animationKey += 1;
    },
    
    setAnimationKey: (state, action: PayloadAction<number>) => {
      state.animationKey = action.payload;
    },
    
    // Form management
    setFormSubmitting: (state, action: PayloadAction<{ formId: string; isSubmitting: boolean }>) => {
      if (!state.forms[action.payload.formId]) {
        state.forms[action.payload.formId] = { isSubmitting: false, errors: {} };
      }
      state.forms[action.payload.formId].isSubmitting = action.payload.isSubmitting;
    },
    
    setFormErrors: (state, action: PayloadAction<{ formId: string; errors: { [field: string]: string } }>) => {
      if (!state.forms[action.payload.formId]) {
        state.forms[action.payload.formId] = { isSubmitting: false, errors: {} };
      }
      state.forms[action.payload.formId].errors = action.payload.errors;
    },
    
    clearFormErrors: (state, action: PayloadAction<string>) => {
      if (state.forms[action.payload]) {
        state.forms[action.payload].errors = {};
      }
    },
    
    clearForm: (state, action: PayloadAction<string>) => {
      delete state.forms[action.payload];
    },
    
    // Sidebar and navigation
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
      };
    },
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  updateModalData,
  clearModal,
  
  // Toast actions
  addToast,
  removeToast,
  clearAllToasts,
  
  // Global loading
  setGlobalLoading,
  
  // Theme and preferences
  setTheme,
  setSoundEnabled,
  
  // Navigation
  setCurrentPage,
  
  // Game UI
  setShowPlayerList,
  setShowScoreboard,
  setShowGameControls,
  
  // Round-specific UI
  setSelectedTopic,
  incrementAnimationKey,
  setAnimationKey,
  
  // Form management
  setFormSubmitting,
  setFormErrors,
  clearFormErrors,
  clearForm,
  
  // Sidebar and navigation
  setSidebarOpen,
  setMobileMenuOpen,
  toggleSidebar,
  toggleMobileMenu,
  
  // Reset
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
