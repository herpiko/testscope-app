import firebase from 'firebase';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""

};

firebase.initializeApp(firebaseConfig);

export default {
	database: firebase.database(),
	auth: firebase.auth(),
	provider: new firebase.auth.GoogleAuthProvider(),
	storage: firebase.storage(),
};
