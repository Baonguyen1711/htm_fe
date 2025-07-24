// Firebase Realtime Database service
import { 
  ref, 
  onValue, 
  off, 
  set, 
  update, 
  remove, 
  push, 
  get,
  DatabaseReference,
  DataSnapshot,
  Unsubscribe
} from 'firebase/database';
import { database } from './config';
import { PlayerData, Question, Score } from '../../types';

export class FirebaseRealtimeService {
  private listeners: Map<string, Unsubscribe> = new Map();

  /**
   * Listen to room data changes
   */
  listenToRoom(roomId: string, callback: (data: any) => void): () => void {
    const roomRef = ref(database, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    const listenerId = `room_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Listen to player answers
   */
  listenToPlayerAnswers(roomId: string, callback: (answers: Record<string, PlayerData>) => void): () => void {
    const answersRef = ref(database, `rooms/${roomId}/player_answer`);
    
    const unsubscribe = onValue(answersRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      callback(data);
    });

    const listenerId = `answers_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Listen to current question
   */
  listenToCurrentQuestion(roomId: string, callback: (question: Question | null) => void): () => void {
    const questionRef = ref(database, `rooms/${roomId}/current_question`);
    
    const unsubscribe = onValue(questionRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    const listenerId = `question_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Listen to scores
   */
  listenToScores(roomId: string, callback: (scores: Score[]) => void): () => void {
    const scoresRef = ref(database, `rooms/${roomId}/scores`);
    
    const unsubscribe = onValue(scoresRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || [];
      callback(Array.isArray(data) ? data : Object.values(data));
    });

    const listenerId = `scores_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Listen to game state
   */
  listenToGameState(roomId: string, callback: (state: any) => void): () => void {
    const gameStateRef = ref(database, `rooms/${roomId}/game_state`);
    
    const unsubscribe = onValue(gameStateRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    const listenerId = `gameState_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Listen to Round 2 grid
   */
  listenToRound2Grid(roomId: string, callback: (grid: any) => void): () => void {
    const gridRef = ref(database, `rooms/${roomId}/round2_grid`);
    
    const unsubscribe = onValue(gridRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    const listenerId = `round2Grid_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Listen to Round 4 grid
   */
  listenToRound4Grid(roomId: string, callback: (grid: any) => void): () => void {
    const gridRef = ref(database, `rooms/${roomId}/round4_grid`);
    
    const unsubscribe = onValue(gridRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    const listenerId = `round4Grid_${roomId}`;
    this.listeners.set(listenerId, unsubscribe);

    return () => {
      this.removeListener(listenerId);
    };
  }

  /**
   * Update player data
   */
  async updatePlayer(roomId: string, playerId: string, playerData: Partial<PlayerData>): Promise<void> {
    const playerRef = ref(database, `rooms/${roomId}/player_answer/${playerId}`);
    await update(playerRef, playerData);
  }

  /**
   * Set current question
   */
  async setCurrentQuestion(roomId: string, question: Question): Promise<void> {
    const questionRef = ref(database, `rooms/${roomId}/current_question`);
    await set(questionRef, question);
  }

  /**
   * Update scores
   */
  async updateScores(roomId: string, scores: Score[]): Promise<void> {
    const scoresRef = ref(database, `rooms/${roomId}/scores`);
    await set(scoresRef, scores);
  }

  /**
   * Update game state
   */
  async updateGameState(roomId: string, gameState: any): Promise<void> {
    const gameStateRef = ref(database, `rooms/${roomId}/game_state`);
    await update(gameStateRef, gameState);
  }

  /**
   * Remove a specific listener
   */
  removeListener(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  /**
   * Get data once (no listener)
   */
  async getData(path: string): Promise<any> {
    const dataRef = ref(database, path);
    const snapshot = await get(dataRef);
    return snapshot.val();
  }

  /**
   * Set data
   */
  async setData(path: string, data: any): Promise<void> {
    const dataRef = ref(database, path);
    await set(dataRef, data);
  }

  /**
   * Update data
   */
  async updateData(path: string, updates: any): Promise<void> {
    const dataRef = ref(database, path);
    await update(dataRef, updates);
  }

  /**
   * Remove data
   */
  async removeData(path: string): Promise<void> {
    const dataRef = ref(database, path);
    await remove(dataRef);
  }
}

// Create singleton instance
export const firebaseRealtimeService = new FirebaseRealtimeService();

export default firebaseRealtimeService;
