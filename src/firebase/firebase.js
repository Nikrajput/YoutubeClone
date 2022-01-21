import firebase from "firebase/compat/app";
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider,} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};
if (!firebase.apps.length) {
  //initializing with the config object
  firebase.initializeApp(firebaseConfig);
}

const firebaseApp = initializeApp(firebaseConfig);

// ** Modulerized Firebase ** //
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

let user = auth.currentUser;
const googleProvider = new GoogleAuthProvider();


export {
  user,
  db,
  auth,
  firebaseApp as firebase,
  googleProvider,
  storage,
};
