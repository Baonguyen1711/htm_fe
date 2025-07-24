// Firebase configuration (migrated from existing firebase-config.ts)
import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - using actual config from existing firebase-config.ts
const firebaseConfig = {
  apiKey: "AIzaSyDQ85ZOo4kgfXrhI-aeJbr-08ykydG3ZE8",
  authDomain: "htm-be.firebaseapp.com",
  projectId: "htm-be",
  appId: "1:508443789197:web:c900e6305300e355be9fc4",
  databaseURL: "https://htm-be-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

export default app;
