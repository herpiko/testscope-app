import firebase from 'firebase';

// Firebase instance will be initialized after config is loaded
let firebaseInstance = null;
let initPromise = null;

// Load Firebase config from public directory at runtime
const initializeFirebase = async () => {
  if (firebaseInstance) {
    return firebaseInstance;
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    try {
      const response = await fetch('/firebase-config.json');
      const firebaseConfig = await response.json();
      
      // Initialize Firebase with the loaded config
      if (firebaseConfig) {
        firebase.initializeApp(firebaseConfig);
        firebaseInstance = {
          database: firebase.database(),
          auth: firebase.auth(),
          provider: new firebase.auth.GoogleAuthProvider(),
          storage: firebase.storage(),
        };
        return firebaseInstance;
      }
    } catch (error) {
      console.error('Failed to load Firebase config:', error);
      throw error;
    }
  })();
  
  return initPromise;
};

// Export the initialization function
export default {
  init: initializeFirebase
};
