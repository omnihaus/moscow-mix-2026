import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzy5WSDJ8gc_WKPHb0GwrxLeIbslbem-U",
  authDomain: "moscowmix-web.firebaseapp.com",
  projectId: "moscowmix-web",
  storageBucket: "moscowmix-web.firebasestorage.app",
  messagingSenderId: "399364599390",
  appId: "1:399364599390:web:ec89aacb9d936769c38ecf",
  measurementId: "G-3QT4XQYCSF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Database and Storage so the rest of the app can use them
export const db = getFirestore(app);
export const storage = getStorage(app);