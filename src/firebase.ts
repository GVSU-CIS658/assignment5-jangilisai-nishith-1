import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7TnA1D10nlyZ1NbZ4Vaic8vXq3bKYkKE",
  authDomain: "assignment5-47c68.firebaseapp.com",
  projectId: "assignment5-47c68",
  storageBucket: "assignment5-47c68.firebasestorage.app",
  messagingSenderId: "219638563287",
  appId: "1:219638563287:web:6c6930e69fd938cb864b92",
  measurementId: "G-ENFYZMFMMQ"
};

const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);
