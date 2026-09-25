import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC-7Af8FUqjBmNJy15_53ZGcIs8CLtgDxA",
  authDomain: "gen-lang-client-0487738927.firebaseapp.com",
  projectId: "gen-lang-client-0487738927",
  storageBucket: "gen-lang-client-0487738927.firebasestorage.app",
  messagingSenderId: "165590134715",
  appId: "1:165590134715:web:e7c8d06ea9d6bcf3239e9e",
};

// Initialize Firebase safely for SSR/client
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
