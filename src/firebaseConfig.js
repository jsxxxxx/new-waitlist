import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-Tp-s6Rwpee1DkXm26DBvkPqMYE4IqGw",
  authDomain: "new-abbascuss.firebaseapp.com",
  projectId: "new-abbascuss",
  storageBucket: "new-abbascuss.firebasestorage.app",
  messagingSenderId: "941478316109",
  appId: "1:941478316109:web:14d15d7fe6d25d40b37404",
  measurementId: "G-V1ENZZYCXJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
