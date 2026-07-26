import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3Ecq1xExqQxt7k9nTf_4nFLp5X7J9N3s",
  authDomain: "asd-judo-bagno-a-ripoli.firebaseapp.com",
  projectId: "asd-judo-bagno-a-ripoli",
  storageBucket: "asd-judo-bagno-a-ripoli.firebasestorage.app",
  messagingSenderId: "486008679123",
  appId: "1:486008679123:web:e6e89235f7776cd4c4c226"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };