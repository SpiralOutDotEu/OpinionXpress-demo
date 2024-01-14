// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOZ4UX3zFZ7OxKFcVL4CKQT2Fx707pBFE",
  authDomain: "opinionxpress-d5c21.firebaseapp.com",
  projectId: "opinionxpress-d5c21",
  storageBucket: "opinionxpress-d5c21.appspot.com",
  messagingSenderId: "1019406049260",
  appId: "1:1019406049260:web:210918b10caff68b94eac9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

export {app, auth}