// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCO9B_wuPKcIRgewt9DCy0SgMwOm7IXoa4",
  authDomain: "appmuniles.firebaseapp.com",
  projectId: "appmuniles",
  storageBucket: "appmuniles.appspot.com",
  messagingSenderId: "634140732676",
  appId: "1:634140732676:web:f35a19368cf3424c3c3451"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);