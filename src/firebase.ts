import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD27j39Pq1NgQ2QkvQECCD5qR3Yz9LA6nc",
  authDomain: "nimble-emissary-ghh41.firebaseapp.com",
  projectId: "nimble-emissary-ghh41",
  storageBucket: "nimble-emissary-ghh41.firebasestorage.app",
  messagingSenderId: "880598690003",
  appId: "1:880598690003:web:9f53935078d6ddcff1cc26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "ai-studio-5271f8ff-be9d-4178-b470-29cd92022543");
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
