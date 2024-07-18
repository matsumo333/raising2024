// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWkoGKrpKUgLk4DgL-CJd-cSWtUpwGaSM",
  authDomain: "raising2024-7e234.firebaseapp.com",
  projectId: "raising2024-7e234",
  storageBucket: "raising2024-7e234.appspot.com",
  messagingSenderId: "761476049532",
  appId: "1:761476049532:web:6a7984ac55d87c32eb77f9",
  measurementId: "G-Y3PPW1KW6X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
