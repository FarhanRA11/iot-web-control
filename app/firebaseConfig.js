// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSWPUheHjFz7U1iE-Thbo6ki_jfgOhlS0",
  authDomain: "iot-project-5761a.firebaseapp.com",
  databaseURL: "https://iot-project-5761a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-project-5761a",
  storageBucket: "iot-project-5761a.firebasestorage.app",
  messagingSenderId: "943124515933",
  appId: "1:943124515933:web:be2a4dd32e23b4dcdf51b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database }