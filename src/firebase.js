
import {getAuth} from "firebase/auth";
import { getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore";


import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyAfreRvB-Tea9qYiuVhzm52WfEfesqqatE",
  authDomain: "chatspark-b1a8c.firebaseapp.com",
  projectId: "chatspark-b1a8c",
  storageBucket: "chatspark-b1a8c.appspot.com",
  messagingSenderId: "210161890027",
  appId: "1:210161890027:web:c01ce6a68c1efe63ed44ae"
};

export const app = initializeApp(firebaseConfig);
export const auth  = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
