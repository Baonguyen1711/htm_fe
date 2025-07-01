import { ref, onValue, set, database, serverTimestamp } from "../firebase-config"
import { DatabaseReference, Unsubscribe, onDisconnect, remove } from "firebase/database";
import { User, Question, Answer, Score } from "../type";
import axios from "axios";
import { useEffect } from "react";

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

// interface Scores {
//   [uid: string]: number;
// }

let lastStartTime = localStorage.getItem("lastStartTime")
  ? Number(localStorage.getItem("lastStartTime"))
  : null;


export const setupOnDisconnect = (
  roomId: string,
  userId: string,
  userData: any,
  onDisconnectCallback?: () => void
) => {
  const userRef = ref(database, `rooms/${roomId}/players/${userId}`);
  const disconnectHandler = onDisconnect(userRef);

  // Remove the user from players when disconnect happens
  disconnectHandler
    .remove()
    .then(() => {
      console.log(`onDisconnect handler set for user ${userId} in room ${roomId}`);
      if (onDisconnectCallback) onDisconnectCallback();
    })
    .catch((error) => {
      console.error("Failed to set onDisconnect handler:", error);
    });

  // Start heartbeat to keep user online and update lastActive
  const interval = setInterval(() => {
    set(userRef, { ...userData, lastActive: serverTimestamp() });
  }, 5000);

  // Cleanup: cancel onDisconnect and clear heartbeat
  return () => {
    clearInterval(interval);
    disconnectHandler
      .cancel()
      .then(() => console.log(`onDisconnect handler canceled for user ${userId}`))
      .catch((err) => console.error("Failed to cancel onDisconnect handler:", err));
  };
};

