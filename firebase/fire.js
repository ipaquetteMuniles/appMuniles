import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const recaptchaKey = '6LdKUtwpAAAAAEXv1hArBYrM4y3haed6k82zlU2Y'

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

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(recaptchaKey),
  isTokenAutoRefreshEnabled: true
});

export const auth = getAuth(app);
export const db = getFirestore(app);