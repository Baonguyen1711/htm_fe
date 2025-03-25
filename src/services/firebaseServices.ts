// src/services/firebaseService.ts
import { ref, onValue, set, database } from "../firebase-config"
import { DatabaseReference, Unsubscribe } from "firebase/database";
import { User, Question } from "../type";

// Định nghĩa kiểu dữ liệu cho player và scores
interface PlayerData {
  username: string;
  points: number;
  [key: string]: any; // Cho phép các thuộc tính bổ sung
}

interface Player {
  joined_at: number;
  data: PlayerData;
}

interface Players {
  [uid: string]: Player;
}

interface Scores {
  [uid: string]: number;
}

// Listen for real-time updates to players in a room
export const listenToPlayers = (roomId: string, callback: (data: User) => void): Unsubscribe => {
  const playersRef: DatabaseReference = ref(database, `rooms/${roomId}/players`);
  console.log("player ref", playersRef)
  const unsubscribe: Unsubscribe = onValue(playersRef, (snapshot) => {
    const data: User = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToQuestions = (roomId: string, callback: (data: Question) => void): Unsubscribe => {
  const questionsRef: DatabaseReference = ref(database, `rooms/${roomId}/questions`);
  console.log("questiónsRef ref", questionsRef)
  const unsubscribe: Unsubscribe = onValue(questionsRef, (snapshot) => {
    const data: Question = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToAnswers = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const answerRef: DatabaseReference = ref(database, `rooms/${roomId}/answers`);
  console.log("answerRef", answerRef)
  const unsubscribe: Unsubscribe = onValue(answerRef, (snapshot) => {
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToTimeStart = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const timerRef: DatabaseReference = ref(database, `rooms/${roomId}/times`);
  console.log("timerRef", timerRef)
  const unsubscribe: Unsubscribe = onValue(timerRef, (snapshot) => {
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

// Listen for real-time updates to scores in a room
export const listenToScores = (roomId: string, callback: (data: Scores) => void): Unsubscribe => {
  const scoresRef: DatabaseReference = ref(database, `rooms/${roomId}/scores`);
  const unsubscribe: Unsubscribe = onValue(scoresRef, (snapshot) => {
    const data: Scores = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};

// Add a user to the players list in a room
export const addPlayerToRoom = async (roomId: string, uid: string, playerData: PlayerData): Promise<void> => {
  const playerRef: DatabaseReference = ref(database, `rooms/${roomId}/players/${uid}`);
  await set(playerRef, {
    joined_at: Date.now(),
    data: playerData, // e.g., { username: "Player1", points: 10 }
  });
};