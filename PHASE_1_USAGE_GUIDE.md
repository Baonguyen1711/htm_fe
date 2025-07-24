# Phase 1: Redux Toolkit Setup - Usage Guide

## 🎯 What Was Implemented

### 1. **New Directory Structure**
```
src/
├── app/
│   └── store/
│       ├── index.ts              # Store configuration
│       ├── slices/               # Redux slices
│       │   ├── authSlice.ts      # Authentication state
│       │   ├── gameSlice.ts      # Game state
│       │   ├── roomSlice.ts      # Room state
│       │   └── uiSlice.ts        # UI state
│       └── providers/
│           └── ReduxProvider.tsx # Redux provider component
└── shared/
    ├── types/                    # Modular type definitions
    │   ├── common.types.ts       # Common utility types
    │   ├── user.types.ts         # User-related types
    │   ├── game.types.ts         # Game-related types
    │   ├── room.types.ts         # Room-related types
    │   ├── api.types.ts          # API-related types
    │   └── index.ts              # Central type exports
    ├── components/
    │   └── ui/                   # Base UI components
    │       ├── Button/           # Button component
    │       └── Input/            # Input component
    └── constants/                # App constants
        ├── api.constants.ts      # API endpoints and configs
        ├── game.constants.ts     # Game-related constants
        └── index.ts              # Central constant exports
```

### 2. **Redux Store Setup**
- **Store Configuration**: Centralized store with proper TypeScript support
- **Four Main Slices**: Auth, Game, Room, and UI state management
- **Typed Hooks**: `useAppDispatch` and `useAppSelector` for type safety

### 3. **Type System**
- **Modular Types**: Separated by domain (user, game, room, api, common)
- **Proper TypeScript**: Full type safety across the application
- **Legacy Compatibility**: Backward compatibility during migration

### 4. **UI Component Library**
- **Button Component**: Fully typed with variants and sizes
- **Input Component**: Form input with validation states
- **Design System**: Consistent styling with Tailwind CSS

## 🚀 How to Use

### **Using Redux State**

```typescript
import { useAppSelector, useAppDispatch } from '@/app/store';
import { setUser, loginUser } from '@/app/store/slices/authSlice';
import { setCurrentRound, addPlayer } from '@/app/store/slices/gameSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  
  // Reading state
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const { currentRound, players } = useAppSelector(state => state.game);
  const { currentRoom } = useAppSelector(state => state.room);
  
  // Dispatching actions
  const handleLogin = async () => {
    await dispatch(loginUser({ email: 'user@example.com', password: 'password' }));
  };
  
  const handleRoundChange = () => {
    dispatch(setCurrentRound(2));
  };
  
  return (
    <div>
      <p>Current Round: {currentRound}</p>
      <p>Players: {players.length}</p>
    </div>
  );
}
```

### **Using New UI Components**

```typescript
import { Button, Input } from '@/shared/components/ui';

function LoginForm() {
  return (
    <form>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        isRequired
      />
      
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        isRequired
      />
      
      <Button
        variant="primary"
        size="lg"
        fullWidth
        isLoading={false}
      >
        Login
      </Button>
    </form>
  );
}
```

### **Using Types**

```typescript
import { User, Question, Room, GameState } from '@/shared/types';

interface MyComponentProps {
  user: User;
  questions: Question[];
  room: Room;
}

function MyComponent({ user, questions, room }: MyComponentProps) {
  // Component logic with full type safety
}
```

### **Using Constants**

```typescript
import { API_ENDPOINTS, ROUNDS, GAME_MODES } from '@/shared/constants';

// API calls
const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GAME.QUESTIONS}`);

// Game logic
if (currentRound === ROUNDS.ROUND_4) {
  // Round 4 specific logic
}

if (gameMode === GAME_MODES.AUTO) {
  // Auto mode logic
}
```

## 🔄 Migration Strategy

### **Current State**
- ✅ Redux store is set up and working
- ✅ Types are modularized and organized
- ✅ Base UI components are created
- ✅ Constants are centralized
- ✅ App.tsx is updated to use Redux provider

### **Legacy Code Still Active**
- 🔄 Old context providers (PlayerProvider, HostProvider, etc.)
- 🔄 Old type.ts file (kept for backward compatibility)
- 🔄 Existing components using old patterns
- 🔄 Services using old API patterns

### **Next Steps (Phase 2)**
1. **Migrate Services**: Update API services with proper error handling
2. **Create Custom Hooks**: Extract business logic from components
3. **Update Firebase Services**: Integrate with Redux state
4. **Add Middleware**: For logging, persistence, etc.

## 🎯 Benefits Achieved

### **1. Type Safety**
- Full TypeScript support across the application
- Compile-time error checking
- Better IntelliSense and autocomplete

### **2. State Management**
- Centralized state management with Redux Toolkit
- Predictable state updates
- Time-travel debugging with Redux DevTools

### **3. Code Organization**
- Clear separation of concerns
- Modular type definitions
- Consistent file structure

### **4. Developer Experience**
- Typed hooks for Redux
- Consistent UI components
- Centralized constants

### **5. Scalability**
- Feature-based architecture foundation
- Reusable components and types
- Easy to add new features

## 🚨 Important Notes

1. **Backward Compatibility**: Old context providers are still active during migration
2. **Gradual Migration**: Components can be migrated one by one
3. **Type Safety**: New types are available but old type.ts is still there
4. **Testing**: Test components as you migrate them

## 🔧 Development Workflow

1. **Use New Redux State**: For new components, use Redux instead of context
2. **Use New Types**: Import from `@/shared/types` instead of old type.ts
3. **Use New Components**: Use UI components from `@/shared/components/ui`
4. **Use Constants**: Import from `@/shared/constants` instead of hardcoding

This foundation is now ready for Phase 2 implementation!