// Listen for real-time updates to players in a room
export const listenToPlayers = (roomId: string, callback: (data: User) => void): Unsubscribe => {
  console.log("roomId", roomId);

  const playersRef: DatabaseReference = ref(database, `rooms/${roomId}/players`);
  console.log("player ref", playersRef)
  const unsubscribe: Unsubscribe = onValue(playersRef, (snapshot) => {
    const data: User = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToQuestions = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const questionsRef: DatabaseReference = ref(database, `rooms/${roomId}/questions`);
  console.log("questiónsRef ref", questionsRef)


  const unsubscribe: Unsubscribe = onValue(questionsRef, (snapshot) => {

    if (!snapshot.exists()) {

      console.log("Path deleted or does not exist.");
      return;
    }
    const data: any = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};


export const listenToSelectedCell = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const cellsRef: DatabaseReference = ref(database, `rooms/${roomId}/cell`);
  console.log("cellsRef", cellsRef)
  const unsubscribe: Unsubscribe = onValue(cellsRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToCellColor = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const colorsRef: DatabaseReference = ref(database, `rooms/${roomId}/color`);
  console.log("colorsRef", colorsRef)
  const unsubscribe: Unsubscribe = onValue(colorsRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToCurrentQuestionsNumber = (roomId: string, callback: (data: number) => void): Unsubscribe => {
  const currentQuestionsNumbeRef: DatabaseReference = ref(database, `rooms/${roomId}/currentQuestions`);
  console.log("questiónsRef ref", currentQuestionsNumbeRef)
  const unsubscribe: Unsubscribe = onValue(currentQuestionsNumbeRef, (snapshot) => {
    const data: number = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToBuzzing = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const questionsRef: DatabaseReference = ref(database, `rooms/${roomId}/buzzedPlayer`);
  console.log("questiónsRef ref", questionsRef)
  const unsubscribe: Unsubscribe = onValue(questionsRef, (snapshot) => {
    if (!snapshot.exists()) {

      console.log("Path deleted or does not exist.");
      return;
    }
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToStar = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const starRef: DatabaseReference = ref(database, `rooms/${roomId}/star`);
  console.log("starRef", starRef)
  const unsubscribe: Unsubscribe = onValue(starRef, (snapshot) => {
    if (!snapshot.exists()) {

      console.log("Path deleted or does not exist.");
      return;
    }
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToObstacle = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const obstaclessRef: DatabaseReference = ref(database, `rooms/${roomId}/obstacles`);
  console.log("questiónsRef ref", obstaclessRef)
  const unsubscribe: Unsubscribe = onValue(obstaclessRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToPackets = (roomId: string, callback: (data: string[]) => void): Unsubscribe => {
  const packetsRef: DatabaseReference = ref(database, `rooms/${roomId}/packets`);
  console.log("packetsRef", packetsRef)
  const unsubscribe: Unsubscribe = onValue(packetsRef, (snapshot) => {
    const data: string[] = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToSelectedPacket = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const packetsRef: DatabaseReference = ref(database, `rooms/${roomId}/selectedPacket`);
  console.log("packetsRef", packetsRef)
  const unsubscribe: Unsubscribe = onValue(packetsRef, (snapshot) => {
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};


export const listenToCurrentTurn = (roomId: string, callback: (data: number) => void): Unsubscribe => {
  const turnRefs: DatabaseReference = ref(database, `rooms/${roomId}/turn`);
  console.log("turnRefs", turnRefs)
  const unsubscribe: Unsubscribe = onValue(turnRefs, (snapshot) => {
    const data: number = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToAnswers = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const answerRef: DatabaseReference = ref(database, `rooms/${roomId}/answers`);
  console.log("answerRef", answerRef)
  const unsubscribe: Unsubscribe = onValue(answerRef, (snapshot) => {
    if (!snapshot.exists()) {

      console.log("Path deleted or does not exist.");
      return;
    }
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToSound = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const soundRef: DatabaseReference = ref(database, `rooms/${roomId}/sound`);
  console.log("soundRef", soundRef)
  const unsubscribe: Unsubscribe = onValue(soundRef, (snapshot) => {
    if (!snapshot.exists()) {

      console.log("Path deleted or does not exist.");
      return;
    }
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

export const listenToOpenBuzz = (roomId: string, callback: (data: string) => void): Unsubscribe => {
  const buzzRef: DatabaseReference = ref(database, `rooms/${roomId}/openBuzzed`);
  console.log("buzzRef", buzzRef)
  const unsubscribe: Unsubscribe = onValue(buzzRef, (snapshot) => {
    const data: string = snapshot.val() || {};
    console.log("data", data)
    callback(data);
  });
  return unsubscribe; // Trả về hàm unsubscribe để cleanup
};

// export const listenToTimeStart = (roomId: string, callback: (data: string) => void): Unsubscribe => {
//   const timerRef: DatabaseReference = ref(database, `rooms/${roomId}/times`);
//   console.log("timerRef", timerRef)
//   const unsubscribe: Unsubscribe = onValue(timerRef, (snapshot) => {
//     const data: string = snapshot.val() || {};
//     console.log("data", data)
//     callback(data);
//   });
//   return unsubscribe; // Trả về hàm unsubscribe để cleanup
// };

export const listenToTimeStart = (roomId: string, callback: () => void): Unsubscribe => {
  console.log("START LISTENING TO TIME START");

  const timerRef: DatabaseReference = ref(database, `rooms/${roomId}/times`);
  let lastStartTime = Number(localStorage.getItem("lastStartTime")) || 0;
  let isFirstCall = true; // Flag to skip first execution
  console.log("timerRef", timerRef);
  console.log("lastStartTime", lastStartTime);



  const unsubscribe: Unsubscribe = onValue(timerRef, (snapshot) => {
    console.log("snapshot.val()", snapshot.val());

    const startTime = snapshot.val();
    console.log("time", startTime);
    console.log("abc 1");
    if (isFirstCall) {
      isFirstCall = false; // Skip the first execution
      return;
    }
    console.log("abc 2");

    if (startTime && startTime !== lastStartTime) {
      console.log("abc 3");

      lastStartTime = startTime;
      localStorage.setItem("lastStartTime", startTime.toString());
      callback();
    }
  });

  return unsubscribe;
};

// Listen for real-time updates to scores in a room
export const listenToScores = (roomId: string, callback: (data: Score[]) => void): Unsubscribe => {
  const scoresRef: DatabaseReference = ref(database, `rooms/${roomId}/scores`);
  const unsubscribe: Unsubscribe = onValue(scoresRef, (snapshot) => {
    const data: Score[] = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};

export const listenToHistory = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const historyRefs: DatabaseReference = ref(database, `rooms/${roomId}/round_scores`);
  const unsubscribe: Unsubscribe = onValue(historyRefs, (snapshot) => {
    const data: any = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};

export const listenToGrid = (roomId: string, callback: (data: string[][]) => void): Unsubscribe => {
  const scoresRef: DatabaseReference = ref(database, `rooms/${roomId}/grid`);
  const unsubscribe: Unsubscribe = onValue(scoresRef, (snapshot) => {
    const data: string[][] = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};


export const listenToRoundStart = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const roundsRef: DatabaseReference = ref(database, `rooms/${roomId}/rounds`);
  const unsubscribe: Unsubscribe = onValue(roundsRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    // console.log("round", data)
    callback(data);
  });
  return unsubscribe;
};


export const listenToSelectRow = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const rowsRef: DatabaseReference = ref(database, `rooms/${roomId}/select`);
  const unsubscribe: Unsubscribe = onValue(rowsRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    // console.log("round", data)
    callback(data);
  });
  return unsubscribe;
};

export const listenToIncorrectRow = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const rowsRef: DatabaseReference = ref(database, `rooms/${roomId}/incorrect`);
  const unsubscribe: Unsubscribe = onValue(rowsRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    // console.log("round", data)
    callback(data);
  });
  return unsubscribe;
};

export const listenToCorrectRow = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const rowsRef: DatabaseReference = ref(database, `rooms/${roomId}/correct`);
  
  
  
  const unsubscribe: Unsubscribe = onValue(rowsRef, (snapshot) => {

    const data: any = snapshot.val() || {};
    console.log("correct row", data);
    // console.log("round", data)
    callback(data);

  });
  return unsubscribe;
};



export const listenToBroadcastedAnswer = (roomId: string, callback: (data: Answer[]) => void): Unsubscribe => {
  const answerListRef: DatabaseReference = ref(database, `rooms/${roomId}/answerLists`);
  const unsubscribe: Unsubscribe = onValue(answerListRef, (snapshot) => {
    const data: Answer[] = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};

export const listenToSpectatorJoin = (roomId: string, callback: (count: number) => void): Unsubscribe => {
  const spectatorRef: DatabaseReference = ref(database, `rooms/${roomId}/spectators`);
  const unsubscribe: Unsubscribe = onValue(spectatorRef, (snapshot) => {
    console.log("spectatorRef",spectatorRef);
    
    console.log("snapshot",snapshot);
    
    console.log("snapshot size", snapshot.size);
    
    const count = snapshot.size;
    callback(count);
  });
  return unsubscribe;
};

export const listenToRules = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const rulesRef: DatabaseReference = ref(database, `rooms/${roomId}/rules`);
  const unsubscribe: Unsubscribe = onValue(rulesRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    callback(data);
  });
  return unsubscribe;
};

// export const listenToScore = (roomId: string, callback: (data: Answer[]) => void): Unsubscribe => {
//   const scoresRef: DatabaseReference = ref(database, `rooms/${roomId}/scores`);
//   const unsubscribe: Unsubscribe = onValue(scoresRef, (snapshot) => {
//     const data: Answer[] = snapshot.val() || {};
//     callback(data);
//   });
//   return unsubscribe;
// }
// Add a user to the players list in a room
export const addPlayerToRoom = async (roomId: string, uid: string, playerData: PlayerData): Promise<void> => {
  const playerRef: DatabaseReference = ref(database, `rooms/${roomId}/players/${uid}`);
  await set(playerRef, {
    joined_at: Date.now(),
    data: playerData, // e.g., { username: "Player1", points: 10 }
  });
};

export const removeSpectator = async (path: string): Promise<void> => {
  const spectatorRef: DatabaseReference = ref(database, path)
  const disconnectHandler = onDisconnect(spectatorRef);

  disconnectHandler
    .remove()
    .then(() => {
      console.log(`onDisconnect handler set for user with path ${path}`);
    })
    .catch((error) => {
      console.error("Failed to set onDisconnect handler:", error);
    });
};


export const authenticateUser = async (token: string) => {
  try {
    const response = await axios.post("http://localhost:8000/api/auth",
      JSON.stringify({ token }),
      {
        withCredentials: true, // Important for cookies
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (response.status !== 200) {
      throw new Error(`Failed to send answer, Status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching test data:', error);
    throw error; // Quăng lỗi để xử lý ở nơi gọi hàm
  }



}

export const listenToGridActions = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const roundsRef: DatabaseReference = ref(database, `rooms/${roomId}/rounds`);
  const unsubscribe: Unsubscribe = onValue(roundsRef, (snapshot) => {
    const data: any = snapshot.val() || {};
    // console.log("round", data)
    callback(data);
  });
  return unsubscribe;
};

export const deletePath = async (roomId: string, path: string): Promise<void> => {

  const pathRef = ref(database, `rooms/${roomId}/${path}`);
  console.log("delete path ref", pathRef);

  return remove(pathRef)
    .then(() => {
      console.log(`${path} for room ${roomId} deleted successfully.`);
    })
    .catch((error) => {
      console.error(`Failed to delete ${path} for room ${roomId}:`, error);
    });
};

// Listen for rules display changes
export const listenToRoundRules = (roomId: string, callback: (data: any) => void): Unsubscribe => {
  const rulesRef: DatabaseReference = ref(database, `rooms/${roomId}/showRules`);
  const unsubscribe: Unsubscribe = onValue(rulesRef, (snapshot) => {
    const data: any = snapshot.val() || null;
    console.log("Rules data:", data);
    callback(data);
  });
  return unsubscribe;
};