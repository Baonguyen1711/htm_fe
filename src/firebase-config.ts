// firebase-config.js
import { FirebaseApp, initializeApp } from "firebase/app";
import { getDatabase, Database, ref, onValue, set  } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDQ85ZOo4kgfXrhI-aeJbr-08ykydG3ZE8", //removed the +""
  authDomain: "htm-be.firebaseapp.com",
  projectId: "htm-be",
  appId: "1:508443789197:web:c900e6305300e355be9fc4",
  databaseURL: "https://htm-be-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database: Database  = getDatabase(app);

export { app, database, ref, onValue, set }; // Export both app and database