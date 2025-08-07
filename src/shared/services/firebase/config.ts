import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  appId: process.env.REACT_APP_APP_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL
};

console.log("firebaseConfig", firebaseConfig)

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

export default app;
