import { ref, onValue, Unsubscribe, onDisconnect, get, remove, serverTimestamp, DatabaseReference, update, off } from "firebase/database";
import { database } from "./config";
import { User } from "../../types";
import { PlayerData, Score } from "../../types";


const firebaseServices = {
  listen: (roomId: string, child: string, callback: (data: any) => void, skipFirst = false): Unsubscribe => {
    const fullRef = ref(database, `rooms/${roomId}/${child}`);
    let isFirst = true;
    const unsubscribe: Unsubscribe = onValue(fullRef, (snapshot) => {
      if (skipFirst && isFirst) {
        isFirst = false;
        return;
      }
      console.log("snapshot", snapshot)
      const data: any = snapshot.val();
      callback(data);
    });
    return unsubscribe;
  },

  listenToPlayers: (roomId: string, callback: (data: User[]) => void) => {
    console.log("room Id inside", roomId);
    console.log("callback", callback);
    return firebaseServices.listen(roomId, "players", callback);
  },

  listenToQuestion: (roomId: string, callback: (data: any) => void) => {
    console.log(" listenToQuestion = ");
    console.log("roomId", roomId);
    console.log("callback", callback);
    return firebaseServices.listen(roomId, "questions", callback);
  },

  listenToSelectedCell: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "cell", callback);
  },

  listenToCellColor: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "color", callback);
  },

  listenToCurrentQuestionsNumber: (roomId: string, callback: (data: number) => void) => {
    return firebaseServices.listen(roomId, "currentQuestions", callback);
  },

  listenToBuzzing: (roomId: string, callback: (data: string) => void) => {
    return firebaseServices.listen(roomId, "buzzedPlayer", callback, true);
  },

  listenToStar: (roomId: string, callback: (data: string) => void) => {
    return firebaseServices.listen(roomId, "star", callback);
  },

  listenToPlayerColors: (roomId: string, callback: (data: Record<string, string>) => void) => {
    return firebaseServices.listen(roomId, "player_colors", callback);
  },

  listenToObstacle: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "obstacle", callback, true);
  },

  listenToRound2Grid: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "grid", callback);
  },

  listenToPackets: (roomId: string, callback: (data: string[]) => void) => {
    return firebaseServices.listen(roomId, "packets", callback);
  },

  listenToSelectedPacket: (roomId: string, callback: (data: string) => void) => {
    return firebaseServices.listen(roomId, "selectedPacket", callback);
  },

  listenToCurrentTurn: (roomId: string, callback: (data: number) => void) => {
    return firebaseServices.listen(roomId, "turn", callback);
  },

  listenToCorrectAnswer: (roomId: string, callback: (data: string[]) => void) => {
    return firebaseServices.listen(roomId, "answers", callback, true);
  },

  listenToSound: (roomId: string, callback: (data: string) => void) => {
    return firebaseServices.listen(roomId, "sound", callback, true);
  },

  listenToOpenBuzz: (roomId: string, callback: (data: string) => void) => {
    return firebaseServices.listen(roomId, "openBuzzed", callback);
  },

  listenToTimeStart: (roomId: string, callback?: () => void): Unsubscribe => {
    const refPath = ref(database, `rooms/${roomId}/times`);
    let isFirstCall = true;
    let lastStartTime = Number(localStorage.getItem("lastStartTime")) || 0;

    const unsubscribe: Unsubscribe = onValue(refPath, (snapshot) => {
      const time = snapshot.val();
      if (isFirstCall) {
        isFirstCall = false;
        return;
      }
      if (time && time !== lastStartTime) {
        lastStartTime = time;
        localStorage.setItem("lastStartTime", time.toString());
        if (callback) {
          callback();
        }
      }
    });
    return unsubscribe;
  },

  listenToScores: (roomId: string, callback: (data: Partial<PlayerData[]>) => void) => {
    return firebaseServices.listen(roomId, "scores", callback);
  },

  //listen to score on player side
  listenToScoresRanking: (roomId: string, callback: (data: Score[]) => void) => {
    return firebaseServices.listen(roomId, "scores", callback);
  },

  listenToFinalGameScores: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "round_scores", callback);
  },

  listenToGrid: (roomId: string, callback: (data: string[][]) => void) => {
    return firebaseServices.listen(roomId, "grid", callback);
  },

  listenToRoundStart: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "rounds", callback);
  },

  listenToSelectRow: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "select", callback, true);
  },


  listenToIncorrectRow: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "incorrect", callback, true);
  },

  listenToCorrectRow: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "correct", callback, true);
  },

  listenToBroadcastedAnswer: (roomId: string, callback: (data: Partial<PlayerData[]>) => void) => {
    return firebaseServices.listen(roomId, "answerLists", callback);
  },

  listenToSpectatorJoin: (roomId: string, callback: (count: number) => void): Unsubscribe => {
    const path = ref(database, `rooms/${roomId}/spectators`);
    return onValue(path, (snapshot) => {
      callback(snapshot.size);
    });
  },

  listenToRules: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "rules", callback);
  },

  listenToRoundRules: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "showRules", callback);
  },

  listenToGridActions: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "rounds", callback);
  },

  listenToUsedPackets: (roomId: string, callback: (topics: string[]) => void) => {
    return firebaseServices.listen(roomId, "usedPackets", callback);
  },

  listenToReturnToTopicSelection: (roomId: string, callback: (shouldReturn: boolean) => void) => {
    return firebaseServices.listen(roomId, "returnToTopicSelection", callback, true);
  },

  findPlayerKey: async (playersRef: DatabaseReference, userId: string, roomId: string) => {
    try {
      const snapshot = await get(playersRef);
      if (snapshot.exists()) {
        const players = snapshot.val();
        for (const key in players) {
          if (players[key].uid === userId) {
            return key;
          }
        }
      }
      throw new Error(`Player with UID ${userId} not found in room ${roomId}`);
    } catch (error) {
      console.error('Error finding player key:', error);
      throw error;
    }
  },

  setupOnDisconnect: async (
    roomId: string,
    userId: string,
    onDisconnectCallback?: () => void
  ): Promise<(() => void) | undefined> => {
    // Reference to the players node
    const playersRef = ref(database, `rooms/${roomId}/players`);

    // Helper function to find the player key by UID
    // const findPlayerKey = async () => {
    //   try {
    //     const snapshot = await get(playersRef);
    //     if (snapshot.exists()) {
    //       const players = snapshot.val();
    //       for (const key in players) {
    //         if (players[key].uid === userId) {
    //           return key;
    //         }
    //       }
    //     }
    //     throw new Error(`Player with UID ${userId} not found in room ${roomId}`);
    //   } catch (error) {
    //     console.error('Error finding player key:', error);
    //     throw error;
    //   }
    // };

    // Main logic
    return firebaseServices.findPlayerKey(playersRef, userId, roomId)
      .then(async (playerKey) => {
        // Reference to the specific player entry
        const userRef = ref(database, `rooms/${roomId}/players/${playerKey}`);
        const disconnectHandler = onDisconnect(userRef);

        await disconnectHandler.update({
          status: "pending",
          pendingRemovalAt: serverTimestamp()
        });

        // Remove the player entry when disconnect happens
        // disconnectHandler
        //   .remove()
        //   .then(() => {
        //     console.log(`onDisconnect handler set for user ${userId} in room ${roomId} at key ${playerKey}`);
        //     if (onDisconnectCallback) onDisconnectCallback();
        //   })
        //   .catch((error) => {
        //     console.error('Failed to set onDisconnect handler:', error);
        //   });

        // Cleanup: cancel onDisconnect
        return () => {
          // disconnectHandler
          //   .cancel()
          //   .then(() => console.log(`onDisconnect handler canceled for user ${userId}`))
          //   .catch((err) => console.error('Failed to cancel onDisconnect handler:', err));
        };
      })
      .catch((error) => {
        console.error('Failed to set up onDisconnect handler:', error);
        return undefined; // Return undefined if player key not found
      });
  }
  ,
  deletePath: async (roomId: string, path: string): Promise<void> => {
    const refPath = ref(database, `rooms/${roomId}/${path}`);
    await remove(refPath);
  },

  removeSpectator: async (path: string): Promise<void> => {
    const spectatorRef = ref(database, path)
    const disconnectHandler = onDisconnect(spectatorRef);


    disconnectHandler
      .remove()
      .then(() => {
        console.log(`onDisconnect handler set for spectator with path ${path}`);
      })
      .catch((error) => {
        console.error("Failed to set onDisconnect handler:", error);
      });
  }
  ,

  startWatchingPendingRemovals: async (roomId: string) => {
    const gracePeriod = 10000; // 10 seconds
    const playersRef = ref(database, `rooms/${roomId}/players`);
    console.log("checking player removal on room", roomId)

    const interval = setInterval(async () => {
      const snapshot = await get(playersRef);
      const now = Date.now();

      snapshot.forEach((playerSnap) => {
        const playerData = playerSnap.val();
        const playerKey = playerSnap.key;

        if (playerData.status === 'pending' && playerData.pendingRemovalAt) {
          const pendingTime = new Date(playerData.pendingRemovalAt).getTime();
          if (now - pendingTime > gracePeriod) {
            console.log(`Removing inactive player ${playerKey}`);
            remove(ref(database, `rooms/${roomId}/players/${playerKey}`));
            remove(ref(database, `rooms/${roomId}/scores/${playerKey}`));
          }
        }
      });
    }, 5000); // run every 5 seconds

    return () => clearInterval(interval); // in case you want to stop it
  }
  ,
  connectOnRejoin: async (roomId: string, uid: string) => {
    const playersRef = ref(database, `rooms/${roomId}/players`);

    const playerKey = await new Promise<string>((resolve, reject) => {
        // Declare unsubscribe with a specific type
        let unsubscribe: () => void;

        try {
            // Assign the unsubscribe function from onValue
            unsubscribe = onValue(
                playersRef,
                (snapshot) => {
                    const players = snapshot.val();
                    if (!players) return;

                    const foundKey = Object.keys(players).find(
                        (key) => players[key]?.uid === uid
                    );

                    if (foundKey) {
                        if (unsubscribe) {
                            unsubscribe(); // Stop listening
                        }
                        resolve(foundKey);
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        } catch (error) {
            reject(error);
        }
    });

    console.log("player key", playerKey);

    console.log("player key", playerKey);
    const playerRef = ref(database, `rooms/${roomId}/players/${playerKey}`)

    await update(playerRef, {
      status: "active",
      pendingRemovalAt: null,
    })
  },
  listenToMedia: (roomId: string, callback: (data: any) => void) => {
    return firebaseServices.listen(roomId, "media", callback, true);
  },
}

export default firebaseServices;