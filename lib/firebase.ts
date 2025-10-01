// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8YGAReHeU9LZa64X-MUY5x4JxlbYy0-4",
  authDomain: "relatorios-app-93aee.firebaseapp.com",
  projectId: "relatorios-app-93aee",
  storageBucket: "relatorios-app-93aee.firebasestorage.app",
  messagingSenderId: "755495500516",
  appId: "1:755495500516:web:b4262cc77f975866d90af1",
  measurementId: "G-SFMZTLCCE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

export default app;
