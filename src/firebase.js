// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXpVcG2XLD0stRala52FfrTs2zbdATgWA",
  authDomain: "bluediamond-21728.firebaseapp.com",
  projectId: "bluediamond-21728",
  storageBucket: "bluediamond-21728.appspot.com",
  messagingSenderId: "1031493166484",
  appId: "1:1031493166484:web:bca3f7541e0439f1805b81",
  measurementId: "G-LB16DKEYHB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
