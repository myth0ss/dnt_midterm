// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4MroEFtYDD-pVLAqwUnB7QCXEVdqC87o",
  authDomain: "productmanagement-aa0e8.firebaseapp.com",
  projectId: "productmanagement-aa0e8",
  storageBucket: "productmanagement-aa0e8.firebasestorage.app",
  messagingSenderId: "477810789899",
  appId: "1:477810789899:web:75d5f6e66e08ce104c010e",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

export const auth = getAuth(app);
