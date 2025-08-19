// Firebase Configuration for Google OAuth
// Note: These are public config values, not secret keys

const firebaseConfig = {
  // You'll need to create a Firebase project and get these values
  // Go to: https://console.firebase.google.com/
  // 1. Create new project: "omni-jimmer-auth"
  // 2. Enable Authentication > Sign-in method > Google
  // 3. Add domain: alecrimcloudwalk.github.io
  // 4. Copy config here
  
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com", 
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be imported in main app)
// import { initializeApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider } from 'firebase/auth';

export { firebaseConfig };
