import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
//sign up
export const doCreateUserWithEmailAndPassword = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
//sign in
export const doSignInWithEmailAndPassword = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

//sign out
export const doSignOut = () => signOut(auth);

//## below are two more functions, for resetting or changing passwords ##

//password change
export const doPasswordChange = (password) => updatePassword(auth.currentUser, password);

export const dogoogleSignIn = () => signInWithPopup(auth, googleProvider);
