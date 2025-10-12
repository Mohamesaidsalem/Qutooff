import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCppSR5X4nyq5fnHdl05SSFprRD1CMkHp8",
  authDomain: "qutooff-academy.firebaseapp.com",
  databaseURL: "https://qutooff-academy-default-rtdb.firebaseio.com",
  projectId: "qutooff-academy",
  storageBucket: "qutooff-academy.firebasestorage.app",
  messagingSenderId: "260160475189",
  appId: "1:260160475189:web:dccc3c2e3c0d5786dee17c",
  measurementId: "G-9XX21452NL"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app; 