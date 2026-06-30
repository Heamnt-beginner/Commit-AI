import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB1wFzx0aVIVt-d64VTcX1qTyOHGFDWJPg",
  authDomain: "commit-ai-vibe.firebaseapp.com",
  projectId: "commit-ai-vibe",
  storageBucket: "commit-ai-vibe.firebasestorage.app",
  messagingSenderId: "82901522745",
  appId: "1:82901522745:web:2e46525ae45eb62f5a70e8",
  measurementId: "G-PZ5CKJ0JWY"
};

// Initialize Firebase for SSR compatibility
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
