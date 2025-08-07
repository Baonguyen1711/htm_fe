// import { useEffect, useCallback, useRef } from 'react';
// import { useFirebaseListener } from './firebase/useFirebaseListener';

// interface UseEnhancedPresenceOptions {
//   roomId: string;
//   userId: string;
//   isHost: boolean;
//   onDisconnect?: () => void;
// }

// interface UseEnhancedPresenceReturn {
//   isOnline: boolean;
//   setupPresence: () => void;
//   cleanupPresence: () => void;
// }

// export const useEnhancedPresence = ({
//   roomId,
//   userId,
//   isHost,
//   onDisconnect
// }: UseEnhancedPresenceOptions): UseEnhancedPresenceReturn => {
//   const {
//     setupDisconnect,

//   } = useFirebaseListener();

//   const isOnlineRef = useRef(false);
//   const heartbeatCleanupRef = useRef<(() => void) | undefined>(undefined);
//   const disconnectCleanupRef = useRef<(() => void) | undefined>(undefined);
//   const isInitializedRef = useRef(false);

//   const setupPresence = useCallback(async () => {
//     if (!roomId || !userId || isHost || isInitializedRef.current) return;

//     console.log('🔄 Setting up enhanced presence for user:', userId);

//     try {
//       // Clear any previous refreshing status
//       await clearRefreshingStatus(roomId, userId);
      
//       // Setup disconnect handler with grace period
//       const disconnectCleanup = await setupDisconnect(roomId, userId, onDisconnect);
//       disconnectCleanupRef.current = disconnectCleanup;
      
//       // Setup heartbeat to maintain presence
//       const heartbeatCleanup = setupHeartbeat(roomId, userId);
//       heartbeatCleanupRef.current = heartbeatCleanup;
      
//       isOnlineRef.current = true;
//       isInitializedRef.current = true;
      
//       console.log('✅ Enhanced presence system initialized for user:', userId);
//     } catch (error) {
//       console.error('❌ Failed to initialize presence system:', error);
//     }
//   }, [roomId, userId, isHost, setupDisconnect, setupHeartbeat, clearRefreshingStatus, onDisconnect]);

//   const cleanupPresence = useCallback(() => {
//     if (!isInitializedRef.current) return;

//     console.log('🧹 Cleaning up presence system for user:', userId);
    
//     // Cleanup heartbeat and disconnect handlers
//     if (heartbeatCleanupRef.current) {
//       heartbeatCleanupRef.current();
//       heartbeatCleanupRef.current = undefined;
//     }
    
//     if (disconnectCleanupRef.current) {
//       disconnectCleanupRef.current();
//       disconnectCleanupRef.current = undefined;
//     }
    
//     isOnlineRef.current = false;
//     isInitializedRef.current = false;
//   }, [userId]);

//   // Handle page refresh detection
//   const handleBeforeUnload = useCallback(async () => {
//     if (!roomId || !userId || isHost) return;
    
//     try {
//       // Mark as refreshing to prevent removal during refresh
//       await markAsRefreshing(roomId, userId);
//       console.log('🔄 Marked user as refreshing');
//     } catch (error) {
//       console.error('Failed to mark as refreshing:', error);
//     }
//   }, [roomId, userId, isHost, markAsRefreshing]);

//   // Handle page visibility change (tab switching, minimizing)
//   const handleVisibilityChange = useCallback(async () => {
//     if (!roomId || !userId || isHost) return;
    
//     if (document.hidden) {
//       console.log('📱 Page hidden - maintaining presence');
//     } else {
//       console.log('👁️ Page visible - ensuring presence');
//       try {
//         await clearRefreshingStatus(roomId, userId);
//       } catch (error) {
//         console.error('Failed to clear refreshing status:', error);
//       }
//     }
//   }, [roomId, userId, isHost, clearRefreshingStatus]);

//   // Setup event listeners
//   useEffect(() => {
//     if (!roomId || !userId || isHost) return;

//     // Add event listeners
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     return () => {
//       // Remove event listeners
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [roomId, userId, isHost, handleBeforeUnload, handleVisibilityChange]);

//   // Auto-setup presence when dependencies change
//   useEffect(() => {
//     if (roomId && userId && !isHost) {
//       setupPresence();
//     }

//     return () => {
//       cleanupPresence();
//     };
//   }, [roomId, userId, isHost, setupPresence, cleanupPresence]);

//   return {
//     isOnline: isOnlineRef.current,
//     setupPresence,
//     cleanupPresence
//   };
// };

// export default useEnhancedPresence;
