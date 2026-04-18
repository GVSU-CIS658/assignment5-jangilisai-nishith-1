import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvD-OzmZURdn27mtwq7EY39nRPu7PXHf0",
  authDomain: "assignmentweb5-6e5b4.firebaseapp.com",
  projectId: "assignmentweb5-6e5b4",
  storageBucket: "assignmentweb5-6e5b4.firebasestorage.app",
  messagingSenderId: "579508949332",
  appId: "1:579508949332:web:c481ae9c285b528cdb38c1",
  measurementId: "G-8NTSF8GTH6"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
