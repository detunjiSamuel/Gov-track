import firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyDzF3ufuKUTJwEThiUzaggUU40qy21Nqzk",
  authDomain: "quizapptypescriptpwa.firebaseapp.com",
  databaseURL: "https://quizapptypescriptpwa.firebaseio.com",
  projectId: "quizapptypescriptpwa",
  storageBucket: "quizapptypescriptpwa.appspot.com",
  messagingSenderId: "29230227622",
  appId: "1:29230227622:web:fc9aef0e7b5fcc1cca5467",
  measurementId: "G-YND4GFGWYV",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
export default firebase;
