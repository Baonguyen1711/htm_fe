# Phase 2: Services & Hooks - Usage Guide

## 🎯 What Was Implemented

### 1. **API Client with Interceptors**
```
src/shared/services/api/
├── client.ts                 # Axios client with interceptors
```

### 2. **Service Layer**
```
src/shared/services/
├── auth/
│   ├── authApi.ts           # Authentication API calls
│   └── tokenService.ts      # Token management
├── game/
│   └── gameApi.ts           # Game API calls
├── room/
│   └── roomApi.ts           # Room API calls
└── firebase/
    ├── config.ts            # Firebase configuration
    └── realtime.ts          # Firebase real-time service
```

### 3. **Custom Hooks**
```
src/shared/hooks/
├── api/
│   ├── useAuthApi.ts        # Authentication hook
│   └── useGameApi.ts        # Game API hook
├── firebase/
│   └── useFirebaseListener.ts # Firebase real-time hook
└── common/
    ├── useAsync.ts          # Async operations hook
    ├── useLocalStorage.ts   # Local storage hook
    └── useDebounce.ts       # Debounce hook
```

## 🚀 How to Use

### **Using API Client**

```typescript
import { api } from '@/shared/services';

// Direct API calls
const response = await api.get<Question[]>('/game/questions');
const data = await api.post<Room>('/room', roomData);

// Automatic token handling
// Automatic error handling
// Request/response logging in development
```

### **Using Authentication Hook**

```typescript
import { useAuthApi } from '@/shared/hooks';

function LoginComponent() {
  const { login, isLoading, error, isAuthenticated } = useAuthApi();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // Automatically handles token storage and Redux state
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### **Using Game API Hook**

```typescript
import { useGameApi } from '@/shared/hooks';

function GameComponent() {
  const { 
    getQuestions, 
    submitPlayerAnswer, 
    updateGameScoring,
    loading,
    currentQuestion,
    scores 
  } = useGameApi();

  const handleGetQuestions = async () => {
    try {
      const questions = await getQuestions({
        testName: 'test1',
        round: 1,
        difficulty: 'easy'
      });
      // Questions automatically stored in Redux
    } catch (error) {
      console.error('Failed to get questions:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGetQuestions} disabled={loading.isLoading}>
        Get Questions
      </button>
      {currentQuestion && <p>{currentQuestion.question}</p>}
    </div>
  );
}
```

### **Using Firebase Listener Hook**

```typescript
import { useFirebaseListener } from '@/shared/hooks';

function GameRoom({ roomId }: { roomId: string }) {
  const {
    setupAllListeners,
    updatePlayer,
    setCurrentQuestionFirebase
  } = useFirebaseListener(roomId);

  useEffect(() => {
    // Setup all Firebase listeners
    const unsubscribe = setupAllListeners({
      onPlayerAnswersChange: (answers) => {
        console.log('Player answers updated:', answers);
      },
      onQuestionChange: (question) => {
        console.log('Question changed:', question);
      },
      onScoresChange: (scores) => {
        console.log('Scores updated:', scores);
      },
    });

    return unsubscribe; // Cleanup on unmount
  }, [setupAllListeners]);

  const handleUpdatePlayer = async () => {
    await updatePlayer('player123', {
      answer: 'My answer',
      isCorrect: true,
      score: 10
    });
  };

  return (
    <div>
      <button onClick={handleUpdatePlayer}>Update Player</button>
    </div>
  );
}
```

### **Using Utility Hooks**

```typescript
import { useAsync, useLocalStorage, useDebounce } from '@/shared/hooks';

function UtilityExample() {
  // Async operations
  const { data, loading, error, execute } = useAsync(
    async (id: string) => {
      const response = await api.get(`/data/${id}`);
      return response.data;
    }
  );

  // Local storage
  const [settings, setSettings] = useLocalStorage('gameSettings', {
    soundEnabled: true,
    theme: 'dark'
  });

  // Debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      execute(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, execute]);

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      {loading && <p>Loading...</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
    </div>
  );
}
```

## 🔧 Key Features

### **1. Automatic Token Management**
- ✅ Automatic token refresh
- ✅ Token expiry handling
- ✅ Automatic logout on token failure
- ✅ Request interceptors add tokens automatically

### **2. Error Handling**
- ✅ Centralized error handling in API client
- ✅ Proper error types and messages
- ✅ Development logging
- ✅ Redux state updates on errors

### **3. Real-time Integration**
- ✅ Firebase listeners integrated with Redux
- ✅ Automatic state synchronization
- ✅ Proper cleanup on unmount
- ✅ Callback support for custom logic

### **4. Performance Optimization**
- ✅ Debounced operations
- ✅ Async state management
- ✅ Proper cleanup and cancellation
- ✅ Memoized callbacks

## 🔄 Migration from Legacy Code

### **Replace Old API Calls**
```typescript
// OLD WAY
import { gameServices } from './services/gameServices';

const questions = await gameServices.getQuestions(params);

// NEW WAY
import { useGameApi } from '@/shared/hooks';

const { getQuestions } = useGameApi();
const questions = await getQuestions(params);
```

### **Replace Old Context Usage**
```typescript
// OLD WAY
import { usePlayer } from './context/playerContext';

const { players, updatePlayer } = usePlayer();

// NEW WAY
import { useAppSelector } from '@/app/store';
import { useFirebaseListener } from '@/shared/hooks';

const players = useAppSelector(state => state.game.players);
const { updatePlayer } = useFirebaseListener(roomId);
```

### **Replace Old Firebase Calls**
```typescript
// OLD WAY
import { database } from './firebase-config';
import { ref, onValue } from 'firebase/database';

onValue(ref(database, `rooms/${roomId}/players`), (snapshot) => {
  // Manual state management
});

// NEW WAY
import { useFirebaseListener } from '@/shared/hooks';

const { listenToPlayerAnswers } = useFirebaseListener(roomId);

useEffect(() => {
  return listenToPlayerAnswers((answers) => {
    // Automatic Redux state updates
  });
}, [listenToPlayerAnswers]);
```

## 🎯 Benefits Achieved

### **1. Type Safety**
- Full TypeScript support in all services and hooks
- Proper error types and API response types
- IntelliSense support for all operations

### **2. Centralized State Management**
- All API operations update Redux state automatically
- Consistent state across components
- Real-time synchronization with Firebase

### **3. Error Handling**
- Centralized error handling and logging
- Proper error recovery (token refresh)
- User-friendly error messages

### **4. Performance**
- Debounced operations
- Proper cleanup and cancellation
- Optimized re-renders

### **5. Developer Experience**
- Easy-to-use hooks
- Consistent API patterns
- Comprehensive documentation

## 🚀 Ready for Phase 3

Your application now has:
- ✅ **Robust API Layer** - Proper error handling and token management
- ✅ **Custom Hooks** - Business logic extracted from components
- ✅ **Firebase Integration** - Real-time data synchronized with Redux
- ✅ **Utility Hooks** - Common patterns abstracted
- ✅ **Type Safety** - Full TypeScript support

Next: **Phase 3: Component Migration** - Start migrating existing components to use the new hooks and Redux state.
