// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdrw5rX4GBLQA1Hftr5WvnSwHX_bj7Bn0",
  authDomain: "fbla-mobile-4d6e3.firebaseapp.com",
  projectId: "fbla-mobile-4d6e3",
  storageBucket: "fbla-mobile-4d6e3.firebasestorage.app",
  messagingSenderId: "609929572812",
  appId: "1:609929572812:web:3e76ddd1c1287f6d982d69",
  measurementId: "G-BY2M8BJD7E"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);